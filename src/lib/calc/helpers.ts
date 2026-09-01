/**
 * METER · calculation helpers
 * ---------------------------------------------------------------------------
 * Formatting + row builders + numeric primitives shared by all 309 tools.
 * Pure, dependency-free and deterministic so `scripts/verify.ts` can assert
 * exact output strings.
 */

import type { Output, Row, Tone } from "./types";

/* ------------------------------------------------------------------ errors */

/** Domain error surfaced to the user as an inline result message. */
export class CalcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalcError";
  }
}

/** Abort a computation with a friendly message. */
export function fail(message: string): never {
  throw new CalcError(message);
}

/** Guard: value must be a finite number. */
export function need(n: number, label: string): number {
  if (typeof n !== "number" || !Number.isFinite(n)) fail(`Enter a valid number for ${label}.`);
  return n;
}

/** Guard: value must be > 0. */
export function needPos(n: number, label: string): number {
  need(n, label);
  if (n <= 0) fail(`${label} must be greater than zero.`);
  return n;
}

/** Guard: value must be >= 0. */
export function needNonNeg(n: number, label: string): number {
  need(n, label);
  if (n < 0) fail(`${label} cannot be negative.`);
  return n;
}

/* -------------------------------------------------------------- formatting */

const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "-": "⁻", "+": "",
};

/** Superscript an integer exponent: 12 → "¹²". */
export function sup(exp: number | string): string {
  return String(exp)
    .split("")
    .map((c) => SUP[c] ?? c)
    .join("");
}

/** Scientific notation with a real multiplication sign: 1.24×10⁻⁵ */
export function sci(n: number, dp = 4): string {
  if (n === 0) return "0";
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "−∞";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mant = n / Math.pow(10, exp);
  return `${trim(mant.toFixed(dp))}×10${sup(exp)}`;
}

/** Decimal-correct rounding (immune to the classic 1.005 binary artefact). */
export function round(n: number, dp = 0): number {
  if (!Number.isFinite(n)) return n;
  const p = Math.min(20, Math.max(0, Math.trunc(dp)));
  const nudged = n + Math.sign(n) * Math.abs(n) * Number.EPSILON * 4;
  return parseFloat(nudged.toFixed(p));
}

function trim(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/**
 * Human number formatting with thousands separators.
 * Auto-selects a sensible precision when `dp` is omitted, switches to
 * scientific notation at the extremes.
 */
export function fmt(n: number, dp?: number): string {
  if (n == null || (typeof n === "number" && Number.isNaN(n))) return "—";
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "−∞";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-9) return sci(n, dp ?? 4);

  let d: number;
  if (dp != null) d = dp;
  else if (Number.isInteger(n)) d = 0;
  else if (abs >= 1e4) d = 2;
  else if (abs >= 1) d = 4;
  else d = Math.min(12, 3 - Math.floor(Math.log10(abs)));

  const r = round(n, d);
  return r.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(20, Math.max(0, d)),
  });
}

/** Fixed decimals, always shown (money-style). */
export function fixed(n: number, dp = 2): string {
  if (!Number.isFinite(n)) return "—";
  return round(n, dp).toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

/** Currency with a symbol (the tools are currency-agnostic by design). */
export function money(n: number, symbol = "$", dp = 2): string {
  const neg = n < 0;
  return `${neg ? "−" : ""}${symbol}${fixed(Math.abs(n), dp)}`;
}

/** Percentage from an already-percent value: pct(12.3456) → "12.35%". */
export function pct(n: number, dp = 2): string {
  return `${fixed(n, dp)}%`;
}

/** Percentage from a ratio: ratio(0.1234) → "12.34%". */
export function ratioPct(n: number, dp = 2): string {
  return pct(n * 100, dp);
}

/** Value with a unit, e.g. unit(3.5, "kg") → "3.5 kg". */
export function unit(n: number, u: string, dp?: number): string {
  return `${fmt(n, dp)} ${u}`;
}

/** Compact form for large counts: 12,300 → "12.3K". */
export function compact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** 1 → "1st", 22 → "22nd". */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = Math.abs(Math.trunc(n)) % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

export function plural(n: number, word: string, suffix = "s"): string {
  return `${fmt(n)} ${word}${Math.abs(n) === 1 ? "" : suffix}`;
}

/** Seconds → "2 h 15 min 30 s" (largest two-to-three units). */
export function duration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return "—";
  const neg = totalSeconds < 0;
  let s = Math.abs(Math.round(totalSeconds));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const parts: string[] = [];
  if (d) parts.push(`${d} d`);
  if (h) parts.push(`${h} h`);
  if (m) parts.push(`${m} min`);
  if (s || !parts.length) parts.push(`${s} s`);
  return (neg ? "−" : "") + parts.slice(0, 3).join(" ");
}

