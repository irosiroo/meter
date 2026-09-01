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
    how: "A scientific calculator is only as useful as its expression parser, and this one is built to read the way you naturally write mathematics rather than forcing you into a rigid button sequence. Type the expression directly — using your physical keyboard or the on-screen keypad — and the parser resolves it using standard operator precedence: parentheses first, then exponents, then multiplication and division from left to right, then addition and subtraction. That means 2+3×4 correctly evaluates to 14, not 20, exactly as it would on paper.\n\nBeyond basic order of operations, the parser understands several conveniences that ordinary calculators miss. Implicit multiplication is recognised automatically, so 2π and 3(4+5) work without needing an explicit × sign — useful when transcribing a formula straight from a textbook. Percentages are handled contextually rather than as a fixed key: writing 200+10% correctly returns 220 because the calculator recognises that the percentage should be taken of the base value in an addition, while 200×10% simply returns 20, the plain percentage of 200. This mirrors how percentages are actually used in pricing, tipping and markup calculations, where “+10%” means something different from “×10%”.\n\nFactorials are supported as a postfix operator, so typing 5! evaluates instantly without needing a separate function menu, and nested factorials or expressions like (3+2)! work as expected. Trigonometric functions respect whichever angle mode is currently selected — degrees or radians — shown as a toggle above the keypad, so sin(30) returns 0.5 in degree mode but a different value in radian mode, matching whichever convention your work requires.\n\nEvery calculation is evaluated to full floating-point precision internally, then the result is presented three ways: a cleanly rounded display value, the exact underlying value for cases where extra digits matter, and scientific notation for very large or very small results where a plain decimal would be unwieldy. Session history keeps a running log of everything you have calculated, and tapping any past entry re-loads it into the input so you can build on or correct earlier work without retyping it from scratch.",
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
    how: "This is a deliberately focused four-function calculator: enter two numbers, pick an operation, and get an immediate, precise answer for addition, subtraction, multiplication or division. It is built for the moments when opening a full scientific calculator or spreadsheet would be overkill — splitting a bill, checking a quick sum, or verifying a number someone else gave you.\n\nWhat sets it apart from a plain pocket calculator is that it does not stop at the single operation you selected. Underneath the headline answer, it also shows the other three results for the exact same pair of numbers — the sum, the difference, the product and the quotient are all displayed together. In practice, when someone asks “what's 12.5 times 4?” the very next question is often “and what's the difference between them?” or “what's their ratio?” rather than typing the numbers in again for a second calculation. Showing every operation at once removes that friction entirely.\n\nDivision by zero is caught and reported clearly rather than silently returning an error code or an unhelpful symbol, and a ratio row expresses the relationship between the two numbers as a simple a:1 comparison, which is often more intuitive than a raw decimal quotient when comparing two quantities — for instance seeing that 12.5 relates to 4 as roughly 3.125:1.\n\nAll values accept decimals, so the tool works equally well for whole-number arithmetic and for figures with cents, fractions of a unit, or scientific measurements. There is no artificial limit on magnitude beyond standard floating-point precision, so it comfortably handles everything from small household sums to larger figures used in budgeting or basic business arithmetic. Because the calculation happens instantly as you adjust either number or the operation, it is well suited to quick, iterative checking — nudging a value up or down and immediately seeing how every related result changes, rather than committing to one operation at a time.",
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
    how: "Percentage questions come in several different shapes even though they all involve the same two numbers, and people frequently struggle not with the arithmetic itself but with figuring out which version of the question they are actually asking. “What is 15% of 200?”, “30 is what percent of 200?” and “what is 200 increased by 15%?” all use the same pair of values but expect different answers — 30, 15% and 230 respectively. Rather than forcing you to pick the correct mode from a menu before you can even see a result, this tool takes a single pair of values, A and B, and computes every common percentage relationship between them simultaneously.\n\nThe core relationships shown are: A% of B (the most common calculation, used for discounts, tips and tax); A as a percentage of B (used to find what share one quantity represents of another, such as a test score out of a total); B increased by A% and B decreased by A% (used for markups, price rises, pay increases and discounts); and the percentage change from A to B, expressed as a signed value so you can immediately see whether it represents growth or decline.\n\nEach of these is a distinct real-world question. A retailer marking up wholesale cost by a margin percentage needs “B increased by A%”. A student checking a grade needs “A as a percentage of B”. Someone calculating a restaurant tip needs “A% of B”. By computing all five at once, the tool removes the step of deciding in advance which formula applies — you simply look at the row that answers the question you actually had.\n\nThe tool also shows A expressed as a decimal and, when A is a whole number, its exact fraction form, which is useful for verifying calculations by hand or understanding the underlying relationship rather than just reading off a black-box answer. Negative values are supported throughout, so the same tool handles percentage decreases and reversals just as naturally as increases.",
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
    how: "Percentage change measures how much a value has grown or shrunk relative to where it started, and the calculation is deceptively easy to get wrong because the denominator matters enormously. The formula used here is (new − old) ÷ |old| × 100 — the change is always measured against the original value, never the new one. This is the standard convention used in finance, economics, science and everyday reporting, and it is what distinguishes a genuine percentage change from a simple percentage-point difference.\n\nOne of the most common sources of confusion this tool clears up directly is the asymmetry between rises and falls. A value that increases by 25% and then decreases by 25% does not return to its starting point, because the second 25% is calculated on a larger base than the first. Starting at 80 and rising 25% gives 100; falling 25% from 100 gives 75, not 80. The multiplier row makes this visible at a glance by showing the change as a single multiplication factor — in this example, ×1.25 for the rise and ×0.75 for the fall — so the asymmetry is obvious rather than hidden inside two separate percentage figures.\n\nThe tool clearly labels whether the change is an increase or a decrease, reports the absolute numerical difference alongside the percentage figure (since a large percentage change on a small base can be a smaller absolute change than a small percentage change on a large base), and also computes the reverse change — what percentage you would need to move from the new value back to the original — which is rarely the same figure as the original change, for exactly the reason described above.\n\nA zero original value is explicitly rejected with an explanation, since percentage change is mathematically undefined when there is nothing to measure the change against — rather than silently returning infinity or a misleading number. This makes the tool reliable for financial reporting, tracking metrics over time, comparing prices, or any situation where you need to express a movement between two figures as a percentage rather than a raw difference.",
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
    how: "Working with fractions by hand means finding a common denominator before you can add or subtract, and simplifying the result afterwards — two separate steps that are easy to get wrong, especially with larger numbers. This tool automates both. For addition and subtraction, the two fractions are combined over the product of their denominators (a well-known but not always the smallest common denominator), giving a mathematically correct intermediate result. For multiplication, numerators and denominators are multiplied straight across; for division, the second fraction is inverted and multiplied, which is the standard “flip and multiply” rule taught in most math curricula.\n\nOnce the raw result is calculated, it is reduced to lowest terms by dividing both the numerator and denominator by their greatest common divisor, found using Euclid's algorithm. This guarantees the simplest possible form of the answer every time — you will never see 4/8 when the correct simplified answer is 1/2, regardless of how large or awkward the original numbers were.\n\nBecause fractions frequently represent quantities larger than one whole — like 15/8 rather than a value strictly between 0 and 1 — the tool also converts the simplified fraction into a mixed number (a whole number plus a proper fraction), which is often the more natural way to read a measurement or a recipe quantity. Alongside this, it shows the decimal equivalent to eight decimal places and the equivalent percentage, since different contexts call for different representations of the same value: a carpenter might want the fraction, an accountant the decimal, and a survey result the percentage.\n\nFor transparency, the tool also displays the unsimplified result before reduction and the common denominator that was used, so if you are checking work by hand you can follow exactly the same steps the calculator took rather than only seeing the final simplified answer. Zero denominators are explicitly rejected, and division by the fraction zero is caught and explained rather than silently producing an undefined or infinite result.",
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
    how: "Converting a decimal into a fraction sounds like it should be straightforward, but for anything beyond a simple terminating decimal like 0.375 it is not obvious what the “correct” fraction even is — especially for repeating or irrational-looking decimals where an infinite number of fractions could approximate the value to varying degrees of accuracy. This tool uses a continued-fraction expansion, a classical number-theory technique that finds the fraction with the smallest possible denominator that matches your decimal to the precision you specify, rather than an arbitrary or overly large fraction that happens to work.\n\nThe method works by repeatedly taking the integer part of the number, then inverting and repeating on the remaining fractional part, building up a chain of nested fractions. This is exactly the technique used historically to find excellent rational approximations to irrational numbers — for example, it is how 3.14159265… collapses down to 355/113, a fraction accurate to six decimal places despite having a denominator under 1,000, far better than the more commonly known 22/7.\n\nYou control the trade-off between accuracy and simplicity directly through the “largest denominator to allow” setting. A small maximum denominator forces the tool to find the simplest possible fraction, accepting some rounding error; a large maximum denominator allows it to chase near-perfect accuracy at the cost of a more unwieldy fraction. For an exact terminating decimal like 0.375, the tool will find the exact fraction (3/8) regardless of the denominator limit, and this is reported explicitly as “Exact” in the accuracy row. For values that cannot be represented exactly within the chosen denominator limit, the approximation error is shown in scientific notation so you know precisely how close the fraction comes.\n\nAlongside the simplified fraction, the tool shows the equivalent mixed number for values greater than one, the fraction converted back to a decimal for a sanity check, and the percentage equivalent — useful when the original decimal came from a measurement, a probability, or a proportion that needs to be expressed several different ways for different audiences.",
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
    how: "A ratio compares two quantities in their simplest relative terms, and the first thing this tool does with any pair of numbers is reduce them by their greatest common divisor — the same Euclidean-algorithm approach used elsewhere across this site — so that, for example, 32:18 is immediately simplified to the familiar 16:9. This matches how ratios are conventionally written and makes it easy to recognise standard proportions like screen aspect ratios, recipe scalings or map scales at a glance.\n\nBeyond simplification, the tool converts the ratio into a decimal comparison (expressed as “A relative to 1”, which is often easier to reason about than two raw integers) and into percentage shares, showing what fraction of the whole each part represents. A 3:2 ratio, for instance, means the first part is 60% of the total and the second is 40% — a framing that is often more directly useful than the ratio notation itself when you are trying to understand proportions rather than just state them.\n\nThe optional “total to share” field turns the tool from a pure simplifier into a practical splitting calculator. Enter any total amount — a sum of money, a quantity of ingredients, a number of shares — and the tool divides it in exactly the same proportion as the ratio, giving you the precise amount that belongs to each part. This is the standard method for splitting a restaurant bill unevenly between people who ordered different amounts, dividing a recipe when you only want to scale one ingredient's ratio to the rest, allocating a shared expense between business partners according to an agreed split, or distributing shares in a partnership or joint venture.\n\nBecause both parts of the ratio are validated to ensure at least one is non-zero, and the greatest common divisor itself is shown as a distinct output, the tool is equally useful as a teaching aid for understanding how ratio simplification works and as a fast, reliable calculator for splitting real totals accurately without manual long division.",
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
    how: "A proportion states that two ratios are equal — a/b = c/d — and solving for a missing value in that statement is one of the most common algebraic tasks in everyday calculations, from scaling a recipe to converting between units to solving similar-triangle geometry problems. This tool solves for whichever of the four values (a, b, c or d) you mark as unknown, using cross-multiplication, the standard technique taught for this exact problem type.\n\nCross-multiplication works by multiplying diagonally across the equals sign: a × d equals b × c whenever the proportion holds true. Once you know three of the four values, this relationship becomes a single linear equation in one unknown, which is solved by isolating that unknown through one division. For example, solving 3/4 = 9/x for x means computing (4 × 9) ÷ 3, which gives 12 — the tool performs exactly this calculation regardless of which position the unknown occupies, adjusting the formula automatically based on your selection.\n\nTo make the result verifiable rather than something you simply have to trust, the tool shows the completed proportion with all four values filled in, and a cross-product check row that multiplies both diagonals independently — if the proportion is genuinely satisfied, these two products will be identical, and seeing them match side by side is a direct, visual confirmation that the solved value is correct rather than the result of a calculation error.\n\nThe scale factor row shows the multiplier that connects the left-hand ratio to the right-hand ratio (c ÷ a), which is particularly useful in scaling contexts — enlarging a recipe, resizing an image proportionally, or converting a scale-model measurement to real-world size — where knowing the single multiplying factor is often more directly useful than the four individual numbers that define the proportion. Zero values in denominator positions are explicitly caught and explained, since a proportion with a zero denominator has no valid cross-multiplication solution.",
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
    how: "“Average” is a word that gets used loosely to mean several different statistical measures, and which one is actually appropriate depends entirely on the shape of your data and the question you are asking. This tool computes the three most common measures of central tendency — mean, median and mode — together from a single pasted list, rather than making you calculate each separately or guess which one you need in advance.\n\nInput is deliberately flexible: numbers can be separated by commas, spaces, semicolons, tabs or line breaks, or any mixture of these, which means you can paste a column directly out of a spreadsheet, a row of space-separated values from a text document, or a comma-separated list from a CSV file without reformatting it first. The parser strips out anything that isn't a valid number and works with whatever numeric values remain.\n\nThe mean (the sum of all values divided by the count) is the measure most people think of first, but it is heavily influenced by outliers — a single extreme value can pull it far from what feels like a “typical” result. The median (the middle value when the data is sorted) is far more robust to outliers and is often the better choice for skewed data like incomes or house prices, where a handful of very large or very small values would otherwise distort the picture. The mode (the most frequently occurring value or values) is useful for categorical or repeated data where you want to know what value appears most often, rather than a calculated central point at all.\n\nBeyond these three, the tool reports the sum and count of the values entered, the range (the gap between the smallest and largest value, which gives a quick sense of spread), and the geometric mean for datasets where every value is positive — the appropriate average for growth rates, ratios and other multiplicative quantities, where the arithmetic mean would give a misleading answer. Seeing several of these measures side by side, rather than a single number in isolation, makes it much easier to spot when a dataset is skewed or contains outliers that a single “average” would otherwise hide.",
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
    how: "A prime number is a whole number greater than 1 with no positive divisors other than 1 and itself, and testing whether a given number qualifies could, in principle, mean checking every possible divisor up to the number itself — an approach that becomes painfully slow for large inputs. This tool uses a well-known optimisation: it only needs to test divisors up to the square root of the number being checked, because any factor larger than the square root must be paired with a factor smaller than the square root. If no divisor exists below the square root, none can exist above it either, so the search can stop early. This is why checking even a seven-digit number for primality returns an answer instantly rather than taking a noticeable pause.\n\nBeyond a simple yes-or-no verdict, the tool provides useful context around the result. For composite numbers, it shows the complete prime factorisation — the unique set of prime numbers that multiply together to produce the original value, guaranteed to exist and be unique for every integer greater than 1 by the fundamental theorem of arithmetic. It also reports the total number of divisors the number has (including 1 and itself), which is a quick way to gauge how “highly composite” a number is — a number like 360 has a large number of divisors relative to its size, which is exactly why it is such a convenient number for splitting into groups.\n\nThe tool also searches outward from your input to find the nearest prime numbers on either side — the previous prime and the next prime — which is useful in contexts like cryptography education, number theory exploration, or simply satisfying curiosity about how densely primes are distributed around a particular value. Special edge cases are handled explicitly: 0 and 1 are neither prime nor composite by mathematical convention, and the tool states this clearly rather than returning a potentially confusing “not prime” verdict without explanation. Negative inputs are rejected outright, since primality is only defined for positive integers.",
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
    how: "Every whole number greater than 1 can be broken down into a product of prime numbers in exactly one way, ignoring the order in which they're written — this is the fundamental theorem of arithmetic, and it is the reason prime factorisation is such a foundational tool across number theory, cryptography and simplifying fractions. This calculator finds that unique breakdown using trial division: it tests increasing prime numbers (2, 3, 5, 7, 11…) against the input, dividing out each prime as many times as it evenly fits before moving on to the next candidate, until only 1 remains.\n\nThe result is presented in exponential form — for example 360 = 2³ × 3² × 5 — which groups repeated prime factors together using exponents rather than listing each occurrence separately, matching the standard mathematical notation you would find in a textbook. The fully expanded form (2 × 2 × 2 × 3 × 3 × 5) is also shown for cases where you need to see every individual factor rather than the compressed exponential version.\n\nFrom the prime factorisation, several other useful quantities follow directly through well-known formulas. The total number of divisors a number has (including 1 and the number itself) can be calculated without listing them individually: if the prime factorisation has exponents a₁, a₂, a₃ and so on, the divisor count is (a₁+1) × (a₂+1) × (a₃+1)… — for 360 = 2³×3²×5¹, that's (3+1)(2+1)(1+1) = 24 divisors, which the tool both calculates via this formula and verifies by listing them explicitly for smaller numbers.\n\nThe sum of all divisors is also reported, which is relevant to concepts like perfect numbers (where the divisors excluding the number itself sum to the number). This tool is useful well beyond pure number theory homework: prime factorisation underlies simplifying fractions to lowest terms, finding greatest common divisors and least common multiples efficiently, understanding modular arithmetic used in cryptography, and recognising the structure behind numbers that come up repeatedly in engineering and computing, such as powers of two.",
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
    how: "The greatest common divisor (GCD) — also called the highest common factor (HCF) — of a set of numbers is the largest whole number that divides every one of them without a remainder. This tool computes it using Euclid's algorithm, one of the oldest algorithms in continuous use, dating back over two thousand years, and still the most efficient general-purpose method available today.\n\nThe algorithm works by repeated division: to find the GCD of two numbers, divide the larger by the smaller and take the remainder; then replace the larger number with the smaller number, and the smaller number with that remainder; repeat until the remainder reaches zero, at which point the last non-zero remainder is the answer. What makes this approach remarkable is its speed — it converges to the answer in only a handful of steps even for very large numbers, because each step roughly halves the size of the problem, rather than requiring an exhaustive search through every possible divisor.\n\nFor more than two numbers, the tool applies the algorithm pairwise: it finds the GCD of the first two numbers, then finds the GCD of that result with the third number, and so on, which is mathematically guaranteed to produce the correct overall GCD of the entire set regardless of how many numbers you provide.\n\nAlongside the GCD itself, the tool reports the least common multiple (LCM) of the same set — calculated from the GCD via the identity that the product of two numbers equals their GCD times their LCM — and whether the numbers are coprime, meaning their only common factor is 1. It also shows the ratio between the numbers reduced to its simplest form by dividing each by the GCD, and lists the complete set of common factors shared by all the input numbers. This makes the tool useful for simplifying fractions with large numerators and denominators, finding the largest possible size for tiles or panels that divide evenly into multiple room dimensions, scheduling problems involving repeating cycles, and general number-theory work where reducing numbers to their essential common structure matters.",
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
    how: "The least common multiple (LCM) of a set of numbers is the smallest positive number that every one of those numbers divides into evenly. It is one of the most practically useful results in elementary number theory, because it answers a specific and very common question: when do several repeating things line up again? This tool computes the LCM for any list of whole numbers, not just pairs, using the relationship between LCM and GCD — specifically, that the LCM of two numbers equals the product of the numbers divided by their greatest common divisor — applied pairwise across the full list.\n\nThe most familiar use of LCM is finding a common denominator when adding or subtracting fractions with different denominators. Rather than simply multiplying all the denominators together (which works but often produces an unnecessarily large number that then has to be simplified back down), using the true least common multiple keeps the arithmetic as small and manageable as possible throughout. For 1/4 + 1/6, for instance, the LCM of 4 and 6 is 12, giving a much cleaner working denominator than the 24 you would get from simply multiplying 4 and 6 together.\n\nBeyond fractions, LCM answers real scheduling and cyclical questions: if one event repeats every 4 days and another every 6 days, the LCM of 4 and 6 (which is 12) tells you they will next coincide on day 12. This applies to anything from bus or train schedules, to blinking lights or repeating machine cycles, to figuring out when two people's differently-spaced work rotations will next fall on the same day.\n\nThe tool shows the multiplier needed to scale each individual input up to the shared LCM value — useful when you need to see exactly how each original number relates to the common result, not just the final answer — along with the GCD of the same set for comparison, the plain product of all inputs (which the LCM will always be less than or equal to, except when the numbers are pairwise coprime), and the next few multiples beyond the first, in case you need to know when a repeating cycle will align more than once.",
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
    how: "The factorial of a whole number n, written n!, is the product of every positive integer from 1 up to n, and it is one of the fastest-growing functions in ordinary mathematics — 10! is already 3,628,800, and the values explode from there. This rapid growth creates a genuine technical problem for most calculators: standard floating-point numbers, the format almost all computer arithmetic uses by default, can only represent values up to roughly 1.8 × 10³°⁸ before overflowing, which corresponds to about 170!. Beyond that point, an ordinary calculator either returns an error or silently produces an incorrect “infinity” result.\n\nThis tool avoids that limitation entirely by computing factorials using arbitrary-precision integer arithmetic — the same class of technique used in cryptography and computer algebra systems — which represents numbers as sequences of digits rather than a fixed-size floating-point value, meaning there is effectively no upper limit on how large the exact result can be, up to the tool's practical input cap of 2000. This means factorials of numbers in the hundreds or low thousands are returned as fully exact integers, not approximations, complete with an exact digit count.\n\nBecause these exact results can run to hundreds or even thousands of digits, which is impractical to read directly, very long results are truncated for display while the reported digit count remains fully accurate — so you always know precisely how large the number is even when you aren't shown every digit. Alongside the exact value, the tool reports the natural logarithm of the factorial (useful for further calculations without needing the full-precision number itself) and Stirling's approximation, a classical formula that estimates ln(n!) using only n and basic functions, which is shown for comparison and gives a sense of scale even before the exact computation completes. The number of trailing zeros in the result is also shown — these arise from factors of 10 within the product, and their count is a classic number-theory question in its own right, relevant to problems about how many times a given prime factor appears within a factorial.",
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
    how: "Combinations and permutations both count the number of ways to choose r items from a set of n items, but they answer subtly different questions, and mixing them up is one of the most common mistakes in probability and combinatorics. This tool computes both, along with their repetition-allowed variants, from the same two inputs, so you don't need to memorise which formula applies to which situation before getting an answer.\n\nA combination, written C(n, r), counts selections where order does not matter — choosing 3 people from a group of 10 to form a committee gives the same committee regardless of the order you picked them in. The formula is n! ÷ (r! × (n−r)!), which effectively counts all possible orderings and then divides out the r! ways any single selection could have been arranged, since those orderings should all count as the same outcome. Lottery draws, committee selection, choosing toppings for a pizza, and picking a hand of cards are all combination problems.\n\nA permutation, written P(n, r), counts selections where order does matter — picking 3 runners from 10 to award gold, silver and bronze produces a different outcome depending on which runner finishes in which position, even with the same three runners selected. The formula is n! ÷ (n−r)!, which is simply the combination count multiplied back up by r!, the number of ways to arrange each selected group. Race podiums, PIN codes, and any ranking or ordering problem are permutation problems.\n\nThe tool also computes both variants with repetition allowed, for situations where items can be reused — combinations with repetition apply when you can select the same item more than once but order still doesn't matter (like choosing scoops of ice cream where flavours can repeat), while permutations with repetition apply when both repetition and order matter (like a 4-digit PIN code where digits can repeat and order is essential, giving 10⁴ possibilities). Additional context rows show the total number of possible subsets of the full set (2ⁿ) and the probability of landing on one specific combination purely by chance, both useful for probability calculations built on top of the core counting result.",
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
    how: "A quadratic equation, ax² + bx + c = 0, describes a parabola, and solving it means finding the x-values where that parabola crosses the horizontal axis. This tool solves any quadratic using the quadratic formula, x = (−b ± √(b² − 4ac)) ÷ 2a, and reveals the full geometric picture behind the equation rather than just returning two numbers.\n\nEverything about the nature of the solutions is determined by a single quantity inside the square root: the discriminant, b² − 4ac. When the discriminant is positive, the equation has two distinct real roots — the parabola crosses the x-axis at two separate points. When the discriminant is exactly zero, there is one repeated real root — the parabola's vertex touches the x-axis at exactly one point, tangent to it rather than crossing through. When the discriminant is negative, there are no real roots at all; instead the two solutions form a complex-conjugate pair, meaning the parabola never touches the x-axis, staying entirely above or entirely below it. The tool identifies which of these three cases applies and reports the discriminant's value directly, so the reasoning behind the result is visible rather than hidden.\n\nBeyond the roots themselves, the tool calculates the vertex of the parabola — the single highest or lowest point on the curve, found at x = −b ÷ 2a — and reports whether the parabola opens upward (a minimum at the vertex, when a is positive) or downward (a maximum at the vertex, when a is negative). The axis of symmetry, the vertical line through the vertex around which the parabola is a perfect mirror image, is also given, which is often exactly the value engineers, physicists and economists need when a quadratic model is used to find an optimal point — the moment of maximum height in projectile motion, the price point that maximises revenue, or the minimum of a cost function.\n\nWhen real roots exist, the equation's factored form is shown, connecting the roots back to the original expression in the a(x−r₁)(x−r₂) format taught in algebra courses, and the sum and product of the roots are calculated directly from the coefficients via Vieta's formulas — useful both as a way to verify the solution by hand and as a separate algebraic tool in its own right for problems that only ask about the relationship between the roots rather than their individual values.",
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
    how: "A linear equation of the form ax + b = cx + d is the most fundamental type of algebraic equation, appearing constantly in everyday problem-solving, from working out break-even points to converting between measurement systems to basic physics and finance formulas. This tool solves for x by performing the same step-by-step algebraic manipulation you would use on paper: moving every x term to one side of the equation and every constant to the other, then dividing to isolate x completely. The full working is shown as a sequence of steps — collecting the x terms, simplifying the coefficients, and performing the final division — so the solution can be followed and verified line by line rather than appearing as an unexplained final answer.\n\nRearranged algebraically, the solution is x = (d − b) ÷ (a − c), which is exactly what the tool computes once a, b, c and d are entered. But an important special case arises whenever a equals c: in that situation, the x terms on both sides are identical, so subtracting one from the other eliminates x entirely, leaving only the constants to compare. If the constants b and d also happen to be equal, the original equation was actually an identity — both sides describe the exact same line, and every possible value of x satisfies the equation. If the constants differ, the two sides describe parallel lines that never meet, and the equation has no solution at all. The tool detects this case explicitly and explains which of the two outcomes applies, rather than attempting a division by zero and returning an error.\n\nOnce a solution for x is found, the tool substitutes it back into both the left-hand and right-hand sides of the original equation independently, and both should evaluate to the same number — this substitution check is shown directly so you can confirm the answer is correct without needing to redo the algebra yourself. The result is also expressed as an exact fraction alongside the decimal value, which matters when the solution isn't a clean whole number and you need the precise value for further calculation rather than a rounded approximation.",
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
    how: "A system of two linear equations in two unknowns describes two straight lines, and solving the system means finding the single point where those two lines intersect — the (x, y) pair that satisfies both equations simultaneously. This tool solves the general system a₁x + b₁y = c₁ and a₂x + b₂y = c₂ using Cramer's rule, a classical method from linear algebra that expresses the solution directly in terms of determinants, without needing the iterative substitution or elimination steps you would normally perform by hand.\n\nThe method calculates three 2×2 determinants: the main determinant D = a₁b₂ − a₂b₁, built purely from the coefficients of x and y, and two further determinants formed by substituting the constant terms (c₁, c₂) into the x-column and y-column respectively. Dividing each of these substituted determinants by the main determinant D gives the values of x and y directly. This approach generalises cleanly to larger systems of equations too, which is part of why it's the standard method taught in linear algebra courses, even though for a 2×2 system it's mathematically equivalent to elimination.\n\nThe determinant D carries important geometric meaning beyond just being part of the formula: it is zero exactly when the two lines are parallel, because a₁b₂ − a₂b₁ = 0 is the algebraic condition for two lines to have the same slope. When D is zero, the tool checks whether the two equations actually describe the identical line (in which case there are infinitely many solutions, since every point on the shared line satisfies both equations) or whether they are truly parallel and distinct (in which case there is no solution at all, since parallel lines that don't coincide never intersect). This distinction is reported explicitly rather than the tool simply failing on a division by zero.\n\nWhen a unique solution exists, the tool substitutes the calculated x and y values back into both original equations independently as a verification step, and reports the intersection point in standard (x, y) coordinate form — directly usable for graphing, geometry problems, or as an input to further calculations, such as finding where a supply curve and a demand curve meet in a basic economics model.",
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
    how: "Matrices are fundamental to linear algebra, computer graphics, engineering systems and statistics, but working with them by hand is tedious and error-prone even for relatively small sizes. This tool supports the core matrix operations — addition, subtraction, multiplication, scalar multiplication, transpose, determinant and inverse — through a single interface, with matrices entered as plain text: one row per line, values separated by spaces or commas. This deliberately simple input format means you can paste a matrix directly from a spreadsheet, a text document, or typed notes without reformatting it into a special syntax first.\n\nMatrix multiplication follows the standard rule that the entry in row i, column j of the result is the sum of the products of corresponding entries from row i of the first matrix and column j of the second — which requires the number of columns in the first matrix to match the number of rows in the second, a compatibility check the tool performs automatically and explains clearly if it fails, rather than returning a cryptic error. Addition and subtraction require matching dimensions throughout, and the transpose operation flips a matrix over its diagonal, swapping rows for columns.\n\nThe determinant is computed recursively via cofactor expansion for the general case, correctly generalising the familiar ad − bc formula for 2×2 matrices to any square matrix size, and a non-square matrix is explicitly rejected since determinants are only defined for square matrices.\n\nFor inversion — finding the matrix that, multiplied by the original, produces the identity matrix — this tool deliberately avoids the classical adjugate-and-cofactor formula that many textbooks teach, because that method becomes numerically unstable and computationally expensive as matrix size grows. Instead it uses Gauss–Jordan elimination with partial pivoting: it augments the matrix with an identity matrix, then performs row operations to reduce the left half to the identity, at each step selecting the largest available pivot value to minimise floating-point rounding error. This is the same general approach used inside professional numerical computing libraries, and it remains accurate on matrices that would cause naive formula-based approaches to lose precision. Singular matrices — those with no inverse, identified by a determinant of zero — are detected and explained rather than producing a division-by-zero result.",
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
    how: "Complex numbers, written a + bi where i represents the square root of −1, extend ordinary arithmetic to handle quantities that don't exist on the real number line alone — essential in electrical engineering (for alternating current analysis), signal processing, quantum mechanics, and any mathematics involving oscillation or rotation. This tool performs the four basic arithmetic operations on complex numbers by tracking the real and imaginary parts separately throughout the calculation, applying the algebraic rules that follow directly from the definition i² = −1.\n\nAddition and subtraction simply combine the real parts together and the imaginary parts together. Multiplication expands like any binomial product but then applies i² = −1 to simplify: (a+bi)(c+di) = ac + adi + bci + bdi² = (ac−bd) + (ad+bc)i. Division is the trickiest operation by hand, because you cannot simply divide by a complex denominator directly — the standard technique is to multiply both the numerator and denominator by the complex conjugate of the denominator (flipping the sign of its imaginary part), which turns the denominator into a real number (since (c+di)(c−di) = c²+d²) and makes the division straightforward. The tool performs exactly this conjugate-multiplication method internally.\n\nBeyond the arithmetic result, the tool computes the modulus of the result — its distance from the origin on the complex plane, calculated as √(a²+b²) — and its argument, the angle it makes with the positive real axis, given in both degrees and radians since different fields conventionally use different units. Together these give the polar form of the complex number, an alternative representation (magnitude and angle rather than real and imaginary parts) that is often far more natural for problems involving rotation, oscillation or multiplication of complex numbers, since multiplying two complex numbers in polar form simply multiplies their magnitudes and adds their angles.\n\nThe exponential form, using Euler's formula to write the result as magnitude × e^(angle×i), is also shown, connecting the polar representation to the exponential notation used throughout advanced physics and engineering. The conjugate of the result is displayed as well, since conjugates appear constantly in further complex-number work, from finding a real result from a complex intermediate calculation to constructing polynomials with known complex roots.",
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
    how: "A logarithm answers a specific question: “what power do I need to raise this base to, in order to get this number?” Written log_b(x), it is the mathematical inverse of exponentiation — if b raised to some power equals x, then log_b(x) equals that power. This relationship is why logarithms are essential for solving exponential equations, working with quantities that span many orders of magnitude (like sound intensity in decibels, earthquake strength on the Richter scale, or pH in chemistry), and understanding exponential growth and decay in finance and science.\n\nMost calculators, including this one, only compute logarithms in one or two “native” bases directly (typically natural log, base e, and common log, base 10) and derive every other base from those using the change-of-base rule: log_b(x) = ln(x) ÷ ln(b). This is not a shortcut or approximation — it is mathematically exact, and it is genuinely how virtually all calculators and computer systems compute logarithms in arbitrary bases internally, since implementing a separate calculation method for every possible base would be both unnecessary and inefficient.\n\nThis tool accepts any base and any positive value for x, and reports the result to eight decimal places alongside the three most commonly used specific logarithms for direct comparison: the natural logarithm (base e, fundamental in calculus and continuous growth problems), the common logarithm (base 10, used in scientific notation and many measurement scales), and the binary logarithm (base 2, central to computer science and information theory, where it measures the number of bits needed to represent a quantity).\n\nTwo mathematical restrictions are enforced with clear explanations rather than silent failures: logarithms are only defined for positive values of x, since no real power of a positive base can produce a negative or zero result, and the base itself must be positive and cannot equal 1, since 1 raised to any power always equals 1, making “what power gives this result” meaningless for that base. A verification row raises the base back to the calculated power and confirms it returns the original value, and an antilog row — computing base raised to the power of x, the reverse operation — is included for situations where you need to go the other direction.",
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
    how: "Raising a number to a power is one of the most fundamental operations in mathematics, but the rules extend well beyond the simple repeated-multiplication idea most people first learn, and this tool handles the full range — positive, negative, whole and fractional exponents — using the consistent algebraic rules that connect all of these cases together rather than treating them as separate special formulas.\n\nFor a positive whole-number exponent n, bⁿ means multiplying the base by itself n times, which is the intuitive starting definition. The rule extends naturally to negative exponents through the reciprocal relationship b^(−n) = 1 ÷ bⁿ — a negative exponent doesn't mean a negative result, it means “one over” the corresponding positive-exponent value. This is why 2⁻² equals 0.25 rather than −4, a common point of confusion the tool's results make immediately clear by showing the reciprocal explicitly alongside the main answer.\n\nFractional exponents extend the pattern further still: b^(1/n) is defined to mean the nth root of b, so that raising a number to the power of 1/2 is exactly the same operation as taking its square root, and raising to the power of 1/3 is the same as taking a cube root. This single unifying rule is what allows the tool to handle any rational exponent — whole, negative, or fractional — through one consistent calculation method rather than switching between different formulas depending on what kind of exponent you enter.\n\nOne genuine mathematical limit is enforced explicitly rather than papered over: a negative base raised to a fractional exponent frequently has no real-number result at all — for instance, (−8)^(1/2) would require finding a real number that, squared, gives −8, which is impossible, since squaring any real number produces a non-negative result. Rather than returning an unhelpful “NaN” (not-a-number) code the way many programming environments and basic calculators do, this tool detects that condition and explains plainly that the combination has no real value.\n\nAlongside the main result, the tool shows scientific notation for very large or very small outputs, the reciprocal for direct comparison with negative-exponent behaviour, the base squared and cubed for quick reference, and a logarithm-based check that recovers the original exponent from the result when the numbers involved are positive — a useful way to confirm the calculation is internally consistent.",
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
    how: "Taking a root — square root, cube root, or more generally an nth root — is the inverse operation to raising a number to a power, and it is defined using the same fractional-exponent relationship: the nth root of x is mathematically identical to x raised to the power of 1/n. This tool computes roots of any order, for both positive and negative values of x, handling a subtlety that trips up many basic calculators: negative bases behave completely differently depending on whether the root is odd or even.\n\nFor odd roots, negative inputs have a perfectly well-defined real answer. The cube root of −78, for example, is −2, because (−2) × (−2) × (−2) equals −8 — multiplying three negative numbers together produces a negative result, so a negative input has a negative real cube root. The same logic extends to any odd root: fifth roots, seventh roots and so on all accept negative inputs and return a real, negative result. This tool implements that correctly by working with the sign and magnitude of the input separately, rather than naively applying a power formula that would incorrectly return an undefined result.\n\nFor even roots, however, no real number exists whose square (or fourth power, or any even power) is negative, since multiplying an even number of identical negative values always produces a non-negative result. The square root of a negative number therefore has no real-number answer at all — it requires complex numbers to express, which is outside the scope of this real-valued root calculator. Rather than returning an unhelpful “NaN” code, the tool detects this case explicitly and explains clearly that an even root of a negative number has no real value.\n\nBeyond the requested root, the tool shows the square root and cube root of the same input for quick side-by-side reference, a verification row that raises the calculated result back to the nth power to confirm it reproduces the original input, and an “exact?” indicator that reports whether the root happens to be a perfect root (an exact integer, like the cube root of 729 being exactly 9) or an irrational, non-terminating value — useful for recognising when a “nice” exact answer exists versus when the result is necessarily an approximation.",
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
    how: "An arithmetic sequence is a list of numbers where each term is found by adding the same fixed amount — the common difference — to the previous term. Given the first term and the common difference, this tool calculates any term in the sequence directly, without needing to generate every term that comes before it, using the formula aₙ = a₁ + (n−1)d, which simply says that reaching the nth term means adding the common difference exactly (n−1) times to the starting value.\n\nSumming an arithmetic sequence uses a famous shortcut often attributed to the young Carl Friedrich Gauss, who is said to have solved the problem of summing 1 through 100 almost instantly by noticing a pattern: pair the first term with the last, the second term with the second-to-last, and so on. Because each term in the sequence is offset from its neighbour by the same fixed amount in opposite directions from the centre, every one of these pairs adds up to exactly the same total — the first term plus the last term. With n terms forming n÷2 such pairs (or a slightly adjusted count when n is odd), the total sum works out to n ÷ 2 × (first term + last term), which is exactly the formula this tool applies, avoiding the need to add up potentially thousands of individual terms one by one.\n\nThis structure appears constantly outside of pure mathematics: calculating total interest paid across a loan with equal principal repayments, summing seating in a theatre where each row has a fixed number more seats than the last, tracking a savings plan where the same amount is added each period, or computing the total distance covered by an object under constant deceleration in physics.\n\nAlongside the requested term and sum, the tool shows the mean (average) value across all the terms summed — which for an arithmetic sequence always equals the average of the first and last term, a direct consequence of the same symmetry that makes Gauss's pairing trick work — and a preview of the sequence itself, so you can see the actual pattern of numbers being summed rather than only the final aggregated figures.",
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
    how: "A geometric sequence is a list of numbers where each term is found by multiplying the previous term by a fixed common ratio, rather than adding a fixed amount as in an arithmetic sequence. This structural difference — multiplication instead of addition — means geometric sequences grow (or shrink) exponentially rather than linearly, which makes them the natural model for compound interest, population growth, radioactive decay, and any process where change is proportional to the current size rather than a fixed constant amount.\n\nThis tool calculates any individual term directly using aₙ = a₁ × r^(n−1), where r is the common ratio, without needing to compute every preceding term. It also calculates the sum of the first n terms using the closed-form geometric series formula, Sₙ = a₁(1−rⁿ) ÷ (1−r), which is derived by a clever algebraic trick: subtracting the series from a version of itself multiplied by r causes almost every term to cancel out, leaving only the first and (n+1)th terms and collapsing what would otherwise require adding n separate terms into a single formula.\n\nThe most mathematically interesting feature of geometric sequences appears when you consider summing infinitely many terms. If the common ratio's absolute value is less than 1, each successive term is smaller than the last, shrinking toward zero fast enough that the running total converges to a specific finite value rather than growing without bound — this is the sum to infinity, S∞ = a₁ ÷ (1−r), and it is a genuinely surprising result to many people encountering it for the first time: an infinite number of terms adding up to a finite, calculable total. This tool automatically checks whether your ratio falls in the convergent range and calculates the sum to infinity when it does, while clearly reporting that the series diverges (grows without bound) when the ratio's magnitude is 1 or greater.\n\nBeyond the core results, the tool reports the growth rate per term as a percentage — directly comparable to a compound interest rate, since compound growth is itself a geometric sequence in disguise — and shows a preview of the actual sequence of numbers, making the exponential shape of the growth (or decay) visually apparent rather than only expressed through formulas.",
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
    how: "Significant figures express how precisely a measured or calculated value is known, and rounding correctly to a chosen number of them requires following rules that are easy to state but surprisingly easy to apply incorrectly by hand, especially around zeros. This tool rounds any value to a specified number of significant figures and applies those rules consistently and automatically.\n\nThe core rules this tool follows are: leading zeros — the zeros before the first non-zero digit, as in 0.0045 — are never counted as significant, because they only serve to place the decimal point and carry no information about measurement precision. Trailing zeros after a decimal point, however, are always significant, because writing 1.230 rather than 1.23 is a deliberate statement that the measurement is known to that extra digit of precision, not just padding. Zeros between non-zero digits, and trailing zeros in a number with an explicit decimal point, are likewise counted as significant since they represent genuine precision rather than placeholder notation.\n\nWhole numbers without a decimal point create a genuine ambiguity that plain decimal notation cannot resolve on its own: a value like 4,500 might be known precisely to all four digits, or it might only be known to two significant figures, with the trailing zeros simply placeholders. Scientific notation removes this ambiguity entirely, because it separates the significant digits from the magnitude explicitly — writing 4,500 to two significant figures as 4.5 × 10³ makes it unambiguous that only the 4 and 5 are known precisely. This is exactly why the tool always shows the scientific-notation form of its result alongside the plain rounded value: for any input where the significant-figure count of a plain decimal would be unclear, the scientific notation is the only fully unambiguous representation.\n\nThe tool also reports the number of significant figures present in your original input value (useful for checking whether you're about to round to more precision than the input actually justifies, a common error when combining measurements of differing precision), the number of decimal places used in the rounded result, the numerical difference introduced by rounding, and the order of magnitude of the value as a power of ten — a quick way to sanity-check that a result is in the right ballpark before relying on it further.",
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
