/**
 * METER · expression engine
 * ---------------------------------------------------------------------------
 * A small, fast, dependency-free math evaluator: tokenizer + recursive-descent
 * parser that evaluates as it parses.
 *
 * Why not math.js? The scientific calculator is the hero component on the
 * landing page, so it sits in the critical path. math.js costs ~150 kB gzipped
 * for a feature surface we do not need; this engine is ~4 kB, has zero
 * dependencies, and gives us calculator-grade behaviour that generic parsers
 * get wrong:
 *
 *   • display-symbol input     — "×", "÷", "−", "π", "√", "²"
 *   • contextual percentages   — "200+10%" → 220, but "200×10%" → 20
 *   • implicit multiplication  — "2π", "3(4+5)", "2sin(30)"
 *   • degree/radian modes      — including inverse trig returning degrees
 *   • postfix factorial        — "5!" and "(3+2)!"
 *   • friendly error messages  — surfaced directly in the display
 *
 * Grammar (each level is right-recursive where the operator demands it):
 *   expr    → term (('+' | '-') term)*
 *   term    → unary (('*' | '/' | 'mod' | implicit) unary)*
 *   unary   → ('-' | '+' | '√') unary | power
 *   power   → postfix ('^' unary)?            // right associative
 *   postfix → primary ('!' | '%' | '²' | '³')*
 *   primary → number | constant | ident '(' args ')' | '(' expr ')' | 'Ans'
 */

export type AngleMode = "deg" | "rad";

export interface EvalOptions {
  angle?: AngleMode;
  /** Value substituted for `Ans`. */
  ans?: number;
  /** Value substituted for `M` / `mem`. */
  mem?: number;
}

export class MathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MathError";
  }
}

/* --------------------------------------------------------------- tokenizer */

type TokKind = "num" | "ident" | "op" | "lparen" | "rparen" | "comma" | "post";

interface Tok {
  kind: TokKind;
  text: string;
  value?: number;
  pos: number;
}

/** Display glyphs → canonical ASCII operators. */
const GLYPHS: Record<string, string> = {
  "×": "*",
  "·": "*",
  "∗": "*",
  "÷": "/",
  ":": "/",
  "−": "-",
  "–": "-",
  "—": "-",
  "＋": "+",
  "**": "^",
};

const POSTFIX = new Set(["!", "%", "²", "³", "°"]);

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const s = src.replace(/\*\*/g, "^").replace(/\s+/g, " ");

  while (i < s.length) {
    const c = s[i];

    if (c === " ") {
      i++;
      continue;
    }

    // number (with optional decimal + exponent)
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) {
      const start = i;
      while (i < s.length && /[0-9]/.test(s[i])) i++;
      if (s[i] === ".") {
        i++;
        while (i < s.length && /[0-9]/.test(s[i])) i++;
      }
      if (/[eE]/.test(s[i] ?? "") && /[0-9+-]/.test(s[i + 1] ?? "")) {
        const save = i;
        i++;
        if (/[+-]/.test(s[i])) i++;
        if (/[0-9]/.test(s[i] ?? "")) {
          while (i < s.length && /[0-9]/.test(s[i])) i++;
        } else {
          i = save;
        }
      }
      const text = s.slice(start, i);
      toks.push({ kind: "num", text, value: Number(text), pos: start });
      continue;
    }

    // identifier / function / constant
    if (/[A-Za-zπτφ√∛∑]/.test(c)) {
      if (c === "√" || c === "∛") {
        toks.push({ kind: "op", text: c, pos: i });
        i++;
        continue;
      }
      const start = i;
      while (i < s.length && /[A-Za-z0-9_πτφ]/.test(s[i])) i++;
      toks.push({ kind: "ident", text: s.slice(start, i), pos: start });
      continue;
    }

    if (c === "(" || c === "[" || c === "{") {
      toks.push({ kind: "lparen", text: "(", pos: i });
      i++;
      continue;
    }
    if (c === ")" || c === "]" || c === "}") {
      toks.push({ kind: "rparen", text: ")", pos: i });
      i++;
      continue;
    }
    if (c === "," ) {
      toks.push({ kind: "comma", text: ",", pos: i });
      i++;
      continue;
    }
    if (POSTFIX.has(c)) {
      toks.push({ kind: "post", text: c, pos: i });
      i++;
      continue;
    }

    const mapped = GLYPHS[c] ?? c;
    if ("+-*/^".includes(mapped)) {
      toks.push({ kind: "op", text: mapped, pos: i });
      i++;
      continue;
    }

    throw new MathError(`Unexpected character "${c}"`);
  }
  return toks;
}

/* --------------------------------------------------------------- constants */

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  tau: Math.PI * 2,
  τ: Math.PI * 2,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
  φ: (1 + Math.sqrt(5)) / 2,
  inf: Infinity,
  infinity: Infinity,
};