/** Bytes → "1.21 MB" (decimal) or "1.13 MiB" (binary). */
export function bytes(n: number, binary = false): string {
  const base = binary ? 1024 : 1000;
  const names = binary
    ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]
    : ["B", "KB", "MB", "GB", "TB", "PB"];
  let i = 0;
  let v = Math.abs(n);
  while (v >= base && i < names.length - 1) {
    v /= base;
    i++;
  }
  return `${n < 0 ? "−" : ""}${fmt(v, i === 0 ? 0 : 2)} ${names[i]}`;
}

/** "1:05:03" style clock from seconds. */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/* ------------------------------------------------------------ row builders */

const row = (tone: Tone) => (label: string, value: string, hint?: string): Row => ({
  label,
  value,
  hint,
  tone,
});

/** Primary (hero) result row — one per calculator, first in the list. */
export const P = row("primary");
/** Standard supporting row. */
export const R = row("default");
/** De-emphasised / contextual row. */
export const M = row("muted");
/** Positive interpretation (healthy, profitable, in-spec). */
export const Good = row("good");
/** Cautionary interpretation. */
export const Warn = row("warn");
/** Negative interpretation (loss, out-of-spec, danger). */
export const Bad = row("bad");

/** Assemble an `Output`. */
export function out(
  rows: Row[],
  extra?: Omit<Output, "rows">,
): Output {
  return { rows, ...extra };
}

/* --------------------------------------------------------------- numerics */

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
export const deg = (rad: number) => (rad * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const mean = (a: number[]) => (a.length ? sum(a) / a.length : NaN);
export const sortNum = (a: number[]) => [...a].sort((x, y) => x - y);

export function median(a: number[]): number {
  if (!a.length) return NaN;
  const s = sortNum(a);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function modes(a: number[]): number[] {
  const counts = new Map<number, number>();
  a.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
  const max = Math.max(...counts.values());
  if (max <= 1) return [];
  return [...counts.entries()].filter(([, c]) => c === max).map(([v]) => v).sort((x, y) => x - y);
}

/** Population (`false`) or sample (`true`) variance. */
export function variance(a: number[], sample = true): number {
  const n = a.length;
  if (n < (sample ? 2 : 1)) return NaN;
  const m = mean(a);
  const ss = sum(a.map((x) => (x - m) ** 2));
  return ss / (sample ? n - 1 : n);
}

export const stdev = (a: number[], sample = true) => Math.sqrt(variance(a, sample));

/** Linear-interpolated percentile (0–100), matching the common "R7" method. */
export function quantile(a: number[], p: number): number {
  const s = sortNum(a);
  if (!s.length) return NaN;
  const idx = (s.length - 1) * clamp(p, 0, 100) / 100;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? s[lo] : s[lo] + (idx - lo) * (s[hi] - s[lo]);
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

export const lcm = (a: number, b: number) =>
  a === 0 || b === 0 ? 0 : Math.abs(Math.trunc(a) * Math.trunc(b)) / gcd(a, b);

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) fail("Factorial needs a non-negative whole number.");
  if (n > 170) fail("Factorial of numbers above 170 exceeds the floating-point range.");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Exact factorial for big inputs, as a decimal string. */
export function factorialBig(n: number): string {
  if (n < 0 || !Number.isInteger(n)) fail("Factorial needs a non-negative whole number.");
  if (n > 2000) fail("Keep n at 2000 or below for exact factorials.");
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r.toString();
}

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function primeFactors(n: number): number[] {
  n = Math.abs(Math.trunc(n));
  const f: number[] = [];
  for (let d = 2; d * d <= n; d++) {
    while (n % d === 0) {
      f.push(d);
      n /= d;
    }
  }
  if (n > 1) f.push(n);
  return f;
}

export function divisors(n: number): number[] {
  n = Math.abs(Math.trunc(n));
  const small: number[] = [];
  const big: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      small.push(d);
      if (d !== n / d) big.push(n / d);
    }
  }
  return [...small, ...big.reverse()];
}

export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  r = Math.min(r, n - r);
  let res = 1;
  for (let i = 1; i <= r; i++) res = (res * (n - r + i)) / i;
  return Math.round(res);
}

export function nPr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let res = 1;
  for (let i = 0; i < r; i++) res *= n - i;
  return res;
}

/** Group digits into a fraction string, e.g. frac(3, 4) → "3/4". */
export function frac(num: number, den: number): string {
  const g = gcd(num, den) || 1;
  const s = den < 0 ? -1 : 1;
  return `${(s * num) / g}/${Math.abs(den) / g}`;
}

