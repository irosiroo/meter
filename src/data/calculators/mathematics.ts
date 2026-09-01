/**
 * METER · Mathematics (26 tools)
 */

import {
  fail, fmt, frac, gcd, lcm, mean, median, modes, nCr, nPr, need, needPos,
  primeFactors, divisors, isPrime, factorialBig, matrix, nums, P, R, M, Good, Bad,
  quadraticRoots, round, sum, sup, toFraction, sci,
} from "../../lib/calc/helpers";
import { evaluate, formatResult } from "../../lib/math/engine";
import type { CalcSpec } from "../../lib/calc/types";

/* --------------------------------------------------------- local utilities */

const mul = (a: number[][], b: number[][]): number[][] => {
  if (a[0].length !== b.length) fail("To multiply, the columns of A must equal the rows of B.");
  return a.map((row) => b[0].map((_, j) => sum(row.map((v, k) => v * b[k][j]))));
};

const det = (m: number[][]): number => {
  const n = m.length;
  if (n !== m[0].length) fail("Determinants need a square matrix.");
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  return m[0].reduce(
    (acc, v, j) =>
      acc + (j % 2 ? -1 : 1) * v * det(m.slice(1).map((r) => r.filter((_, k) => k !== j))),
    0,
  );
};

const inverse = (m: number[][]): number[][] => {
  const n = m.length;
  if (n !== m[0].length) fail("Only square matrices can be inverted.");
  const d = det(m);
  if (Math.abs(d) < 1e-12) fail("This matrix is singular — it has no inverse.");
  // Gauss–Jordan on [m | I]
  const a = m.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const pv = a[col][col];
    for (let j = 0; j < 2 * n; j++) a[col][j] /= pv;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = a[r][col];
      if (!f) continue;
      for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[col][j];
    }
  }
  return a.map((r) => r.slice(n).map((v) => round(v, 10)));
};

const mtable = (m: number[][], caption: string) => ({
  caption,
  head: m[0].map((_, j) => `c${j + 1}`),
  rows: m.map((r) => r.map((v) => fmt(v, 6))),
});

const cplx = (re: number, im: number): string => {
  const r = round(re, 10);
  const i = round(im, 10);
  if (i === 0) return fmt(r);
  if (r === 0) return `${fmt(i)}i`;
  return `${fmt(r)} ${i < 0 ? "−" : "+"} ${fmt(Math.abs(i))}i`;
};

const OPS = [
  { value: "+", label: "Add  (+)" },
  { value: "-", label: "Subtract  (−)" },
  { value: "*", label: "Multiply  (×)" },
  { value: "/", label: "Divide  (÷)" },
];

/* -------------------------------------------------------------------- specs */