function fact(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new MathError("Factorial needs a whole number ≥ 0");
  if (n > 170) throw new MathError("Factorial too large (max 170)");
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function combos(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  r = Math.min(r, n - r);
  let out = 1;
  for (let k = 1; k <= r; k++) out = (out * (n - r + k)) / k;
  return Math.round(out);
}

function gcd2(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Functions, with arity ranges. `angle` is injected for trig. */
type Fn = { arity: [number, number]; fn: (args: number[], angle: AngleMode) => number };

const toRad = (x: number, a: AngleMode) => (a === "deg" ? (x * Math.PI) / 180 : x);
const fromRad = (x: number, a: AngleMode) => (a === "deg" ? (x * 180) / Math.PI : x);

const FUNCS: Record<string, Fn> = {
  sin: { arity: [1, 1], fn: ([x], a) => Math.sin(toRad(x, a)) },
  cos: { arity: [1, 1], fn: ([x], a) => Math.cos(toRad(x, a)) },
  tan: { arity: [1, 1], fn: ([x], a) => Math.tan(toRad(x, a)) },
  asin: { arity: [1, 1], fn: ([x], a) => fromRad(Math.asin(x), a) },
  acos: { arity: [1, 1], fn: ([x], a) => fromRad(Math.acos(x), a) },
  atan: { arity: [1, 1], fn: ([x], a) => fromRad(Math.atan(x), a) },
  atan2: { arity: [2, 2], fn: ([y, x], a) => fromRad(Math.atan2(y, x), a) },
  sinh: { arity: [1, 1], fn: ([x]) => Math.sinh(x) },
  cosh: { arity: [1, 1], fn: ([x]) => Math.cosh(x) },
  tanh: { arity: [1, 1], fn: ([x]) => Math.tanh(x) },
  asinh: { arity: [1, 1], fn: ([x]) => Math.asinh(x) },
  acosh: { arity: [1, 1], fn: ([x]) => Math.acosh(x) },
  atanh: { arity: [1, 1], fn: ([x]) => Math.atanh(x) },
  sec: { arity: [1, 1], fn: ([x], a) => 1 / Math.cos(toRad(x, a)) },
  csc: { arity: [1, 1], fn: ([x], a) => 1 / Math.sin(toRad(x, a)) },
  cot: { arity: [1, 1], fn: ([x], a) => 1 / Math.tan(toRad(x, a)) },
  log: { arity: [1, 2], fn: (args) => (args.length === 2 ? Math.log(args[1]) / Math.log(args[0]) : Math.log10(args[0])) },
  log10: { arity: [1, 1], fn: ([x]) => Math.log10(x) },
  log2: { arity: [1, 1], fn: ([x]) => Math.log2(x) },
  ln: { arity: [1, 1], fn: ([x]) => Math.log(x) },
  exp: { arity: [1, 1], fn: ([x]) => Math.exp(x) },
  sqrt: { arity: [1, 1], fn: ([x]) => Math.sqrt(x) },
  cbrt: { arity: [1, 1], fn: ([x]) => Math.cbrt(x) },
  root: { arity: [2, 2], fn: ([n, x]) => Math.sign(x) * Math.pow(Math.abs(x), 1 / n) },
  abs: { arity: [1, 1], fn: ([x]) => Math.abs(x) },
  sign: { arity: [1, 1], fn: ([x]) => Math.sign(x) },
  round: { arity: [1, 2], fn: (a) => {
    const p = Math.pow(10, a[1] ?? 0);
    return Math.round(a[0] * p) / p;
  } },
  floor: { arity: [1, 1], fn: ([x]) => Math.floor(x) },
  ceil: { arity: [1, 1], fn: ([x]) => Math.ceil(x) },
  trunc: { arity: [1, 1], fn: ([x]) => Math.trunc(x) },
  pow: { arity: [2, 2], fn: ([x, y]) => Math.pow(x, y) },
  mod: { arity: [2, 2], fn: ([x, y]) => x % y },
  hypot: { arity: [2, 8], fn: (a) => Math.hypot(...a) },
  min: { arity: [1, 32], fn: (a) => Math.min(...a) },
  max: { arity: [1, 32], fn: (a) => Math.max(...a) },
  sum: { arity: [1, 64], fn: (a) => a.reduce((x, y) => x + y, 0) },
  avg: { arity: [1, 64], fn: (a) => a.reduce((x, y) => x + y, 0) / a.length },
  mean: { arity: [1, 64], fn: (a) => a.reduce((x, y) => x + y, 0) / a.length },
  fact: { arity: [1, 1], fn: ([x]) => fact(x) },
  ncr: { arity: [2, 2], fn: ([n, r]) => combos(n, r) },
  npr: { arity: [2, 2], fn: ([n, r]) => {
    if (r < 0 || r > n) return 0;
    let out = 1;
    for (let k = 0; k < r; k++) out *= n - k;
    return out;
  } },
  gcd: { arity: [2, 16], fn: (a) => a.reduce(gcd2) },
  lcm: { arity: [2, 16], fn: (a) => a.reduce((x, y) => (x * y) / gcd2(x, y)) },
  rad: { arity: [1, 1], fn: ([x]) => (x * Math.PI) / 180 },
  deg: { arity: [1, 1], fn: ([x]) => (x * 180) / Math.PI },
};

export const FUNCTION_NAMES = Object.keys(FUNCS);

/* ------------------------------------------------------------------ parser */

interface Val {
  n: number;
  /** True when the value came from a bare `x%` literal (enables 200+10% → 220). */
  isPct: boolean;
}

class Parser {
  private i = 0;

  constructor(
    private toks: Tok[],
    private opts: Required<EvalOptions>,
  ) {}

  private peek(): Tok | undefined {
    return this.toks[this.i];
  }

  private next(): Tok | undefined {
    return this.toks[this.i++];
  }

  private eat(kind: TokKind, text?: string): boolean {
    const t = this.peek();
    if (t && t.kind === kind && (text === undefined || t.text === text)) {
      this.i++;
      return true;
    }
    return false;
  }

  parse(): number {
    if (!this.toks.length) throw new MathError("Nothing to calculate");
    const v = this.expr();
    const rest = this.peek();
    if (rest) {
      if (rest.kind === "rparen") throw new MathError("Unmatched closing bracket");
      throw new MathError(`Unexpected "${rest.text}"`);
    }
    if (Number.isNaN(v.n)) throw new MathError("Result is undefined");
    return v.n;
  }

  private expr(): Val {
    let left = this.term();
    for (;;) {
      const t = this.peek();
      if (t?.kind === "op" && (t.text === "+" || t.text === "-")) {
        this.i++;
        const right = this.term();
        // Contextual percentage: 200 + 10% = 200 + (200 × 0.10)
        const delta = right.isPct ? left.n * right.n : right.n;
        left = { n: t.text === "+" ? left.n + delta : left.n - delta, isPct: false };
        continue;
      }
      return left;
    }
  }

  private term(): Val {
    let left = this.unary();
    for (;;) {
      const t = this.peek();
      if (t?.kind === "op" && (t.text === "*" || t.text === "/")) {
        this.i++;
        const right = this.unary();
        if (t.text === "/" && right.n === 0) throw new MathError("Division by zero");
        left = { n: t.text === "*" ? left.n * right.n : left.n / right.n, isPct: false };
        continue;
      }
      if (t?.kind === "ident" && t.text.toLowerCase() === "mod") {
        this.i++;
        const right = this.unary();
        left = { n: left.n % right.n, isPct: false };
        continue;
      }
      // implicit multiplication: 2π, 3(4+5), 2sin(30), (1+2)(3+4)
      if (
        t &&
        (t.kind === "num" || t.kind === "lparen" ||
          (t.kind === "ident" && t.text.toLowerCase() !== "mod") ||
          (t.kind === "op" && (t.text === "√" || t.text === "∛")))
      ) {
        const right = this.unary();
        left = { n: left.n * right.n, isPct: false };
        continue;
      }
      return left;
    }
  }

  private unary(): Val {
    const t = this.peek();
    if (t?.kind === "op" && (t.text === "-" || t.text === "+")) {
      this.i++;
      const v = this.unary();
      return { n: t.text === "-" ? -v.n : v.n, isPct: v.isPct };
    }
    if (t?.kind === "op" && (t.text === "√" || t.text === "∛")) {
      this.i++;
      const v = this.power();
      if (t.text === "√") {
        if (v.n < 0) throw new MathError("Square root of a negative number");
        return { n: Math.sqrt(v.n), isPct: false };
      }
      return { n: Math.cbrt(v.n), isPct: false };
    }
    return this.power();
  }

  private power(): Val {
    const base = this.postfix();
    const t = this.peek();
    if (t?.kind === "op" && t.text === "^") {
      this.i++;
      const exp = this.unary(); // right associative
      const r = Math.pow(base.n, exp.n);
      if (Number.isNaN(r)) throw new MathError("Undefined power");
      return { n: r, isPct: false };
    }
    return base;
  }

  private postfix(): Val {
    let v = this.primary();
    for (;;) {
      const t = this.peek();
      if (t?.kind !== "post") return v;
      this.i++;
      if (t.text === "!") v = { n: fact(v.n), isPct: false };
      else if (t.text === "%") v = { n: v.n / 100, isPct: true };
      else if (t.text === "²") v = { n: v.n * v.n, isPct: false };
      else if (t.text === "³") v = { n: v.n ** 3, isPct: false };
      else if (t.text === "°") v = { n: (v.n * Math.PI) / 180, isPct: false };
    }
  }

  private primary(): Val {
    const t = this.next();
    if (!t) throw new MathError("Incomplete expression");

    if (t.kind === "num") return { n: t.value!, isPct: false };

    if (t.kind === "lparen") {
      const v = this.expr();
      if (!this.eat("rparen")) throw new MathError("Missing closing bracket");
      return { n: v.n, isPct: false };
    }

    if (t.kind === "ident") {
      const lower = t.text.toLowerCase();

      if (lower === "ans") return { n: this.opts.ans, isPct: false };
      if (lower === "m" || lower === "mem") return { n: this.opts.mem, isPct: false };

      const fn = FUNCS[lower];
      if (fn) {
        const args: number[] = [];
        if (this.eat("lparen")) {
          if (!this.eat("rparen")) {
            do {
              args.push(this.expr().n);
            } while (this.eat("comma"));
            if (!this.eat("rparen")) throw new MathError(`Missing ")" after ${t.text}`);
          }
        } else {
          // Bare function application: sin30, √2 style — bind tightly.
          args.push(this.power().n);
        }
        const [lo, hi] = fn.arity;
        if (args.length < lo || args.length > hi) {
          throw new MathError(
            lo === hi
              ? `${t.text}() takes ${lo} argument${lo === 1 ? "" : "s"}`
              : `${t.text}() takes ${lo}–${hi} arguments`,
          );
        }
        const r = fn.fn(args, this.opts.angle);
        if (Number.isNaN(r)) throw new MathError(`${t.text}() is undefined here`);
        return { n: r, isPct: false };
      }

      if (lower in CONSTANTS) return { n: CONSTANTS[lower], isPct: false };

      throw new MathError(`Unknown name "${t.text}"`);
    }

    if (t.kind === "op") throw new MathError(`Missing value before "${t.text}"`);
    if (t.kind === "rparen") throw new MathError("Unmatched closing bracket");
    throw new MathError(`Unexpected "${t.text}"`);
  }
}

/**
 * Evaluate an expression. Throws `MathError` with a display-ready message.
 */
export function evaluate(input: string, opts: EvalOptions = {}): number {
  const settings: Required<EvalOptions> = {
    angle: opts.angle ?? "deg",
    ans: opts.ans ?? 0,
    mem: opts.mem ?? 0,
  };
  const trimmed = input.trim();
  if (!trimmed) throw new MathError("Nothing to calculate");
  const value = new Parser(tokenize(trimmed), settings).parse();
  if (!Number.isFinite(value)) {
    throw new MathError(Number.isNaN(value) ? "Result is undefined" : "Result is out of range");
  }
  return value;
}

/** Non-throwing variant for live previews. */
export function tryEvaluate(input: string, opts: EvalOptions = {}): { ok: true; value: number } | { ok: false; error: string } {
  try {
    return { ok: true, value: evaluate(input, opts) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid expression" };
  }
}

/* --------------------------------------------------------------- display */

const SUPS: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
};

/**
 * Calculator-grade result formatting: up to 12 significant digits, thousands
 * separators, scientific notation at the extremes, no floating-point noise.
 */
export function formatResult(n: number, { group = true, digits = 12 } = {}): string {
  if (Number.isNaN(n)) return "Error";
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "−∞";
  if (n === 0) return "0";

  const abs = Math.abs(n);
  if (abs >= 1e13 || abs < 1e-9) {
    const [m, e] = n.toExponential(8).split("e");
    const mant = m.replace(/\.?0+$/, "");
    const exp = Number(e);
    return `${mant}×10${String(exp)
      .split("")
      .map((c) => SUPS[c] ?? c)
      .join("")}`;
  }

  // Round to `digits` significant figures, then drop trailing zeros.
  const intDigits = abs >= 1 ? Math.floor(Math.log10(abs)) + 1 : 1;
  const dp = Math.max(0, Math.min(15, digits - intDigits));
  let s = n.toFixed(dp);
  if (s.includes(".")) s = s.replace(/\.?0+$/, "");
  if (s === "-0") s = "0";

  if (!group) return s;
  const [ip, fp] = s.split(".");
  const sign = ip.startsWith("-") ? "−" : "";
  const digitsOnly = ip.replace("-", "");
  const grouped = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${grouped}${fp ? `.${fp}` : ""}`;
}

/**
 * Balance an expression for evaluation-on-the-fly: appends the closing
 * brackets the user has not typed yet so live previews work while typing.
 */
export function autoClose(expr: string): string {
  let depth = 0;
  for (const c of expr) {
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
  }
  return expr + ")".repeat(depth);
}
