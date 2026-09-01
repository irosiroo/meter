"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn, copyText } from "@/lib/utils";
import type { Output, Row, Tone } from "@/lib/calc/types";

const toneText: Record<Tone, string> = {
  primary: "text-fg",
  default: "text-fg",
  muted: "text-fg-muted",
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-rose-600 dark:text-rose-400",
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? "Copy result"}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle hover:text-fg hover:bg-[rgb(var(--surface)/0.6)] transition-colors"
    >
      {done ? <Check size={16} className="text-emerald-500" /> : <Copy size={15} />}
    </button>
  );
}

function PrimaryRow({ row }: { row: Row }) {
  return (
    <div className="relative overflow-hidden rounded-2xl instrument px-5 py-4 text-white">
      <div className="blueprint absolute inset-0 opacity-40" aria-hidden />
      <div className="relative min-w-0">
        <div className="text-[13px] uppercase tracking-wide text-white/55">{row.label}</div>
        <output className="mt-1 block truncate text-3xl sm:text-4xl font-semibold tracking-tight tnum text-white">
          {row.value}
        </output>
        {row.hint && <div className="mt-1 text-sm text-white/60">{row.hint}</div>}
      </div>
    </div>
  );
}

export function ResultView({ output, error }: { output: Output | null; error?: string | null }) {
  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/8 px-4 py-3.5 text-sm text-rose-600 dark:text-rose-300">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }
  if (!output) return null;

  const primaries = output.rows.filter((r) => r.tone === "primary");
  const rest = output.rows.filter((r) => r.tone !== "primary");

  return (
    <div className="space-y-4">
      {primaries.map((row) => (
        <AnimatePresence mode="wait" key={row.label}>
          <motion.div
            key={row.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <PrimaryRow row={row} />
          </motion.div>
        </AnimatePresence>
      ))}

      {rest.length > 0 && (
        <dl className="divide-y divide-[rgb(var(--line)/0.1)] rounded-2xl bg-sunken/60 px-4">
          {rest.map((row, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-fg-muted">{row.label}</dt>
              <dd className={cn("text-sm font-semibold tnum text-right tabular-nums", toneText[row.tone ?? "default"])}>
                {row.value}
                {row.hint && <span className="ml-2 font-normal text-fg-subtle">{row.hint}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {output.bars && output.bars.length > 0 && (
        <div className="space-y-3 rounded-2xl bg-sunken/60 p-4">
          {output.bars.map((bar, i) => {
            const max = bar.max ?? Math.max(...output.bars!.map((b) => b.value), 1);
            const pct = Math.max(0, Math.min(100, (bar.value / max) * 100));
            return (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-fg-muted">{bar.label}</span>
                  <span className={cn("font-semibold tnum", toneText[bar.tone ?? "default"])}>
                    {bar.hint ?? bar.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--line)/0.12)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      bar.tone === "good" && "bg-emerald-500",
                      bar.tone === "warn" && "bg-amber-500",
                      bar.tone === "bad" && "bg-rose-500",
                      (!bar.tone || bar.tone === "default" || bar.tone === "primary" || bar.tone === "muted") &&
                        "bg-gradient-to-r from-brand-500 to-flux-400",
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {output.table && (
        <div className="overflow-x-auto rounded-2xl border border-[rgb(var(--line)/0.1)]">
          <table className="w-full text-sm">
            {output.table.caption && (
              <caption className="px-4 pt-3 pb-1 text-left text-xs text-fg-subtle">
                {output.table.caption}
              </caption>
            )}
            <thead>
              <tr className="border-b border-[rgb(var(--line)/0.12)] text-left text-fg-subtle">
                {output.table.head.map((h, i) => (
                  <th key={i} className={cn("px-4 py-2 font-medium", i > 0 && "text-right")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {output.table.rows.map((r, ri) => (
                <tr key={ri} className="border-b border-[rgb(var(--line)/0.06)] last:border-0">
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        "px-4 py-2 tnum",
                        ci === 0 ? "text-fg-muted" : "text-right font-medium text-fg",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {output.steps && output.steps.length > 0 && (
        <ol className="space-y-1.5 rounded-2xl bg-sunken/60 p-4 text-sm">
          {output.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/12 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                {i + 1}
              </span>
              <span className="text-fg-muted tnum">{step}</span>
            </li>
          ))}
        </ol>
      )}

      {output.note && <p className="text-sm text-fg-subtle leading-relaxed">{output.note}</p>}
    </div>
  );
}

export { CopyButton };