export const CALCULATORS: CalcSpec[] = [
  {
    id: "scientific-calculator",
    name: "Scientific Calculator",
    category: "mathematics",
    description:
      "Full scientific calculator with trigonometry, logarithms, powers, factorials, memory and degree/radian modes.",
    keywords: ["scientific", "trig", "sin", "cos", "log", "expression", "advanced"],
    icon: "Calculator",
    featured: true,
    popularity: 100,
    custom: "scientific",
    fields: [
      { key: "expr", label: "Expression", kind: "text", def: "2×(3+4)²−√16", wide: true, placeholder: "e.g. sin(30)+log(100)" },
      {
        key: "angle", label: "Angle mode", kind: "select", def: "deg",
        options: [
          { value: "deg", label: "Degrees" },
          { value: "rad", label: "Radians" },
        ],
      },
    ],
    formula: "Evaluated with operator precedence: () → ^ → × ÷ → + −",
    how:
      "Type any expression using the on-screen keypad or your physical keyboard. The parser respects standard precedence, supports implicit multiplication (2π, 3(4+5)), contextual percentages (200+10% = 220), postfix factorials and both angle modes.",
    examples: [
      { label: "Trigonometry in degrees", inputs: { expr: "sin(30)+cos(60)", angle: "deg" }, expect: "1" },
      { label: "Powers and roots", inputs: { expr: "2×(3+4)²−√16", angle: "deg" }, expect: "94" },
      { label: "Factorial", inputs: { expr: "5!", angle: "deg" }, expect: "120" },
      { label: "Contextual percentage", inputs: { expr: "200+10%", angle: "deg" }, expect: "220" },
    ],
    compute: (v) => {
      const value = evaluate(String(v.expr), { angle: v.angle === "rad" ? "rad" : "deg" });
      return [
        P("Result", formatResult(value)),
        M("Exact value", String(value)),
        M("Scientific notation", sci(value, 6)),
      ];
    },
  },

  {
    id: "basic-calculator",
    name: "Basic Calculator",
    category: "mathematics",
    description: "Add, subtract, multiply or divide two numbers with instant secondary results.",
    keywords: ["basic", "arithmetic", "add", "subtract", "multiply", "divide", "simple"],
    icon: "Divide",
    popularity: 88,
    fields: [
      { key: "a", label: "First number", def: 12.5 },
      { key: "op", label: "Operation", kind: "select", options: OPS, def: "*" },
      { key: "b", label: "Second number", def: 4 },
    ],
    formula: "result = a ⊕ b",
    how: "A focused four-function calculator. Alongside the answer it shows the other three operations on the same pair, which is often what you actually wanted next.",
    examples: [{ label: "12.5 × 4", inputs: { a: 12.5, op: "*", b: 4 }, expect: "50" }],
    compute: (v) => {
      const a = need(v.a, "the first number");
      const b = need(v.b, "the second number");
      const op = String(v.op);
      if (op === "/" && b === 0) fail("Division by zero is undefined.");
      const result = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
      const sym = op === "*" ? "×" : op === "/" ? "÷" : op === "-" ? "−" : "+";
      return {
        rows: [
          P(`${fmt(a)} ${sym} ${fmt(b)}`, fmt(result)),
          R("Sum  a + b", fmt(a + b)),
          R("Difference  a − b", fmt(a - b)),
          R("Product  a × b", fmt(a * b)),
          R("Quotient  a ÷ b", b === 0 ? "undefined" : fmt(a / b)),
          M("Ratio", b === 0 ? "—" : `${fmt(a / b, 4)} : 1`),
        ],
      };
    },
  },

  {
    id: "percentage-calculator",
    name: "Percentage Calculator",
    category: "mathematics",
    description: "Every percentage relationship between two numbers, answered at once.",
    keywords: ["percent", "percentage", "of", "increase", "decrease", "%"],
    icon: "Percent",
    featured: true,
    popularity: 98,
    fields: [
      { key: "a", label: "Percentage / first value (A)", def: 15, unit: "%" },
      { key: "b", label: "Base value (B)", def: 200 },
    ],
    formula: [
      "A% of B = A ÷ 100 × B",
      "A as a % of B = A ÷ B × 100",
      "B increased by A% = B × (1 + A ÷ 100)",
    ],
    how: "Most percentage questions are one of five relationships. Rather than making you pick a mode, this tool computes all of them from a single pair of numbers.",
    examples: [
      { label: "15% of 200", inputs: { a: 15, b: 200 }, expect: "30" },
      { label: "8% of 1,250", inputs: { a: 8, b: 1250 }, expect: "100" },
    ],
    compute: (v) => {
      const a = need(v.a, "A");
      const b = need(v.b, "B");
      return {
        rows: [
          P(`${fmt(a)}% of ${fmt(b)}`, fmt((a / 100) * b)),
          R(`${fmt(a)} is what % of ${fmt(b)}`, b === 0 ? "—" : `${fmt((a / b) * 100, 4)}%`),
          R(`${fmt(b)} increased by ${fmt(a)}%`, fmt(b * (1 + a / 100))),
          R(`${fmt(b)} decreased by ${fmt(a)}%`, fmt(b * (1 - a / 100))),
          R(`% change from ${fmt(a)} to ${fmt(b)}`, a === 0 ? "—" : `${((b - a) / Math.abs(a)) * 100 >= 0 ? "+" : ""}${fmt(((b - a) / Math.abs(a)) * 100, 2)}%`),
          M("A as a decimal", fmt(a / 100)),
        ],
        note: `${fmt(a)}% is the fraction ${frac(round(a, 0), 100)} when A is a whole number.`,
      };
    },
  },

  {
    id: "percentage-change-calculator",
    name: "Percentage Change Calculator",
    category: "mathematics",
    description: "Percentage increase or decrease between an old and a new value.",
    keywords: ["percentage change", "increase", "decrease", "growth", "difference", "delta"],
    icon: "TrendingUp",
    popularity: 82,
    fields: [
      { key: "old", label: "Original value", def: 80 },
      { key: "new", label: "New value", def: 100 },
    ],
    formula: "change % = (new − old) ÷ |old| × 100",
    how: "The denominator is always the original value — that is what makes a change a percentage of where you started. A 25% rise followed by a 25% fall does not return you to the start, and the multiplier row shows why.",
    examples: [
      { label: "80 → 100", inputs: { old: 80, new: 100 }, expect: "25%" },
      { label: "250 → 200", inputs: { old: 250, new: 200 }, expect: "20%" },
    ],
    compute: (v) => {
      const o = need(v.old, "the original value");
      const n = need(v.new, "the new value");
      if (o === 0) fail("Percentage change is undefined when the original value is zero.");
      const change = ((n - o) / Math.abs(o)) * 100;
      const up = change >= 0;
      return {
        rows: [
          (up ? Good : Bad)(up ? "Percentage increase" : "Percentage decrease", `${fmt(Math.abs(change), 4)}%`),
          R("Absolute difference", fmt(Math.abs(n - o))),
          R("Multiplier", `× ${fmt(n / o, 6)}`),
          R("Signed change", `${up ? "+" : "−"}${fmt(Math.abs(change), 4)}%`),
          M("Reverse change (new → old)", `${fmt(((o - n) / Math.abs(n)) * 100, 4)}%`),
        ],
        note: up
          ? `The value grew by ${fmt(Math.abs(change), 2)}% of its original size.`
          : `The value fell by ${fmt(Math.abs(change), 2)}% of its original size.`,
      };
    },
  },

  {
    id: "fraction-calculator",
    name: "Fraction Calculator",
    category: "mathematics",
    description: "Add, subtract, multiply and divide fractions with automatic simplification.",
    keywords: ["fraction", "numerator", "denominator", "simplify", "mixed number"],
    icon: "Divide",
    featured: true,
    popularity: 90,
    fields: [
      { key: "n1", label: "Numerator 1", def: 1 },
      { key: "d1", label: "Denominator 1", def: 2 },
      { key: "op", label: "Operation", kind: "select", options: OPS, def: "+" },
      { key: "n2", label: "Numerator 2", def: 1 },
      { key: "d2", label: "Denominator 2", def: 3 },
    ],
    formula: [
      "a/b + c/d = (ad + bc) / bd",
      "a/b × c/d = ac / bd",
      "a/b ÷ c/d = ad / bc",
    ],
    how: "Fractions are combined over a common denominator, then divided by the greatest common divisor so the answer is always in lowest terms.",
    examples: [
      { label: "1/2 + 1/3", inputs: { n1: 1, d1: 2, op: "+", n2: 1, d2: 3 }, expect: "5/6" },
      { label: "3/4 ÷ 2/5", inputs: { n1: 3, d1: 4, op: "/", n2: 2, d2: 5 }, expect: "15/8" },
    ],
    compute: (v) => {
      const [n1, d1, n2, d2] = [v.n1, v.d1, v.n2, v.d2].map((x, i) =>
        need(x, i % 2 ? "a denominator" : "a numerator"),
      );
      if (d1 === 0 || d2 === 0) fail("A denominator cannot be zero.");
      const op = String(v.op);
      let n: number;
      let d: number;
      if (op === "+") [n, d] = [n1 * d2 + n2 * d1, d1 * d2];
      else if (op === "-") [n, d] = [n1 * d2 - n2 * d1, d1 * d2];
      else if (op === "*") [n, d] = [n1 * n2, d1 * d2];
      else {
        if (n2 === 0) fail("Cannot divide by the fraction 0.");
        [n, d] = [n1 * d2, d1 * n2];
      }
      const g = gcd(n, d) || 1;
      let sn = n / g;
      let sd = d / g;
      if (sd < 0) {
        sn = -sn;
        sd = -sd;
      }
      const whole = Math.trunc(sn / sd);
      const rem = Math.abs(sn % sd);
      const mixed = rem === 0 ? String(whole) : whole === 0 ? `${sn < 0 ? "−" : ""}${rem}/${sd}` : `${whole} ${rem}/${sd}`;
      return {
        rows: [
          P("Simplified result", `${sn}/${sd}`),
          R("Mixed number", mixed),
          R("Decimal", fmt(sn / sd, 8)),
          R("Percentage", `${fmt((sn / sd) * 100, 4)}%`),
          M("Before simplifying", `${n}/${d}`),
          M("Common denominator used", fmt(op === "+" || op === "-" ? d1 * d2 : d)),
        ],
      };
    },
  },

  {
    id: "decimal-to-fraction-converter",
    name: "Decimal to Fraction Converter",
    category: "mathematics",
    description: "Turn any decimal into its simplest exact or closest fraction.",
    keywords: ["decimal", "fraction", "convert", "simplify", "rational"],
    icon: "Divide",
    popularity: 74,
    fields: [
      { key: "value", label: "Decimal value", def: 0.375 },
      { key: "maxDen", label: "Largest denominator to allow", def: 10000, min: 1 },
    ],
    formula: "Continued-fraction expansion: x = a₀ + 1/(a₁ + 1/(a₂ + …))",
    how: "A continued-fraction expansion finds the fraction with the smallest denominator that matches your decimal — the same method that turns 3.14159 into 355/113.",
    examples: [
      { label: "0.375", inputs: { value: 0.375, maxDen: 10000 }, expect: "3/8" },
      { label: "π approximation", inputs: { value: 3.14159265, maxDen: 200 }, expect: "355/113" },
    ],
    compute: (v) => {
      const x = need(v.value, "the decimal value");
      const maxDen = Math.max(1, Math.trunc(need(v.maxDen, "the denominator limit")));
      const [n, d] = toFraction(x, maxDen);
      const whole = Math.trunc(n / d);
      const rem = Math.abs(n % d);
      const err = Math.abs(x - n / d);
      return {
        rows: [
          P("Fraction", `${n}/${d}`),
          R("Mixed number", rem === 0 ? String(whole) : whole === 0 ? `${n < 0 ? "−" : ""}${rem}/${d}` : `${whole} ${rem}/${d}`),
          R("Fraction as a decimal", fmt(n / d, 10)),
          R("Percentage", `${fmt(x * 100, 6)}%`),
          err < 1e-12 ? Good("Accuracy", "Exact") : M("Approximation error", sci(err, 3)),
        ],
      };
    },
  },

  {
    id: "ratio-calculator",
    name: "Ratio Calculator",
    category: "mathematics",
    description: "Simplify a ratio, scale it, and split a total between its parts.",
    keywords: ["ratio", "proportion", "simplify", "scale", "share", "split"],
    icon: "Scale",
    popularity: 80,
    fields: [
      { key: "a", label: "Part A", def: 16 },
      { key: "b", label: "Part B", def: 9 },
      { key: "total", label: "Total to share (optional)", def: 1000, optional: true },
    ],
    formula: "a : b ÷ gcd(a, b) · share A = total × a ÷ (a + b)",
    how: "Ratios are reduced by their greatest common divisor. If you supply a total, it is divided in the same proportion — the standard way to split costs, ingredients or shareholdings.",
    examples: [
      { label: "16:9 screen", inputs: { a: 16, b: 9, total: 1920 }, expect: "16 : 9" },
      { label: "Split 1,000 in 3:2", inputs: { a: 3, b: 2, total: 1000 }, expect: "600" },
    ],
    compute: (v) => {
      const a = need(v.a, "part A");
      const b = need(v.b, "part B");
      if (a === 0 && b === 0) fail("At least one part must be non-zero.");
      const g = gcd(a, b) || 1;
      const total = Number(v.total);
      const rows = [
        P("Simplified ratio", `${fmt(a / g)} : ${fmt(b / g)}`),
        R("As a decimal", `${fmt(a / b, 6)} : 1`),
        R("A as a share", `${fmt((a / (a + b)) * 100, 3)}%`),
        R("B as a share", `${fmt((b / (a + b)) * 100, 3)}%`),
      ];
      if (Number.isFinite(total) && total !== 0) {
        rows.push(R(`Share of ${fmt(total)} for A`, fmt((total * a) / (a + b))));
        rows.push(R(`Share of ${fmt(total)} for B`, fmt((total * b) / (a + b))));
      }
      rows.push(M("Greatest common divisor", fmt(g)));
      return { rows };
    },
  },

  {
    id: "proportion-solver",
    name: "Proportion Solver",
    category: "mathematics",
    description: "Solve a/b = c/d for whichever value is missing by cross-multiplication.",
    keywords: ["proportion", "cross multiply", "solve", "equivalent", "ratio", "x"],
    icon: "Equal",
    popularity: 70,
    fields: [
      { key: "unknown", label: "Which value is unknown?", kind: "select", def: "d",
        options: [
          { value: "a", label: "a  (top left)" },
          { value: "b", label: "b  (bottom left)" },
          { value: "c", label: "c  (top right)" },
          { value: "d", label: "d  (bottom right)" },
        ] },
      { key: "a", label: "a", def: 3, showIf: { key: "unknown", in: ["b", "c", "d"] } },
      { key: "b", label: "b", def: 4, showIf: { key: "unknown", in: ["a", "c", "d"] } },
      { key: "c", label: "c", def: 9, showIf: { key: "unknown", in: ["a", "b", "d"] } },
      { key: "d", label: "d", def: 12, showIf: { key: "unknown", in: ["a", "b", "c"] } },
    ],
    formula: "a × d = b × c",
    how: "Cross-multiplication turns the proportion into a single multiplication, then one division isolates the unknown. The check row multiplies both diagonals so you can see they now match.",
    examples: [
      { label: "3/4 = 9/x", inputs: { unknown: "d", a: 3, b: 4, c: 9 }, expect: "12" },
      { label: "x/8 = 5/20", inputs: { unknown: "a", b: 8, c: 5, d: 20 }, expect: "2" },
    ],
    compute: (v) => {
      const u = String(v.unknown);
      const g = (k: string) => need(Number(v[k]), `value ${k}`);
      let a = 0;
      let b = 0;
      let c = 0;
      let d = 0;
      if (u === "a") {
        [b, c, d] = [g("b"), g("c"), g("d")];
        if (d === 0) fail("d cannot be zero when solving for a.");
        a = (b * c) / d;
      } else if (u === "b") {
        [a, c, d] = [g("a"), g("c"), g("d")];
        if (c === 0) fail("c cannot be zero when solving for b.");
        b = (a * d) / c;
      } else if (u === "c") {
        [a, b, d] = [g("a"), g("b"), g("d")];
        if (b === 0) fail("b cannot be zero when solving for c.");
        c = (a * d) / b;
      } else {
        [a, b, c] = [g("a"), g("b"), g("c")];
        if (a === 0) fail("a cannot be zero when solving for d.");
        d = (b * c) / a;
      }
      const solved = { a, b, c, d }[u as "a" | "b" | "c" | "d"];
      return {
        rows: [
          P(`${u} =`, fmt(solved)),
          R("Completed proportion", `${fmt(a)}/${fmt(b)} = ${fmt(c)}/${fmt(d)}`),
          R("Cross product check", `${fmt(a * d)} = ${fmt(b * c)}`),
          M("Scale factor (left → right)", fmt(c / a, 6)),
        ],
      };
    },
  },

  {
    id: "average-calculator",
    name: "Average Calculator",
    category: "mathematics",
    description: "Mean, median, mode and range for any list of numbers you paste in.",
    keywords: ["average", "mean", "median", "mode", "range", "list"],
    icon: "Sigma",
    featured: true,
    popularity: 86,
    fields: [
      { key: "data", label: "Numbers", kind: "textarea", def: "4, 8, 15, 16, 23, 42", wide: true, placeholder: "Paste or type numbers separated by commas, spaces or new lines" },
    ],
    formula: "mean = Σx ÷ n",
    how: "Paste values straight from a spreadsheet — commas, spaces, semicolons and line breaks all work as separators. The three averages are shown together because they answer different questions about the same data.",
    examples: [
      { label: "Six values", inputs: { data: "4, 8, 15, 16, 23, 42" }, expect: "18" },
      { label: "With a repeat", inputs: { data: "2 2 3 9" }, expect: "4" },
    ],
    compute: (v) => {
      const a = nums(v.data);
      const md = modes(a);
      return {
        rows: [
          P("Mean (average)", fmt(mean(a), 6)),
          R("Median", fmt(median(a), 6)),
          R("Mode", md.length ? md.map((x) => fmt(x)).join(", ") : "no repeated value"),
          R("Sum", fmt(sum(a))),
          R("Count", fmt(a.length)),
          R("Range", `${fmt(Math.min(...a))} → ${fmt(Math.max(...a))}  (${fmt(Math.max(...a) - Math.min(...a))})`),
          M("Geometric mean", a.every((x) => x > 0) ? fmt(Math.exp(mean(a.map(Math.log))), 6) : "needs all positive values"),
        ],
      };
    },
  },

  {
    id: "prime-number-checker",
    name: "Prime Number Checker",
    category: "mathematics",
    description: "Test whether a number is prime and see its divisors and nearest primes.",
    keywords: ["prime", "composite", "divisor", "factor", "check"],
    icon: "Hash",
    popularity: 68,
    fields: [{ key: "n", label: "Whole number", def: 97, min: 0 }],
    formula: "n is prime ⟺ no divisor d with 2 ≤ d ≤ √n",
    how: "Only divisors up to the square root need testing, because any larger factor pairs with a smaller one. That is why checking a seven-digit number is instant.",
    examples: [
      { label: "97", inputs: { n: 97 }, expect: "Prime" },
      { label: "91 = 7 × 13", inputs: { n: 91 }, expect: "Composite" },
    ],
    compute: (v) => {
      const n = Math.trunc(need(v.n, "the number"));
      if (n < 0) fail("Enter a number of 0 or more.");
      const prime = isPrime(n);
      const nextPrime = (from: number, dir: 1 | -1): number | null => {
        for (let k = from + dir; k >= 2 && k < from + dir * 100000; k += dir) if (isPrime(k)) return k;
        return null;
      };
      const prev = nextPrime(n, -1);
      const next = nextPrime(n, 1);
      const f = prime ? [] : primeFactors(n);
      return {
        rows: [
          prime ? Good("Verdict", "Prime") : Bad("Verdict", n < 2 ? `Not prime (${n} is neither prime nor composite)` : "Composite"),
          R("Number", fmt(n)),
          R("Prime factorisation", n < 2 ? "—" : f.length ? f.join(" × ") : String(n)),
          R("Number of divisors", n < 1 ? "—" : fmt(divisors(n).length)),
          R("Previous prime", prev ? fmt(prev) : "—"),
          R("Next prime", next ? fmt(next) : "—"),
          M("Divisors", n < 1 || divisors(n).length > 24 ? `${fmt(divisors(n).length)} divisors` : divisors(n).join(", ")),
        ],
      };
    },
  },

  {
    id: "prime-factorization-calculator",
    name: "Prime Factorization Calculator",
    category: "mathematics",
    description: "Break a number into its prime factors with exponents and divisor totals.",
    keywords: ["prime factorization", "factor tree", "factors", "exponent", "divisors"],
    icon: "Braces",
    popularity: 72,
    fields: [{ key: "n", label: "Whole number", def: 360, min: 2 }],
    formula: "n = p₁^a₁ × p₂^a₂ × … × pₖ^aₖ",
    how: "Trial division by increasing primes gives the unique factorisation guaranteed by the fundamental theorem of arithmetic. The divisor count follows directly from the exponents: (a₁+1)(a₂+1)…",
    examples: [
      { label: "360", inputs: { n: 360 }, expect: "2³ × 3² × 5" },
      { label: "1001", inputs: { n: 1001 }, expect: "7 × 11 × 13" },
    ],
    compute: (v) => {
      const n = Math.trunc(needPos(v.n, "the number"));
      if (n < 2) fail("Enter a whole number of 2 or more.");
      const f = primeFactors(n);
      const counts = new Map<number, number>();
      f.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1));
      const expForm = [...counts.entries()]
        .map(([p, e]) => (e === 1 ? String(p) : `${p}${sup(e)}`))
        .join(" × ");
      const divs = divisors(n);
      return {
        rows: [
          P("Prime factorisation", expForm),
          R("Expanded", f.join(" × ")),
          R("Distinct primes", fmt(counts.size)),
          R("Total prime factors (with repeats)", fmt(f.length)),
          R("Number of divisors", fmt(divs.length)),
          R("Sum of divisors", fmt(sum(divs))),
          M("Divisors", divs.length > 32 ? `${fmt(divs.length)} divisors` : divs.join(", ")),
        ],
        note: counts.size === 1 && f.length === 1 ? `${n} is prime.` : undefined,
      };
    },
  },

  {
    id: "gcd-calculator",
    name: "GCD Calculator",
    category: "mathematics",
    description: "Greatest common divisor of two or more whole numbers.",
    keywords: ["gcd", "hcf", "greatest common divisor", "highest common factor", "euclid"],
    icon: "Hash",
    popularity: 66,
    fields: [{ key: "data", label: "Numbers", kind: "textarea", def: "48, 180, 210", wide: true }],
    formula: "gcd(a, b) = gcd(b, a mod b)   (Euclid's algorithm)",
    how: "Euclid's algorithm repeatedly replaces the larger number with the remainder, which reaches the answer in a handful of steps even for very large inputs. For more than two numbers it is applied pairwise.",
    examples: [
      { label: "48 and 180", inputs: { data: "48, 180" }, expect: "12" },
      { label: "Three numbers", inputs: { data: "48, 180, 210" }, expect: "6" },
    ],
    compute: (v) => {
      const a = nums(v.data).map((x) => Math.trunc(x));
      if (a.length < 2) fail("Enter at least two numbers.");
      if (a.some((x) => x === 0)) fail("Use non-zero whole numbers.");
      const g = a.reduce((x, y) => gcd(x, y));
      const l = a.reduce((x, y) => lcm(x, y));
      return {
        rows: [
          P("Greatest common divisor", fmt(g)),
          R("Least common multiple", fmt(l)),
          R("Coprime?", g === 1 ? "Yes — no common factor above 1" : "No"),
          R("Reduced ratio", a.map((x) => fmt(x / g)).join(" : ")),
          M("Common factors", divisors(g).join(", ")),
        ],
      };
    },
  },

  {
    id: "lcm-calculator",
    name: "LCM Calculator",
    category: "mathematics",
    description: "Least common multiple of a list of whole numbers.",
    keywords: ["lcm", "least common multiple", "lowest common denominator", "multiple"],
    icon: "Hash",
    popularity: 64,
    fields: [{ key: "data", label: "Numbers", kind: "textarea", def: "4, 6, 15", wide: true }],
    formula: "lcm(a, b) = |a × b| ÷ gcd(a, b)",
    how: "The least common multiple is the smallest number every input divides into — the value you need as a common denominator when adding fractions, or to find when repeating cycles line up again.",
    examples: [
      { label: "4 and 6", inputs: { data: "4, 6" }, expect: "12" },
      { label: "4, 6 and 15", inputs: { data: "4, 6, 15" }, expect: "60" },
    ],
    compute: (v) => {
      const a = nums(v.data).map((x) => Math.trunc(x));
      if (a.length < 2) fail("Enter at least two numbers.");
      if (a.some((x) => x === 0)) fail("Use non-zero whole numbers.");
      const l = a.reduce((x, y) => lcm(x, y));
      const g = a.reduce((x, y) => gcd(x, y));
      return {
        rows: [
          P("Least common multiple", fmt(l)),
          R("Greatest common divisor", fmt(g)),
          R("Multipliers to reach the LCM", a.map((x) => `${fmt(x)}×${fmt(l / x)}`).join("  ·  ")),
          R("Product of all inputs", fmt(a.reduce((x, y) => x * y, 1))),
          M("Next three common multiples", [2, 3, 4].map((k) => fmt(l * k)).join(", ")),
        ],
      };
    },
  },

  {
    id: "factorial-calculator",
    name: "Factorial Calculator",
    category: "mathematics",
    description: "Exact factorials of large numbers, with digit counts and approximations.",
    keywords: ["factorial", "n!", "permutation", "stirling", "combinatorics"],
    icon: "Superscript",
    popularity: 62,
    fields: [{ key: "n", label: "n", def: 20, min: 0, max: 2000, step: 1 }],
    formula: "n! = 1 × 2 × 3 × … × n,  0! = 1",
    how: "Values above 170! exceed the floating-point range, so the exact answer is computed with arbitrary-precision integers. Stirling's approximation is shown alongside for scale.",
    examples: [
      { label: "20!", inputs: { n: 20 }, expect: "2432902008176640000" },
      { label: "5!", inputs: { n: 5 }, expect: "120" },
    ],
    compute: (v) => {
      const n = Math.trunc(need(v.n, "n"));
      if (n < 0) fail("Factorials need a whole number of 0 or more.");
      if (n > 2000) fail("Keep n at 2000 or below.");
      const exact = factorialBig(n);
      const lnFact = Array.from({ length: n }, (_, i) => Math.log(i + 1)).reduce((a, b) => a + b, 0);
      const stirling = 0.5 * Math.log(2 * Math.PI * Math.max(n, 1)) + n * (Math.log(Math.max(n, 1)) - 1);
      return {
        rows: [
          P(`${n}!`, exact.length > 60 ? `${exact.slice(0, 40)}… (${exact.length} digits)` : exact),
          R("Number of digits", fmt(exact.length)),
          R("Scientific notation", n === 0 ? "1" : sci(Number(`${exact[0]}.${exact.slice(1, 12)}`) * Math.pow(10, exact.length - 1), 6)),
          R("ln(n!)", fmt(lnFact, 6)),
          M("Stirling approximation of ln(n!)", fmt(stirling, 6)),
          M("Trailing zeros", fmt((exact.match(/0+$/)?.[0] ?? "").length)),
        ],
        note: exact.length > 60 ? "Long results are truncated for display; the digit count is exact." : undefined,
      };
    },
  },

  {
    id: "combinations-permutations-calculator",
    name: "Combinations & Permutations Calculator",
    category: "mathematics",
    description: "nCr and nPr with and without repetition, for counting problems.",
    keywords: ["combination", "permutation", "ncr", "npr", "choose", "combinatorics", "probability"],
    icon: "Dices",
    popularity: 70,
    fields: [
      { key: "n", label: "Items to choose from (n)", def: 10, min: 0, step: 1 },
      { key: "r", label: "Items chosen (r)", def: 3, min: 0, step: 1 },
    ],
    formula: [
      "C(n, r) = n! ÷ (r! × (n − r)!)",
      "P(n, r) = n! ÷ (n − r)!",
      "with repetition: C = (n + r − 1)! ÷ (r! (n − 1)!),  P = nʳ",
    ],
    how: "Use combinations when order does not matter (a lottery draw) and permutations when it does (a podium finish). Repetition variants apply when items can be reused.",
    examples: [
      { label: "Choose 3 of 10", inputs: { n: 10, r: 3 }, expect: "120" },
      { label: "Order 3 of 10", inputs: { n: 10, r: 3 }, expect: "720" },
    ],
    compute: (v) => {
      const n = Math.trunc(need(v.n, "n"));
      const r = Math.trunc(need(v.r, "r"));
      if (n < 0 || r < 0) fail("Both values must be zero or more.");
      if (r > n) fail("r cannot be larger than n (unless repetition is allowed — see the last two rows).");
      if (n > 1000) fail("Keep n at 1000 or below.");
      return {
        rows: [
          P(`C(${n}, ${r})  — order ignored`, fmt(nCr(n, r))),
          R(`P(${n}, ${r})  — order matters`, fmt(nPr(n, r))),
          R("Combinations with repetition", fmt(nCr(n + r - 1, r))),
          R("Permutations with repetition", fmt(Math.pow(n, r))),
          M("Total subsets of n items", n <= 60 ? fmt(Math.pow(2, n)) : sci(Math.pow(2, n), 4)),
          M("Probability of one specific combination", nCr(n, r) ? `1 in ${fmt(nCr(n, r))}` : "—"),
        ],
      };
    },
  },

  {
    id: "quadratic-equation-calculator",
    name: "Quadratic Equation Calculator",
    category: "mathematics",
    description: "Solve ax² + bx + c = 0 with real or complex roots, vertex and factored form.",
    keywords: ["quadratic", "roots", "discriminant", "parabola", "vertex", "equation"],
    icon: "Sigma",
    featured: true,
    popularity: 84,
    fields: [
      { key: "a", label: "a  (x² coefficient)", def: 1 },
      { key: "b", label: "b  (x coefficient)", def: -3 },
      { key: "c", label: "c  (constant)", def: 2 },
    ],
    formula: ["x = (−b ± √(b² − 4ac)) ÷ 2a", "vertex = (−b ÷ 2a,  c − b² ÷ 4a)"],
    how: "The discriminant b² − 4ac decides everything: positive gives two real roots, zero gives one repeated root, negative gives a complex-conjugate pair. The vertex and axis of symmetry describe the parabola itself.",
    examples: [
      { label: "x² − 3x + 2", inputs: { a: 1, b: -3, c: 2 }, expect: "x₁ = 2" },
      { label: "No real roots", inputs: { a: 1, b: 2, c: 5 }, expect: "complex" },
    ],
    compute: (v) => {
      const a = need(v.a, "a");
      const b = need(v.b, "b");
      const c = need(v.c, "c");
      if (a === 0) fail("With a = 0 this is a linear equation — use the Linear Equation Solver.");
      const { roots, disc } = quadraticRoots(a, b, c);
      const vx = -b / (2 * a);
      const vy = c - (b * b) / (4 * a);
      return {
        rows: [
          P(
            "Roots",
            roots.length === 1 ? `x = ${roots[0]} (repeated)` : `x₁ = ${roots[0]},  x₂ = ${roots[1]}`,
          ),
          R("Discriminant  b² − 4ac", fmt(disc)),
          R("Nature of roots", disc > 0 ? "Two distinct real roots" : disc === 0 ? "One repeated real root" : "Two complex conjugate roots"),
          R("Vertex", `(${fmt(vx, 6)}, ${fmt(vy, 6)})`),
          R("Axis of symmetry", `x = ${fmt(vx, 6)}`),
          R("Opens", a > 0 ? "Upwards (minimum at the vertex)" : "Downwards (maximum at the vertex)"),
          M("Factored form", disc >= 0 ? `${fmt(a)}(x − ${roots[0]})(x − ${roots[roots.length - 1]})` : "not factorable over the reals"),
          M("Sum · product of roots", `${fmt(-b / a, 6)} · ${fmt(c / a, 6)}`),
        ],
      };
    },
  },

  {
    id: "linear-equation-solver",
    name: "Linear Equation Solver",
    category: "mathematics",
    description: "Solve ax + b = cx + d for x, with a full check of the result.",
    keywords: ["linear", "equation", "solve for x", "algebra", "one variable"],
    icon: "Equal",
    popularity: 72,
    fields: [
      { key: "a", label: "a  (left x coefficient)", def: 2 },
      { key: "b", label: "b  (left constant)", def: 3 },
      { key: "c", label: "c  (right x coefficient)", def: 0 },
      { key: "d", label: "d  (right constant)", def: 11 },
    ],
    formula: "x = (d − b) ÷ (a − c)",
    how: "Collect the x terms on one side and the constants on the other, then divide. If a = c the lines are parallel: either no solution, or every value of x works.",
    examples: [
      { label: "2x + 3 = 11", inputs: { a: 2, b: 3, c: 0, d: 11 }, expect: "4" },
      { label: "5x − 2 = 3x + 8", inputs: { a: 5, b: -2, c: 3, d: 8 }, expect: "5" },
    ],
    compute: (v) => {
      const a = need(v.a, "a");
      const b = need(v.b, "b");
      const c = need(v.c, "c");
      const d = need(v.d, "d");
      if (a === c) {
        return [
          P("Solution", b === d ? "Every value of x is a solution" : "No solution"),
          M("Reason", b === d ? "Both sides are identical." : "The x terms cancel but the constants differ."),
        ];
      }
      const x = (d - b) / (a - c);
      return {
        rows: [
          P("x =", fmt(x, 8)),
          R("Equation", `${fmt(a)}x ${b < 0 ? "−" : "+"} ${fmt(Math.abs(b))} = ${fmt(c)}x ${d < 0 ? "−" : "+"} ${fmt(Math.abs(d))}`),
          R("Left side at x", fmt(a * x + b, 8)),
          R("Right side at x", fmt(c * x + d, 8)),
          M("As a fraction", `${fmt(d - b)}/${fmt(a - c)}`),
        ],
        steps: [
          `Move the x terms left: (${fmt(a)} − ${fmt(c)})x = ${fmt(d)} − ${fmt(b)}`,
          `Simplify: ${fmt(a - c)}x = ${fmt(d - b)}`,
          `Divide both sides by ${fmt(a - c)}: x = ${fmt(x, 8)}`,
        ],
      };
    },
  },

  {
    id: "simultaneous-equations-solver",
    name: "Simultaneous Equations Solver",
    category: "mathematics",
    description: "Solve two linear equations in two unknowns using determinants.",
    keywords: ["simultaneous", "system of equations", "two unknowns", "cramer", "linear algebra"],
    icon: "Grid3x3",
    popularity: 66,
    fields: [
      { key: "a1", label: "a₁  (x in eq. 1)", def: 2 },
      { key: "b1", label: "b₁  (y in eq. 1)", def: 3 },
      { key: "c1", label: "c₁  (eq. 1 equals)", def: 12 },
      { key: "a2", label: "a₂  (x in eq. 2)", def: 1 },
      { key: "b2", label: "b₂  (y in eq. 2)", def: -1 },
      { key: "c2", label: "c₂  (eq. 2 equals)", def: 1 },
    ],
    formula: ["D = a₁b₂ − a₂b₁", "x = (c₁b₂ − c₂b₁) ÷ D", "y = (a₁c₂ − a₂c₁) ÷ D"],
    how: "Cramer's rule solves the system with three determinants. When D = 0 the two lines are parallel — either identical (infinitely many solutions) or never meeting (none).",
    examples: [
      { label: "2x+3y=12, x−y=1", inputs: { a1: 2, b1: 3, c1: 12, a2: 1, b2: -1, c2: 1 }, expect: "x = 3" },
    ],
    compute: (v) => {
      const [a1, b1, c1, a2, b2, c2] = ["a1", "b1", "c1", "a2", "b2", "c2"].map((k) => need(v[k], k));
      const D = a1 * b2 - a2 * b1;
      if (D === 0) {
        const same = a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1;
        return [
          P("Solution", same ? "Infinitely many solutions — the equations describe the same line" : "No solution — the lines are parallel"),
          M("Determinant", "0"),
        ];
      }
      const x = (c1 * b2 - c2 * b1) / D;
      const y = (a1 * c2 - a2 * c1) / D;
      return {
        rows: [
          P("Solution", `x = ${fmt(x, 8)},  y = ${fmt(y, 8)}`),
          R("x", fmt(x, 8)),
          R("y", fmt(y, 8)),
          R("Determinant D", fmt(D)),
          R("Check equation 1", `${fmt(a1 * x + b1 * y, 6)} = ${fmt(c1)}`),
          R("Check equation 2", `${fmt(a2 * x + b2 * y, 6)} = ${fmt(c2)}`),
          M("Intersection point", `(${fmt(x, 6)}, ${fmt(y, 6)})`),
        ],
      };
    },
  },

  {
    id: "matrix-calculator",
    name: "Matrix Calculator",
    category: "mathematics",
    description: "Add, multiply, transpose, invert and take determinants of matrices.",
    keywords: ["matrix", "determinant", "inverse", "transpose", "multiply", "linear algebra"],
    icon: "Grid3x3",
    featured: true,
    popularity: 76,
    fields: [
      { key: "op", label: "Operation", kind: "select", def: "multiply",
        options: [
          { value: "add", label: "A + B" },
          { value: "subtract", label: "A − B" },
          { value: "multiply", label: "A × B" },
          { value: "scalar", label: "k × A" },
          { value: "transpose", label: "Transpose of A" },
          { value: "determinant", label: "Determinant of A" },
          { value: "inverse", label: "Inverse of A" },
        ] },
      { key: "A", label: "Matrix A", kind: "textarea", def: "1 2\n3 4", wide: true, help: "One row per line, values separated by spaces or commas" },
      { key: "B", label: "Matrix B", kind: "textarea", def: "0 1\n1 0", wide: true, showIf: { key: "op", in: ["add", "subtract", "multiply"] } },
      { key: "k", label: "Scalar k", def: 2, showIf: { key: "op", in: ["scalar"] } },
    ],
    formula: ["(AB)ᵢⱼ = Σₖ aᵢₖ bₖⱼ", "det(2×2) = ad − bc", "A⁻¹ = adj(A) ÷ det(A)"],
    how: "Matrices are entered as plain text — one row per line — so you can paste them from anywhere. Inverses use Gauss–Jordan elimination with partial pivoting, which stays numerically stable where the adjugate formula does not.",
    examples: [
      { label: "Determinant of [[1,2],[3,4]]", inputs: { op: "determinant", A: "1 2\n3 4" }, expect: "-2" },
      { label: "Multiply by a swap matrix", inputs: { op: "multiply", A: "1 2\n3 4", B: "0 1\n1 0" }, expect: "2" },
    ],
    compute: (v) => {
      const A = matrix(v.A, "matrix A");
      const op = String(v.op);
      const dims = (m: number[][]) => `${m.length}×${m[0].length}`;

      if (op === "determinant") {
        const d = det(A);
        return {
          rows: [
            P("Determinant", fmt(d, 8)),
            R("Size", dims(A)),
            R("Invertible?", Math.abs(d) > 1e-12 ? "Yes" : "No — the matrix is singular"),
            M("Trace (sum of the diagonal)", fmt(sum(A.map((r, i) => r[i] ?? 0)))),
          ],
          table: mtable(A, "Matrix A"),
        };
      }
      if (op === "transpose") {
        const T = A[0].map((_, j) => A.map((r) => r[j]));
        return { rows: [P("Result", `${dims(T)} matrix`), R("Original size", dims(A))], table: mtable(T, "Aᵀ") };
      }
      if (op === "inverse") {
        const I = inverse(A);
        return {
          rows: [P("Result", `${dims(I)} inverse matrix`), R("Determinant", fmt(det(A), 8))],
          table: mtable(I, "A⁻¹"),
        };
      }
      if (op === "scalar") {
        const k = need(v.k, "the scalar k");
        const S = A.map((r) => r.map((x) => x * k));
        return { rows: [P("Result", `${dims(S)} matrix scaled by ${fmt(k)}`)], table: mtable(S, `${fmt(k)} × A`) };
      }

      const B = matrix(v.B, "matrix B");
      if (op === "multiply") {
        const Mx = mul(A, B);
        return {
          rows: [P("Result", `${dims(Mx)} matrix`), R("A", dims(A)), R("B", dims(B))],
          table: mtable(Mx, "A × B"),
        };
      }
      if (A.length !== B.length || A[0].length !== B[0].length) fail("Addition and subtraction need matrices of the same size.");
      const Rm = A.map((r, i) => r.map((x, j) => (op === "add" ? x + B[i][j] : x - B[i][j])));
      return {
        rows: [P("Result", `${dims(Rm)} matrix`), R("Operation", op === "add" ? "A + B" : "A − B")],
        table: mtable(Rm, op === "add" ? "A + B" : "A − B"),
      };
    },
  },

  {
    id: "complex-number-calculator",
    name: "Complex Number Calculator",
    category: "mathematics",
    description: "Arithmetic on complex numbers with modulus, argument and polar form.",
    keywords: ["complex", "imaginary", "modulus", "argument", "polar", "conjugate", "i"],
    icon: "Sigma",
    popularity: 58,
    fields: [
      { key: "a", label: "Real part of z₁", def: 3 },
      { key: "b", label: "Imaginary part of z₁", def: 4 },
      { key: "op", label: "Operation", kind: "select", options: OPS, def: "*" },
      { key: "c", label: "Real part of z₂", def: 1 },
      { key: "d", label: "Imaginary part of z₂", def: -2 },
    ],
    formula: [
      "(a+bi)(c+di) = (ac − bd) + (ad + bc)i",
      "(a+bi)/(c+di) = ((ac+bd) + (bc−ad)i) ÷ (c² + d²)",
      "|z| = √(a² + b²),  arg z = atan2(b, a)",
    ],
    how: "Real and imaginary parts are tracked separately; division multiplies through by the conjugate of the denominator. Polar form is given with the argument in both degrees and radians.",
    examples: [
      { label: "(3+4i)(1−2i)", inputs: { a: 3, b: 4, op: "*", c: 1, d: -2 }, expect: "11 − 2i" },
      { label: "(3+4i)+(1−2i)", inputs: { a: 3, b: 4, op: "+", c: 1, d: -2 }, expect: "4 + 2i" },
    ],
    compute: (v) => {
      const [a, b, c, d] = ["a", "b", "c", "d"].map((k) => need(v[k], k));
      const op = String(v.op);
      let re: number;
      let im: number;
      if (op === "+") [re, im] = [a + c, b + d];
      else if (op === "-") [re, im] = [a - c, b - d];
      else if (op === "*") [re, im] = [a * c - b * d, a * d + b * c];
      else {
        const den = c * c + d * d;
        if (den === 0) fail("Cannot divide by zero.");
        [re, im] = [(a * c + b * d) / den, (b * c - a * d) / den];
      }
      const mod = Math.hypot(re, im);
      const arg = Math.atan2(im, re);
      return {
        rows: [
          P("Result", cplx(re, im)),
          R("Modulus |z|", fmt(mod, 8)),
          R("Argument", `${fmt((arg * 180) / Math.PI, 6)}°  (${fmt(arg, 6)} rad)`),
          R("Polar form", `${fmt(mod, 6)} ∠ ${fmt((arg * 180) / Math.PI, 4)}°`),
          R("Conjugate", cplx(re, -im)),
          M("z₁ modulus · z₂ modulus", `${fmt(Math.hypot(a, b), 6)} · ${fmt(Math.hypot(c, d), 6)}`),
          M("Exponential form", `${fmt(mod, 6)}e^(${fmt(arg, 6)}i)`),
        ],
      };
    },
  },

  {
    id: "logarithm-calculator",
    name: "Logarithm Calculator",
    category: "mathematics",
    description: "Logarithms to any base, plus natural log, log₁₀, log₂ and antilogs.",
    keywords: ["log", "logarithm", "ln", "natural log", "base", "antilog", "exponent"],
    icon: "Superscript",
    popularity: 74,
    fields: [
      { key: "x", label: "Value (x)", def: 1000, min: 0 },
      { key: "base", label: "Base", def: 10, min: 0 },
    ],
    formula: ["log_b(x) = ln x ÷ ln b", "b^(log_b x) = x"],
    how: "A logarithm answers “what power turns the base into this number?”. Any base is computed from natural logs by the change-of-base rule, which is exactly how calculators do it internally.",
    examples: [
      { label: "log₁₀ 1000", inputs: { x: 1000, base: 10 }, expect: "3" },
      { label: "log₂ 256", inputs: { x: 256, base: 2 }, expect: "8" },
    ],
    compute: (v) => {
      const x = need(v.x, "the value");
      const base = need(v.base, "the base");
      if (x <= 0) fail("Logarithms are only defined for values above zero.");
      if (base <= 0 || base === 1) fail("The base must be positive and not equal to 1.");
      const l = Math.log(x) / Math.log(base);
      return {
        rows: [
          P(`log${base === 10 ? "₁₀" : base === 2 ? "₂" : ` base ${fmt(base)}`} ${fmt(x)}`, fmt(l, 8)),
          R("Natural log  ln x", fmt(Math.log(x), 8)),
          R("Common log  log₁₀ x", fmt(Math.log10(x), 8)),
          R("Binary log  log₂ x", fmt(Math.log2(x), 8)),
          R("Check  base^result", fmt(Math.pow(base, l), 6)),
          M("Antilog of x in this base", fmt(Math.pow(base, x), 6)),
        ],
      };
    },
  },

  {
    id: "exponent-calculator",
    name: "Exponent Calculator",
    category: "mathematics",
    description: "Raise any number to any power, including negative and fractional exponents.",
    keywords: ["exponent", "power", "squared", "cubed", "index", "raise"],
    icon: "Superscript",
    popularity: 78,
    fields: [
      { key: "base", label: "Base", def: 2 },
      { key: "exp", label: "Exponent", def: 10 },
    ],
    formula: ["bⁿ = b × b × … (n times)", "b^(−n) = 1 ÷ bⁿ", "b^(1/n) = ⁿ√b"],
    how: "Fractional exponents are roots and negative exponents are reciprocals — the same rule extended. Negative bases with fractional exponents have no real value, and that is reported rather than silently returning NaN.",
    examples: [
      { label: "2¹⁰", inputs: { base: 2, exp: 10 }, expect: "1,024" },
      { label: "Negative exponent", inputs: { base: 5, exp: -2 }, expect: "0.04" },
    ],
    compute: (v) => {
      const b = need(v.base, "the base");
      const e = need(v.exp, "the exponent");
      const r = Math.pow(b, e);
      if (!Number.isFinite(r) || Number.isNaN(r)) fail("That combination has no real value (a negative base with a fractional exponent).");
      return {
        rows: [
          P(`${fmt(b)}${Number.isInteger(e) && Math.abs(e) < 100 ? sup(e) : `^${fmt(e)}`}`, fmt(r, 10)),
          R("Scientific notation", sci(r, 6)),
          R("Reciprocal  b^(−n)", r === 0 ? "—" : fmt(1 / r, 10)),
          R("Base squared", fmt(b * b)),
          R("Base cubed", fmt(b ** 3)),
          M("Logarithm check  log_b(result)", b > 0 && b !== 1 && r > 0 ? fmt(Math.log(r) / Math.log(b), 6) : "—"),
        ],
      };
    },
  },

  {
    id: "root-calculator",
    name: "Root Calculator",
    category: "mathematics",
    description: "Square, cube and nth roots of any number, including negative bases.",
    keywords: ["root", "square root", "cube root", "nth root", "radical", "surd"],
    icon: "Sigma",
    popularity: 76,
    fields: [
      { key: "x", label: "Value", def: 729 },
      { key: "n", label: "Root (n)", def: 3, step: 1 },
    ],
    formula: "ⁿ√x = x^(1/n)",
    how: "Odd roots of negative numbers are real (∛−8 = −2) while even roots are not, so the sign is handled explicitly instead of returning NaN.",
    examples: [
      { label: "∛729", inputs: { x: 729, n: 3 }, expect: "9" },
      { label: "√2", inputs: { x: 2, n: 2 }, expect: "1.4142" },
    ],
    compute: (v) => {
      const x = need(v.x, "the value");
      const n = need(v.n, "the root");
      if (n === 0) fail("The root cannot be zero.");
      const even = Math.abs(n % 2) === 0;
      if (x < 0 && even) fail(`An even root of a negative number has no real value.`);
      const r = Math.sign(x) * Math.pow(Math.abs(x), 1 / n);
      return {
        rows: [
          P(`${n === 2 ? "√" : n === 3 ? "∛" : `${fmt(n)}√`}${fmt(x)}`, fmt(r, 10)),
          R("Square root", x < 0 ? "no real value" : fmt(Math.sqrt(x), 10)),
          R("Cube root", fmt(Math.cbrt(x), 10)),
          R("Check  resultⁿ", fmt(Math.pow(r, n), 6)),
          R("Exact?", Number.isInteger(round(r, 10)) ? "Yes — a perfect root" : "No — irrational or non-integer"),
          M("As a power", `${fmt(x)}^(1/${fmt(n)})`),
        ],
      };
    },
  },

  {
    id: "arithmetic-sequence-calculator",
    name: "Arithmetic Sequence Calculator",
    category: "mathematics",
    description: "nth term and sum of a sequence with a constant difference.",
    keywords: ["arithmetic", "sequence", "series", "nth term", "common difference", "sum"],
    icon: "LineChart",
    popularity: 60,
    fields: [
      { key: "a1", label: "First term (a₁)", def: 3 },
      { key: "d", label: "Common difference (d)", def: 5 },
      { key: "n", label: "Term to find (n)", def: 10, min: 1, step: 1 },
    ],
    formula: ["aₙ = a₁ + (n − 1)d", "Sₙ = n ÷ 2 × (a₁ + aₙ)"],
    how: "Each term adds the same amount. The sum uses Gauss's pairing trick: pair the first with the last, the second with the second-last, and every pair has the same total.",
    examples: [
      { label: "3, 8, 13, … 10th term", inputs: { a1: 3, d: 5, n: 10 }, expect: "48" },
    ],
    compute: (v) => {
      const a1 = need(v.a1, "the first term");
      const d = need(v.d, "the common difference");
      const n = Math.trunc(needPos(v.n, "n"));
      if (n > 1e6) fail("Keep n at one million or below.");
      const an = a1 + (n - 1) * d;
      const s = (n / 2) * (a1 + an);
      const preview = Array.from({ length: Math.min(n, 12) }, (_, i) => fmt(a1 + i * d));
      return {
        rows: [
          P(`Term ${n}  (a${n})`, fmt(an)),
          R(`Sum of the first ${n} terms`, fmt(s)),
          R("Common difference", fmt(d)),
          R("Mean of the terms", fmt(s / n, 6)),
          M("Sequence", `${preview.join(", ")}${n > 12 ? ", …" : ""}`),
          M("General term", `aₙ = ${fmt(a1)} + (n − 1)×${fmt(d)}`),
        ],
      };
    },
  },

  {
    id: "geometric-sequence-calculator",
    name: "Geometric Sequence Calculator",
    category: "mathematics",
    description: "nth term, partial sum and infinite sum of a geometric sequence.",
    keywords: ["geometric", "sequence", "series", "common ratio", "compound", "sum to infinity"],
    icon: "TrendingUp",
    popularity: 58,
    fields: [
      { key: "a1", label: "First term (a₁)", def: 2 },
      { key: "r", label: "Common ratio (r)", def: 3 },
      { key: "n", label: "Term to find (n)", def: 5, min: 1, step: 1 },
    ],
    formula: ["aₙ = a₁ × r^(n−1)", "Sₙ = a₁(1 − rⁿ) ÷ (1 − r)", "S∞ = a₁ ÷ (1 − r)  for |r| < 1"],
    how: "Each term multiplies by the same ratio, so growth is exponential. When the ratio is between −1 and 1 the terms shrink fast enough that even an infinite number of them adds to a finite total.",
    examples: [
      { label: "2, 6, 18, … 5th term", inputs: { a1: 2, r: 3, n: 5 }, expect: "162" },
      { label: "Halving series", inputs: { a1: 1, r: 0.5, n: 10 }, expect: "2" },
    ],
    compute: (v) => {
      const a1 = need(v.a1, "the first term");
      const r = need(v.r, "the common ratio");
      const n = Math.trunc(needPos(v.n, "n"));
      if (n > 10000) fail("Keep n at 10,000 or below.");
      const an = a1 * Math.pow(r, n - 1);
      const s = r === 1 ? a1 * n : (a1 * (1 - Math.pow(r, n))) / (1 - r);
      const conv = Math.abs(r) < 1;
      const preview = Array.from({ length: Math.min(n, 10) }, (_, i) => fmt(a1 * Math.pow(r, i), 6));
      return {
        rows: [
          P(`Term ${n}  (a${n})`, fmt(an, 8)),
          R(`Sum of the first ${n} terms`, fmt(s, 8)),
          conv ? Good("Sum to infinity", fmt(a1 / (1 - r), 8)) : M("Sum to infinity", "diverges — |r| must be below 1"),
          R("Common ratio", fmt(r)),
          R("Growth per term", `${fmt((r - 1) * 100, 4)}%`),
          M("Sequence", `${preview.join(", ")}${n > 10 ? ", …" : ""}`),
        ],
      };
    },
  },

  {
    id: "significant-figures-calculator",
    name: "Significant Figures Calculator",
    category: "mathematics",
    description: "Round to a chosen number of significant figures and count them.",
    keywords: ["significant figures", "sig figs", "rounding", "precision", "science"],
    icon: "Target",
    popularity: 56,
    fields: [
      { key: "value", label: "Value", def: 0.0045213 },
      { key: "sf", label: "Significant figures", def: 2, min: 1, max: 15, step: 1 },
    ],
    formula: "Round to the first n non-zero digits, counting from the left",
    how: "Leading zeros are never significant, trailing zeros after a decimal point always are. Scientific notation is shown because it is the only unambiguous way to write a value like 4,500 to two significant figures.",
    examples: [
      { label: "0.0045213 to 2 s.f.", inputs: { value: 0.0045213, sf: 2 }, expect: "0.0045" },
      { label: "1234.567 to 5 s.f.", inputs: { value: 1234.567, sf: 5 }, expect: "1,234.6" },
    ],
    compute: (v) => {
      const x = need(v.value, "the value");
      const sf = Math.trunc(needPos(v.sf, "the number of significant figures"));
      if (sf > 15) fail("Use 15 significant figures or fewer.");
      if (x === 0) return [P("Rounded value", "0"), M("Significant figures in the input", "1")];
      const rounded = Number(x.toPrecision(sf));
      const digits = String(Math.abs(x)).replace(/[.\-]/g, "").replace(/^0+/, "");
      const decimals = Math.max(0, sf - Math.floor(Math.log10(Math.abs(rounded))) - 1);
      return {
        rows: [
          P(`Rounded to ${sf} s.f.`, fmt(rounded, decimals)),
          R("Scientific notation", sci(rounded, Math.max(0, sf - 1))),
          R("Significant figures in the input", fmt(digits.replace(/0+$/, "").length || 1)),
          R("Decimal places used", fmt(decimals)),
          R("Rounding difference", fmt(rounded - x, 10)),
          M("Order of magnitude", `10${sup(Math.floor(Math.log10(Math.abs(x))))}`),
        ],
      };
    },
  },
];