/** Continued-fraction approximation of a decimal as a simple fraction. */
export function toFraction(x: number, maxDen = 10000): [number, number] {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  let [h1, h2, k1, k2] = [1, 0, 0, 1];
  let b = x;
  for (let i = 0; i < 40; i++) {
    const a = Math.floor(b);
    [h1, h2] = [a * h1 + h2, h1];
    [k1, k2] = [a * k1 + k2, k1];
    if (k1 > maxDen) {
      [h1, k1] = [h2, k2];
      break;
    }
    if (Math.abs(x - h1 / k1) < 1e-12) break;
    const frac2 = b - a;
    if (frac2 === 0) break;
    b = 1 / frac2;
  }
  return [sign * h1, k1 || 1];
}

/* ---------------------------------------------------------------- parsing */

/**
 * Parse a free-form list of numbers ("1, 2 3;4\n5" → [1,2,3,4,5]).
 * Used by every dataset-driven tool so users can paste from a spreadsheet.
 */
export function nums(input: unknown, label = "the data set"): number[] {
  const raw = String(input ?? "").trim();
  if (!raw) fail(`Enter some numbers for ${label}.`);
  const parts = raw.split(/[\s,;|]+/).filter(Boolean);
  const list = parts.map((p) => {
    const n = Number(p);
    if (!Number.isFinite(n)) fail(`"${p}" is not a number.`);
    return n;
  });
  if (!list.length) fail(`Enter some numbers for ${label}.`);
  return list;
}

/** Parse rows of numbers separated by newlines/semicolons into a matrix. */
export function matrix(input: unknown, label = "the matrix"): number[][] {
  const raw = String(input ?? "").trim();
  if (!raw) fail(`Enter values for ${label}.`);
  const rows = raw
    .split(/[\n;]+/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split(/[\s,|]+/).filter(Boolean).map(Number));
  if (rows.some((r) => r.some((x) => !Number.isFinite(x)))) fail(`${label} contains a non-numeric value.`);
  const w = rows[0].length;
  if (rows.some((r) => r.length !== w)) fail(`Every row of ${label} needs the same number of values.`);
  return rows;
}

export function words(input: unknown): string[] {
  return String(input ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/* ------------------------------------------------------------------ misc */

const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) fail("Roman numerals cover whole numbers from 1 to 3999.");
  let s = "";
  for (const [v, r] of ROMAN) {
    while (n >= v) {
      s += r;
      n -= v;
    }
  }
  return s;
}

export function fromRoman(s: string): number {
  const up = s.toUpperCase().replace(/\s/g, "");
  if (!/^[MDCLXVI]+$/.test(up)) fail("Use only the letters M, D, C, L, X, V and I.");
  let i = 0;
  let n = 0;
  for (const [v, r] of ROMAN) {
    while (up.startsWith(r, i)) {
      n += v;
      i += r.length;
    }
  }
  if (i !== up.length || toRoman(n) !== up) fail(`"${s}" is not a valid Roman numeral.`);
  return n;
}

/** Interpolate on a piecewise-linear table of [x, y] pairs. */
export function interp(x: number, table: [number, number][]): number {
  if (x <= table[0][0]) return table[0][1];
  const last = table[table.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < table.length; i++) {
    const [x1, y1] = table[i];
    if (x <= x1) {
      const [x0, y0] = table[i - 1];
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return last[1];
}

/** Solve a quadratic, returning real or complex roots as display strings. */
export function quadraticRoots(a: number, b: number, c: number): { roots: string[]; disc: number } {
  const disc = b * b - 4 * a * c;
  if (disc > 0) {
    const r = Math.sqrt(disc);
    return { roots: [fmt((-b + r) / (2 * a)), fmt((-b - r) / (2 * a))], disc };
  }
  if (disc === 0) return { roots: [fmt(-b / (2 * a))], disc };
  const re = -b / (2 * a);
  const im = Math.sqrt(-disc) / (2 * a);
  return { roots: [`${fmt(re)} + ${fmt(Math.abs(im))}i`, `${fmt(re)} − ${fmt(Math.abs(im))}i`], disc };
}

/** Newton–Raphson root finder used by IRR-style financial tools. */
export function solveNewton(
  f: (x: number) => number,
  x0: number,
  { iterations = 80, tol = 1e-9, h = 1e-7 } = {},
): number {
  let x = x0;
  for (let i = 0; i < iterations; i++) {
    const fx = f(x);
    if (Math.abs(fx) < tol) return x;
    const d = (f(x + h) - f(x - h)) / (2 * h);
    if (!Number.isFinite(d) || d === 0) break;
    const next = x - fx / d;
    if (!Number.isFinite(next)) break;
    if (Math.abs(next - x) < tol) return next;
    x = next;
  }
  return x;
}

/** Bisection fallback for bounded monotonic roots. */
export function solveBisect(f: (x: number) => number, lo: number, hi: number, steps = 200): number {
  let a = lo;
  let b = hi;
  let fa = f(a);
  for (let i = 0; i < steps; i++) {
    const mid = (a + b) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-10) return mid;
    if (fa * fm < 0) b = mid;
    else {
      a = mid;
      fa = fm;
    }
  }
  return (a + b) / 2;
}
