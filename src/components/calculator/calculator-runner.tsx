"use client";

import { motion } from "framer-motion";
import { Check, Copy, Equal, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldControl } from "@/components/calculator/field-control";
import { ResultView } from "@/components/calculator/result-view";
import { ScientificCalculator } from "@/components/calculator/scientific-calculator";
import { useMeterStore } from "@/lib/store/meter-store";
import { coerce, isVisible, runCompute } from "@/lib/calc/runtime";
import { copyText } from "@/lib/utils";
import type { CalcSpec, Field, Vals } from "@/lib/calc/types";

type Raw = Record<string, string | boolean>;

function initRaw(fields: Field[]): Raw {
  const r: Raw = {};
  for (const f of fields) {
    const kind = f.kind ?? "number";
    if (kind === "toggle") r[f.key] = Boolean(f.def);
    else r[f.key] = f.def === undefined ? "" : String(f.def);
  }
  return r;
}

function summarise(fields: Field[], raw: Raw): string {
  return fields
    .filter((f) => isVisible(f, coerceAll(fields, raw)))
    .map((f) => {
      const v = raw[f.key];
      if (typeof v === "boolean") return `${f.label}: ${v ? "yes" : "no"}`;
      const opt = f.options?.find((o) => o.value === v);
      return `${f.label}: ${opt ? opt.label : v}${f.unit ? ` ${f.unit}` : ""}`;
    })
    .join(" · ")
    .slice(0, 160);
}

function coerceAll(fields: Field[], raw: Raw): Vals {
  const v: Vals = {};
  for (const f of fields) v[f.key] = coerce(f, raw[f.key]);
  return v;
}

export function CalculatorRunner({ spec }: { spec: CalcSpec }) {
  const markUsed = useMeterStore((s) => s.markUsed);
  const pushHistory = useMeterStore((s) => s.pushHistory);

  useEffect(() => {
    markUsed(spec.id);
  }, [spec.id, markUsed]);

  if (spec.custom === "scientific") {
    return <ScientificCalculator spec={spec} />;
  }
  return <GenericRunner spec={spec} pushHistory={pushHistory} />;
}

function GenericRunner({
  spec,
  pushHistory,
}: {
  spec: CalcSpec;
  pushHistory: ReturnType<typeof useMeterStore.getState>["pushHistory"];
}) {
  const [raw, setRaw] = useState<Raw>(() => initRaw(spec.fields));
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(0);
  const liveRef = useRef<HTMLDivElement>(null);

  const vals = useMemo(() => coerceAll(spec.fields, raw), [spec.fields, raw]);
  const visible = spec.fields.filter((f) => isVisible(f, vals));
  const result = useMemo(() => runCompute(spec.compute, vals), [spec.compute, vals]);

  const primary = result.ok ? result.output.rows.find((r) => r.tone === "primary") ?? result.output.rows[0] : null;

  const reset = () => {
    setRaw(initRaw(spec.fields));
    setFlash((f) => f + 1);
  };

  const calculate = () => {
    setFlash((f) => f + 1);
    if (result.ok && primary) {
      pushHistory({
        slug: spec.id,
        name: spec.name,
        category: spec.category,
        input: summarise(spec.fields, raw),
        result: `${primary.label} = ${primary.value}`,
      });
    }
  };

  const copyResult = async () => {
    if (primary && (await copyText(primary.value))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <div className="glass-strong rounded-3xl p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((f, i) => (
            <FieldControl
              key={f.key}
              field={f}
              value={raw[f.key] ?? ""}
              autoFocus={i === 0}
              onChange={(v) => setRaw((prev) => ({ ...prev, [f.key]: v }))}
              onEnter={calculate}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" size="lg" onClick={calculate} className="flex-1 min-w-[10rem]">
            <Equal size={18} /> Calculate
          </Button>
          <Button variant="outline" size="lg" onClick={reset} aria-label="Reset inputs">
            <RotateCcw size={17} /> Reset
          </Button>
        </div>
      </div>

      {/* Result */}
      <div className="glass-strong rounded-3xl p-5 sm:p-6" ref={liveRef}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Result</h3>
          {primary && (
            <button
              type="button"
              onClick={copyResult}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-fg-muted hover:text-fg hover:bg-[rgb(var(--surface)/0.6)] transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <motion.div key={flash} initial={flash ? { opacity: 0.6 } : false} animate={{ opacity: 1 }}>
          <div aria-live="polite">
            <ResultView output={result.ok ? result.output : null} error={result.ok ? null : result.error} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
