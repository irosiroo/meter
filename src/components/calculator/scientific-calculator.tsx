"use client";

import { motion } from "framer-motion";
import { Check, Copy, History, Trash2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useMeterStore } from "@/lib/store/meter-store";
import { autoClose, formatResult, tryEvaluate, type AngleMode } from "@/lib/math/engine";
import { copyText } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CalcSpec } from "@/lib/calc/types";

interface KeyDef {
  label: string;
  label2?: string;
  ins?: string;
  ins2?: string;
  act?: "eq" | "clear" | "back" | "ans" | "mem";
  starter?: boolean;
  tone?: "num" | "op" | "fn" | "eq" | "warn";
  span?: 2;
}

const ROWS: KeyDef[][] = [
  [
    { label: "2nd", act: "mem", tone: "fn" }, // placeholder replaced below (handled specially)
    { label: "(", ins: "(", starter: true, tone: "fn" },
    { label: ")", ins: ")", tone: "fn" },
    { label: "⌫", act: "back", tone: "warn" },
    { label: "C", act: "clear", tone: "warn" },
  ],
  [
    { label: "sin", label2: "sin⁻¹", ins: "sin(", ins2: "asin(", starter: true, tone: "fn" },
    { label: "cos", label2: "cos⁻¹", ins: "cos(", ins2: "acos(", starter: true, tone: "fn" },
    { label: "tan", label2: "tan⁻¹", ins: "tan(", ins2: "atan(", starter: true, tone: "fn" },
    { label: "π", ins: "π", starter: true, tone: "fn" },
    { label: "÷", ins: "÷", tone: "op" },
  ],
  [
    { label: "ln", label2: "eˣ", ins: "ln(", ins2: "e^", starter: true, tone: "fn" },
    { label: "log", label2: "10ˣ", ins: "log(", ins2: "10^", starter: true, tone: "fn" },
    { label: "√", label2: "∛", ins: "√(", ins2: "∛(", starter: true, tone: "fn" },
    { label: "e", ins: "e", starter: true, tone: "fn" },
    { label: "×", ins: "×", tone: "op" },
  ],
  [
    { label: "7", ins: "7", starter: true, tone: "num" },
    { label: "8", ins: "8", starter: true, tone: "num" },
    { label: "9", ins: "9", starter: true, tone: "num" },
    { label: "xʸ", ins: "^", tone: "fn" },
    { label: "−", ins: "−", tone: "op" },
  ],
  [
    { label: "4", ins: "4", starter: true, tone: "num" },
    { label: "5", ins: "5", starter: true, tone: "num" },
    { label: "6", ins: "6", starter: true, tone: "num" },
    { label: "x²", label2: "x³", ins: "²", ins2: "³", tone: "fn" },
    { label: "+", ins: "+", tone: "op" },
  ],
  [
    { label: "1", ins: "1", starter: true, tone: "num" },
    { label: "2", ins: "2", starter: true, tone: "num" },
    { label: "3", ins: "3", starter: true, tone: "num" },
    { label: "x!", ins: "!", tone: "fn" },
    { label: "%", ins: "%", tone: "op" },
  ],
  [
    { label: "0", ins: "0", starter: true, tone: "num" },
    { label: ".", ins: ".", starter: true, tone: "num" },
    { label: "Ans", act: "ans", tone: "fn" },
    { label: "=", act: "eq", tone: "eq", span: 2 },
  ],
];

const toneClass: Record<NonNullable<KeyDef["tone"]>, string> = {
  num: "bg-white/8 text-white hover:bg-white/14",
  op: "bg-brand-500/22 text-brand-50 hover:bg-brand-500/32",
  fn: "bg-white/[0.045] text-flux-300 hover:bg-white/10 text-[15px]",
  eq: "bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold shadow-lg shadow-brand-900/40 hover:brightness-110",
  warn: "bg-rose-500/16 text-rose-200 hover:bg-rose-500/26",
};

function KeyButton({ def, second, onPress }: { def: KeyDef; second: boolean; onPress: (d: KeyDef) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const label = second && def.label2 ? def.label2 : def.label;
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        const el = ref.current;
        if (el) {
          el.dataset.flash = "true";
          window.setTimeout(() => el && (el.dataset.flash = "false"), 130);
        }
        onPress(def);
      }}
      className={cn(
        "key h-13 sm:h-14 rounded-2xl text-lg tabular-nums",
        toneClass[def.tone ?? "num"],
        def.span === 2 && "col-span-2",
      )}
    >
      {label}
    </button>
  );
}

interface LocalEntry {
  expr: string;
  value: number;
}

const fmtEntry = (n: number) => (Number.isFinite(n) ? String(n) : "0");

