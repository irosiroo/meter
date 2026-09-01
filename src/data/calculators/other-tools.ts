/**
 * METER · Other Tools (11 tools)
 *
 * General-purpose math utilities that don't belong to one subject: number-to-
 * words, Roman numerals, ratios, fractions, GCD/LCM, Fibonacci, modulo,
 * scientific notation and rounding. These lean on the shared helpers (toRoman,
 * toFraction, gcd, lcm, nums, …) so behaviour matches the rest of METER.
 */

import { need, needPos, fail, out, P, R, M, fmt, sup, gcd, lcm, nums, round, toRoman, fromRoman, toFraction } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "number-to-words", name: "Number to Words Converter", category: "other-tools",
    description: "Spell out a whole number in English words, e.g. 1,234 → one thousand two hundred thirty-four.",
    keywords: ["number to words", "spell", "words", "cheque", "amount in words", "english"],
    icon: "Type", featured: true, popularity: 70,
    fields: [
      { key: "value", label: "Number", def: 1234, step: 1, help: "Whole numbers up to 999,999,999,999" },
    ],
    compute: (v) => {
      const raw = need(v.value, "Number");
      let n = Math.trunc(raw);
      if (Math.abs(n) > 999999999999) fail("Enter a whole number up to 999,999,999,999.");
      const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
      const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
      const SCALES = ["", "thousand", "million", "billion"];
      const chunk = (c: number): string => {
        const parts: string[] = [];
        const h = Math.floor(c / 100);
        const r = c % 100;
        if (h) parts.push(`${ONES[h]} hundred`);
        if (r > 0 && r < 20) parts.push(ONES[r]);
        else if (r >= 20) {
          const t = Math.floor(r / 10), o = r % 10;
          parts.push(o ? `${TENS[t]}-${ONES[o]}` : TENS[t]);
        }
        return parts.join(" ");
      };
      const negative = n < 0;
      n = Math.abs(n);
      let lower: string;
      if (n === 0) lower = "zero";
      else {
        const groups: string[] = [];
        let scale = 0;
        while (n > 0) {
          const c = n % 1000;
          if (c) groups.unshift(chunk(c) + (SCALES[scale] ? ` ${SCALES[scale]}` : ""));
          n = Math.floor(n / 1000);
          scale++;
        }
        lower = groups.join(" ");
      }
      if (negative) lower = `negative ${lower}`;
      const title = lower.replace(/\b\w/g, (ch) => ch.toUpperCase());
      return [P("In words", title), M("Lowercase", lower), M("Number", fmt(raw))];
    },
    examples: [{ label: "1,234 in words", inputs: { value: 1234 }, expect: "One Thousand Two Hundred Thirty-Four" }],
  },
  {
    id: "roman-numeral-converter", name: "Roman Numeral Converter", category: "other-tools",
    description: "Convert numbers to Roman numerals and back.",
    keywords: ["roman numerals", "convert", "number", "mmxxiv", "latin"],
    icon: "Hash", featured: true, popularity: 64,
    fields: [
      { key: "mode", label: "Direction", kind: "select", def: "toRoman", options: [{ value: "toRoman", label: "Number → Roman" }, { value: "fromRoman", label: "Roman → Number" }] },
      { key: "num", label: "Number (1–3999)", def: 2024, min: 1, max: 3999, step: 1, showIf: { key: "mode", in: ["toRoman"] } },
      { key: "roman", label: "Roman numeral", kind: "text", def: "MMXXIV", placeholder: "e.g. MMXXIV", showIf: { key: "mode", in: ["fromRoman"] } },
    ],
    compute: (v) => {
      if (String(v.mode) === "fromRoman") {
        const n = fromRoman(String(v.roman ?? ""));
        return [P("Number", fmt(n))];
      }
      const n = Math.trunc(needPos(v.num, "Number"));
      if (n < 1 || n > 3999) fail("Enter a whole number from 1 to 3999.");
      return [P("Roman numeral", toRoman(n))];
    },
    examples: [{ label: "2024 → Roman", inputs: { mode: "toRoman", num: 2024 }, expect: "MMXXIV" }],
  },
  {
    id: "ratio-simplifier", name: "Ratio Simplifier", category: "other-tools",
    description: "Reduce a ratio to its simplest whole-number form.",
    keywords: ["ratio", "simplify", "reduce", "proportion", "gcd"],
    icon: "Divide", popularity: 54,
    fields: [
      { key: "a", label: "First term", def: 18, min: 0, step: 1 },
      { key: "b", label: "Second term", def: 24, min: 0, step: 1 },
    ],
    compute: (v) => {
      const a = Math.round(needPos(v.a, "First term"));
      const b = Math.round(needPos(v.b, "Second term"));
      const g = gcd(a, b) || 1;
      return [P("Simplified ratio", `${a / g}:${b / g}`), M("Decimal", fmt(a / b))];
    },
    examples: [{ label: "18 : 24", inputs: { a: 18, b: 24 }, expect: "3:4" }],
  },
  {
    id: "fraction-decimal", name: "Fraction ↔ Decimal Converter", category: "other-tools",
    description: "Convert a fraction to a decimal, or a decimal to a fraction.",
    keywords: ["fraction", "decimal", "convert", "numerator", "denominator"],
    icon: "Divide", popularity: 58,
    fields: [
      { key: "mode", label: "Direction", kind: "select", def: "toDecimal", options: [{ value: "toDecimal", label: "Fraction → Decimal" }, { value: "toFraction", label: "Decimal → Fraction" }] },
      { key: "num", label: "Numerator", def: 3, step: 1, showIf: { key: "mode", in: ["toDecimal"] } },
      { key: "den", label: "Denominator", def: 4, step: 1, showIf: { key: "mode", in: ["toDecimal"] } },
      { key: "dec", label: "Decimal", def: 0.75, step: 0.001, showIf: { key: "mode", in: ["toFraction"] } },
    ],
    compute: (v) => {
      if (String(v.mode) === "toFraction") {
        const d = need(v.dec, "Decimal");
        const [fn, fd] = toFraction(d);
        return [P("Fraction", `${fn}/${fd}`), M("Decimal", fmt(d))];
      }
      const num = need(v.num, "Numerator");
      const den = need(v.den, "Denominator");
      if (den === 0) fail("The denominator cannot be zero.");
      return [P("Decimal", fmt(num / den)), M("Fraction", `${fmt(num)}/${fmt(den)}`)];
    },
    examples: [{ label: "3/4 → decimal", inputs: { mode: "toDecimal", num: 3, den: 4 }, expect: "0.75" }],
  },
  {
    id: "fibonacci-calculator", name: "Fibonacci Sequence Calculator", category: "other-tools",
    description: "The value of the nth Fibonacci term, the running total and the sequence.",
    keywords: ["fibonacci", "sequence", "series", "nth term", "recurrence", "golden ratio"],
    icon: "Spline", popularity: 52,
    fields: [
      { key: "n", label: "Number of terms (n)", def: 10, min: 1, max: 70, step: 1 },
    ],
    formula: "F(1) = 1, F(2) = 1, F(n) = F(n−1) + F(n−2)",
    compute: (v) => {
      const n = Math.trunc(need(v.n, "n"));
      if (n < 1 || n > 70) fail("Enter a whole number of terms from 1 to 70.");
      const seq: number[] = [];
      let a = 0, b = 1;
      for (let i = 0; i < n; i++) {
        seq.push(b);
        [a, b] = [b, a + b];
      }
      const nth = seq[seq.length - 1];
      const total = seq.reduce((x, y) => x + y, 0);
      const preview = seq.length > 15 ? `${seq.slice(0, 15).join(", ")}, …` : seq.join(", ");
      return [P("Value of the last term", fmt(nth)), R("Sum of the sequence", fmt(total)), M("Sequence", preview)];
    },
    examples: [{ label: "first 10 terms", inputs: { n: 10 }, expect: "55" }],
  },
  {
    id: "gcd-lcm", name: "GCD & LCM Calculator", category: "other-tools",
    description: "Greatest common divisor and least common multiple of a set of numbers.",
    keywords: ["gcd", "lcm", "greatest common divisor", "least common multiple", "factors"],
    icon: "Divide", popularity: 50,
    fields: [{ key: "numbers", label: "Numbers (comma separated)", kind: "text", def: "12, 18", placeholder: "e.g. 12, 18, 30" }],
    compute: (v) => {
      const arr = nums(v.numbers, "Numbers").map((n) => Math.abs(Math.round(n))).filter((n) => n > 0);
      if (arr.length < 2) fail("Enter at least two positive whole numbers.");
      const g = arr.reduce((x, y) => gcd(x, y));
      const l = arr.reduce((x, y) => lcm(x, y));
      return [P("GCD", fmt(g)), R("LCM", fmt(l)), M("Numbers", arr.join(", "))];
    },
    examples: [{ label: "12 and 18", inputs: { numbers: "12, 18" }, expect: "6" }],
  },
  {
    id: "percentage-difference", name: "Percentage Difference Calculator", category: "other-tools",
    description: "The symmetric percentage difference between two values, relative to their average.",
    keywords: ["percentage difference", "percent difference", "relative difference", "compare", "two values"],
    icon: "ArrowLeftRight", popularity: 56,
    fields: [
      { key: "a", label: "First value", def: 40 },
      { key: "b", label: "Second value", def: 60 },
    ],
    formula: "difference % = |a − b| / ((a + b) / 2) × 100",
    compute: (v) => {
      const a = need(v.a, "First value");
      const b = need(v.b, "Second value");
      const avg = (a + b) / 2;
      if (avg === 0) fail("The two values cannot average to zero.");
      const diff = (Math.abs(a - b) / Math.abs(avg)) * 100;
      return [P("Percentage difference", `${fmt(diff)}%`), R("Absolute difference", fmt(Math.abs(a - b))), M("Average of the two", fmt(avg))];
    },
    examples: [{ label: "40 vs 60", inputs: { a: 40, b: 60 }, expect: "40" }],
  },
  {
    id: "scientific-notation", name: "Scientific Notation Converter", category: "other-tools",
    description: "Express a number in scientific notation.",
    keywords: ["scientific notation", "standard form", "exponent", "mantissa", "powers of ten"],
    icon: "Superscript", popularity: 46,
    fields: [{ key: "value", label: "Number", def: 12345, step: "any" as unknown as number }],
    formula: "n = m × 10ᵉ,  1 ≤ |m| < 10",
    compute: (v) => {
      const n = need(v.value, "Number");
      if (n === 0) return [P("Scientific notation", "0 × 10⁰")];
      const exp = Math.floor(Math.log10(Math.abs(n)));
      const mantissa = n / 10 ** exp;
      return [P("Scientific notation", `${fmt(mantissa, 4)} × 10${sup(String(exp))}`), R("Mantissa", fmt(mantissa, 4)), M("Exponent", `${exp}`)];
    },
    examples: [{ label: "12,345", inputs: { value: 12345 }, expect: "1.2345" }],
  },
  {
    id: "modulo-calculator", name: "Modulo Calculator", category: "other-tools",
    description: "The remainder and quotient when one number is divided by another.",
    keywords: ["modulo", "modulus", "remainder", "mod", "quotient", "division"],
    icon: "Percent", featured: true, popularity: 58,
    fields: [
      { key: "a", label: "Dividend (a)", def: 17, step: 1 },
      { key: "b", label: "Divisor (n)", def: 5, step: 1 },
    ],
    formula: "a mod n = a − n · ⌊a / n⌋",
    compute: (v) => {
      const a = need(v.a, "Dividend");
      const b = need(v.b, "Divisor");
      if (b === 0) fail("The divisor cannot be zero.");
      const rem = a % b;
      const floorMod = a - b * Math.floor(a / b);
      const quotient = Math.trunc(a / b);
      return [
        P("a mod n", fmt(rem)),
        R("Quotient (truncated)", fmt(quotient)),
        R("Floored modulo", fmt(floorMod), "Matches the sign of the divisor"),
        M("Expression", `${fmt(a)} mod ${fmt(b)}`),
      ];
    },
    examples: [{ label: "17 mod 5", inputs: { a: 17, b: 5 }, expect: "2" }],
  },
  {
    id: "rounding-calculator", name: "Rounding Calculator", category: "other-tools",
    description: "Round a number to a chosen number of decimal places.",
    keywords: ["rounding", "round", "decimal places", "floor", "ceiling", "nearest"],
    icon: "Calculator", popularity: 44,
    fields: [
      { key: "value", label: "Number", def: 3.14159, step: 0.00001 },
      { key: "dp", label: "Decimal places", def: 2, min: 0, max: 10, step: 1 },
    ],
    compute: (v) => {
      const value = need(v.value, "Number");
      const dp = Math.max(0, Math.min(10, Math.trunc(need(v.dp, "Decimal places"))));
      return [
        P("Rounded", fmt(round(value, dp), dp)),
        R("Round up (ceiling)", fmt(Math.ceil(value))),
        R("Round down (floor)", fmt(Math.floor(value))),
        M("Nearest integer", fmt(Math.round(value))),
      ];
    },
    examples: [{ label: "3.14159 to 2 dp", inputs: { value: 3.14159, dp: 2 }, expect: "3.14" }],
  },
  {
    id: "golden-ratio", name: "Golden Ratio Calculator", category: "other-tools",
    description: "Split a length into the golden ratio, or scale by φ.",
    keywords: ["golden ratio", "phi", "fibonacci", "proportion", "divine proportion", "design"],
    icon: "Sparkles", popularity: 48,
    fields: [{ key: "total", label: "Total length", def: 100, min: 0, unit: "units" }],
    formula: "φ = (1 + √5) / 2 ≈ 1.618",
    compute: (v) => {
      const total = needPos(v.total, "Total length");
      const phi = (1 + Math.sqrt(5)) / 2;
      const longer = total / phi;
      return out(
        [P("Longer segment", fmt(longer)), R("Shorter segment", fmt(total - longer)), M("φ (phi)", fmt(phi))],
        { note: "The longer part is to the whole as the shorter part is to the longer — the golden section." },
      );
    },
    examples: [{ label: "split 100", inputs: { total: 100 }, expect: "61.8" }],
  },
];
