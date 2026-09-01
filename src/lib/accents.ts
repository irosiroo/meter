import type { AccentKey } from "./calc/types";

/**
 * Per-accent class strings. Written as complete literals (never interpolated)
 * so Tailwind's scanner keeps them, and a matching hex for inline glows / the
 * document theme-color. One accent per category gives the product a coherent
 * yet varied identity.
 */
export interface Accent {
  text: string;
  chip: string;
  ring: string;
  gradient: string;
  softBg: string;
  border: string;
  hex: string;
}

export const ACCENTS: Record<AccentKey, Accent> = {
  blue: {
    text: "text-blue-600 dark:text-blue-300",
    chip: "bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20",
    ring: "ring-blue-500/30",
    gradient: "from-blue-500 to-indigo-600",
    softBg: "bg-blue-500/10",
    border: "border-blue-500/30",
    hex: "#2450eb",
  },
  cyan: {
    text: "text-cyan-600 dark:text-cyan-300",
    chip: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500/20",
    ring: "ring-cyan-500/30",
    gradient: "from-cyan-400 to-blue-600",
    softBg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    hex: "#06b6d4",
  },
  indigo: {
    text: "text-indigo-600 dark:text-indigo-300",
    chip: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20",
    ring: "ring-indigo-500/30",
    gradient: "from-indigo-500 to-violet-600",
    softBg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    hex: "#4f46e5",
  },
  violet: {
    text: "text-violet-600 dark:text-violet-300",
    chip: "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/20",
    ring: "ring-violet-500/30",
    gradient: "from-violet-500 to-fuchsia-600",
    softBg: "bg-violet-500/10",
    border: "border-violet-500/30",
    hex: "#8b5cf6",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-300",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20",
    ring: "ring-emerald-500/30",
    gradient: "from-emerald-500 to-teal-600",
    softBg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    hex: "#10b981",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-300",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20",
    ring: "ring-amber-500/30",
    gradient: "from-amber-400 to-orange-600",
    softBg: "bg-amber-500/10",
    border: "border-amber-500/30",
    hex: "#f59e0b",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-300",
    chip: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20",
    ring: "ring-rose-500/30",
    gradient: "from-rose-500 to-pink-600",
    softBg: "bg-rose-500/10",
    border: "border-rose-500/30",
    hex: "#f43f5e",
  },
  teal: {
    text: "text-teal-600 dark:text-teal-300",
    chip: "bg-teal-500/10 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/20",
    ring: "ring-teal-500/30",
    gradient: "from-teal-400 to-emerald-600",
    softBg: "bg-teal-500/10",
    border: "border-teal-500/30",
    hex: "#14b8a6",
  },
};

export const accent = (key: AccentKey): Accent => ACCENTS[key] ?? ACCENTS.blue;