export function ScientificCalculator({ spec }: { spec: CalcSpec }) {
  const pushHistory = useMeterStore((s) => s.pushHistory);
  const [input, setInput] = useState("");
  const [angle, setAngle] = useState<AngleMode>("deg");
  const [second, setSecond] = useState(false);
  const [memory, setMemory] = useState(0);
  const [ans, setAns] = useState(0);
  const [justEval, setJustEval] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [log, setLog] = useState<LocalEntry[]>([]);

  const preview = useMemo(() => {
    if (!input.trim()) return null;
    const r = tryEvaluate(autoClose(input), { angle, ans, mem: memory });
    return r.ok ? formatResult(r.value) : null;
  }, [input, angle, ans, memory]);

  const insert = useCallback(
    (token: string, starter?: boolean) => {
      setError(null);
      setInput((prev) => {
        if (justEval) {
          setJustEval(false);
          return (starter ? "" : prev) + token;
        }
        return prev + token;
      });
    },
    [justEval],
  );

  const equals = useCallback(() => {
    if (!input.trim()) return;
    const r = tryEvaluate(autoClose(input), { angle, ans, mem: memory });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setAns(r.value);
    setLog((l) => [{ expr: input, value: r.value }, ...l].slice(0, 40));
    pushHistory({
      slug: spec.id,
      name: spec.name,
      category: spec.category,
      input,
      result: formatResult(r.value),
    });
    setInput(fmtEntry(r.value));
    setJustEval(true);
    setError(null);
  }, [input, angle, ans, memory, pushHistory, spec]);

  const press = useCallback(
    (d: KeyDef) => {
      if (d.act === "eq") return equals();
      if (d.act === "clear") {
        setInput("");
        setError(null);
        setJustEval(false);
        return;
      }
      if (d.act === "back") {
        setError(null);
        setInput((p) => p.slice(0, -1));
        return;
      }
      if (d.act === "ans") return insert("Ans", true);
      const token = second && d.ins2 ? d.ins2 : d.ins;
      if (token) insert(token, d.starter);
      if (second) setSecond(false);
    },
    [equals, insert, second],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      equals();
    } else if (e.key === "Escape") {
      setInput("");
      setError(null);
    }
  };

  const memAct = (kind: "mc" | "mr" | "mplus" | "mminus") => {
    if (kind === "mc") return setMemory(0);
    if (kind === "mr") return insert(fmtEntry(memory), true);
    const r = tryEvaluate(autoClose(input || "0"), { angle, ans, mem: memory });
    if (!r.ok) return;
    setMemory((m) => (kind === "mplus" ? m + r.value : m - r.value));
  };

  const copyResult = async () => {
    const text = preview ?? input;
    if (text && (await copyText(text))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      {/* Calculator */}
      <div className="instrument rounded-[1.75rem] p-4 sm:p-5">
        {/* Display */}
        <div className="relative overflow-hidden rounded-2xl bg-black/25 px-4 py-4 ring-1 ring-white/5">
          <div className="blueprint absolute inset-0 opacity-30" aria-hidden />
          <div className="relative">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-white/40">
              <span className="flex items-center gap-2">
                <span className={cn(memory !== 0 && "text-flux-300")}>M{memory !== 0 ? "•" : ""}</span>
                <span>{angle === "deg" ? "DEG" : "RAD"}</span>
                {second && <span className="text-flux-300">2nd</span>}
              </span>
              <button
                onClick={copyResult}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-white/40 hover:text-white/80 transition-colors"
                aria-label="Copy result"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
                setJustEval(false);
              }}
              onKeyDown={onKeyDown}
              inputMode="none"
              spellCheck={false}
              autoComplete="off"
              placeholder="0"
              aria-label="Expression"
              className="mt-2 w-full bg-transparent text-right text-3xl sm:text-[2.4rem] font-semibold tracking-tight text-white outline-none tnum placeholder:text-white/25"
            />
            <div className="mt-1 h-6 text-right text-lg text-white/50 tnum">
              {error ? (
                <span className="text-rose-300 text-sm">{error}</span>
              ) : preview && !justEval ? (
                <span>= {preview}</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mode + memory bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-white/5 p-0.5 text-xs font-medium">
            {(["deg", "rad"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAngle(m)}
                className={cn(
                  "rounded-lg px-3 py-1.5 uppercase tracking-wide transition-colors",
                  angle === m ? "bg-brand-500 text-white" : "text-white/50 hover:text-white/80",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSecond((s) => !s)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
              second ? "bg-flux-500 text-white" : "bg-white/5 text-white/50 hover:text-white/80",
            )}
          >
            2nd
          </button>
          <div className="ml-auto flex gap-1">
            {([
              ["MC", "mc"],
              ["MR", "mr"],
              ["M+", "mplus"],
              ["M−", "mminus"],
            ] as const).map(([label, kind]) => (
              <button
                key={kind}
                onClick={() => memAct(kind)}
                className="key rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/12"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Keypad */}
        <div className="mt-3 grid grid-cols-5 gap-2">
          {ROWS.map((row, ri) =>
            row.map((def, ci) =>
              // The first cell is the 2nd toggle — render as a live toggle button.
              ri === 0 && ci === 0 ? (
                <button
                  key="2nd-key"
                  type="button"
                  onClick={() => setSecond((s) => !s)}
                  className={cn(
                    "key h-13 sm:h-14 rounded-2xl text-[15px] font-semibold",
                    second ? "bg-flux-500 text-white" : "bg-white/[0.045] text-flux-300 hover:bg-white/10",
                  )}
                >
                  2nd
                </button>
              ) : (
                <KeyButton key={`${ri}-${ci}`} def={def} second={second} onPress={press} />
              ),
            ),
          )}
        </div>
      </div>

      {/* Session log */}
      <div className="glass-strong rounded-[1.75rem] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <History size={16} className="text-brand-500" /> Session history
          </h3>
          {log.length > 0 && (
            <button
              onClick={() => setLog([])}
              className="inline-flex items-center gap-1 text-xs text-fg-subtle hover:text-rose-500 transition-colors"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-fg-subtle leading-relaxed">
            Your calculations appear here. Tap any entry to reuse it. Type directly, or use the keypad —
            it supports π, e, factorials, powers and both angle modes.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {log.map((e, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => {
                    setInput(e.expr);
                    setJustEval(false);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-right hover:bg-[rgb(var(--surface)/0.6)] transition-colors"
                >
                  <span className="block truncate text-xs text-fg-subtle tnum">{e.expr}</span>
                  <span className="block truncate text-base font-semibold text-fg tnum">
                    = {formatResult(e.value)}
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
