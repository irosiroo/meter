/**
 * METER · Statistics & Probability (14 tools)
 *
 * Dataset-driven tools use the shared nums() parser so users can paste a
 * column straight from a spreadsheet. Percentiles use the linear-interpolation
 * (R7) method; the normal-distribution helpers use an Abramowitz-Stegun erf.
 */

import { fail, need, needPos, nums, sum, mean, median, modes, variance, stdev, quantile, nCr, nPr, out, P, R, M, fmt, pct } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

function erf(x: number): number {
  const s = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
const normCdf = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));

const DATA_FIELD = { key: "data", label: "Data set", kind: "textarea" as const, def: "2, 4, 4, 4, 5, 5, 7, 9", wide: true, placeholder: "Comma, space or newline separated" };

export const CALCULATORS: CalcSpec[] = [
  {
    id: "descriptive-statistics", name: "Descriptive Statistics", category: "statistics",
    description: "Mean, median, mode, range and standard deviation for a data set.",
    keywords: ["statistics", "mean", "median", "mode", "standard deviation", "summary", "average"],
    icon: "Sigma", featured: true, popularity: 88,
    fields: [DATA_FIELD],
    compute: (v) => {
      const a = nums(v.data);
      const md = modes(a);
      const mn = Math.min(...a);
      const mx = Math.max(...a);
      return out(
        [
          P("Mean", fmt(mean(a))),
          R("Median", fmt(median(a))),
          R("Mode", md.length ? md.map((x) => fmt(x)).join(", ") : "none"),
          R("Range", fmt(mx - mn)),
          R("Sample std dev", fmt(stdev(a, true))),
          R("Population std dev", fmt(stdev(a, false))),
          M("Count", `${a.length}`),
          M("Sum", fmt(sum(a))),
          M("Min / Max", `${fmt(mn)} / ${fmt(mx)}`),
        ],
      );
    },
    examples: [{ label: "2, 4, 4, 4, 5, 5, 7, 9", inputs: { data: "2, 4, 4, 4, 5, 5, 7, 9" }, expect: "4.5" }],
  },
  {
    id: "standard-deviation", name: "Standard Deviation Calculator", category: "statistics",
    description: "Sample and population standard deviation of a data set.",
    keywords: ["standard deviation", "sd", "spread", "dispersion", "sigma", "variance"],
    icon: "Sigma", featured: true, popularity: 80,
    fields: [DATA_FIELD],
    formula: "s = √( Σ(x − x̄)² / (n − 1) )",
    compute: (v) => {
      const a = nums(v.data);
      return [
        P("Sample std dev (s)", fmt(stdev(a, true))),
        R("Population std dev (σ)", fmt(stdev(a, false))),
        R("Mean", fmt(mean(a))),
        M("Count", `${a.length}`),
      ];
    },
    examples: [{ label: "2, 4, 4, 4, 5, 5, 7, 9", inputs: { data: "2, 4, 4, 4, 5, 5, 7, 9" }, expect: "2.138" }],
  },
  {
    id: "variance-calculator", name: "Variance Calculator", category: "statistics",
    description: "Sample and population variance of a data set.",
    keywords: ["variance", "spread", "dispersion", "squared deviation", "statistics"],
    icon: "Sigma", popularity: 64,
    fields: [DATA_FIELD],
    formula: "s² = Σ(x − x̄)² / (n − 1)",
    compute: (v) => {
      const a = nums(v.data);
      return [
        P("Sample variance (s²)", fmt(variance(a, true))),
        R("Population variance (σ²)", fmt(variance(a, false))),
        R("Mean", fmt(mean(a))),
      ];
    },
    examples: [{ label: "2, 4, 4, 4, 5, 5, 7, 9", inputs: { data: "2, 4, 4, 4, 5, 5, 7, 9" }, expect: "4.57" }],
  },
  {
    id: "mean-calculator", name: "Mean Calculator", category: "statistics",
    description: "Arithmetic, geometric and harmonic mean of a data set.",
    keywords: ["mean", "average", "arithmetic", "geometric", "harmonic"],
    icon: "Divide", popularity: 66,
    fields: [{ ...DATA_FIELD, def: "1, 2, 3, 4, 5" }],
    compute: (v) => {
      const a = nums(v.data);
      const arith = mean(a);
      const rows = [P("Arithmetic mean", fmt(arith))];
      if (a.every((x) => x > 0)) {
        const geo = Math.exp(mean(a.map((x) => Math.log(x))));
        const harm = a.length / sum(a.map((x) => 1 / x));
        rows.push(R("Geometric mean", fmt(geo)), R("Harmonic mean", fmt(harm)));
      } else {
        rows.push(M("Geometric / harmonic", "need all positive values"));
      }
      return rows;
    },
    examples: [{ label: "1, 2, 3, 4, 5", inputs: { data: "1, 2, 3, 4, 5" }, expect: "3" }],
  },
  {
    id: "median-calculator", name: "Median & Mode Calculator", category: "statistics",
    description: "Median, mode and quartiles of a data set.",
    keywords: ["median", "mode", "middle", "quartile", "statistics", "average"],
    icon: "BarChart3", popularity: 62,
    fields: [{ ...DATA_FIELD, def: "1, 2, 3, 4, 5, 6" }],
    compute: (v) => {
      const a = nums(v.data);
      const md = modes(a);
      return [
        P("Median", fmt(median(a))),
        R("Mode", md.length ? md.map((x) => fmt(x)).join(", ") : "none"),
        R("Q1 / Q3", `${fmt(quantile(a, 25))} / ${fmt(quantile(a, 75))}`),
        M("Count", `${a.length}`),
      ];
    },
    examples: [{ label: "1, 2, 3, 4, 5, 6", inputs: { data: "1, 2, 3, 4, 5, 6" }, expect: "3.5" }],
  },
  {
    id: "z-score", name: "Z-Score Calculator", category: "statistics",
    description: "Standard score and its percentile in a normal distribution.",
    keywords: ["z score", "standard score", "normal", "percentile", "sigma"],
    icon: "TrendingUp", popularity: 60,
    fields: [
      { key: "x", label: "Value (x)", def: 85 },
      { key: "mean", label: "Mean (μ)", def: 70 },
      { key: "sd", label: "Standard deviation (σ)", def: 10, min: 0 },
    ],
    formula: "z = (x − μ) / σ",
    compute: (v) => {
      const sd = needPos(v.sd, "Standard deviation");
      const z = (need(v.x, "Value") - need(v.mean, "Mean")) / sd;
      return [P("Z-score", fmt(z)), R("Percentile", pct(normCdf(z) * 100)), M("Interpretation", `${fmt(Math.abs(z))} σ ${z >= 0 ? "above" : "below"} the mean`)];
    },
    examples: [{ label: "x=85, μ=70, σ=10", inputs: { x: 85, mean: 70, sd: 10 }, expect: "1.5" }],
  },
  {
    id: "quartiles-iqr", name: "Quartiles & IQR Calculator", category: "statistics",
    description: "First and third quartiles, interquartile range and outlier fences.",
    keywords: ["quartile", "iqr", "interquartile", "box plot", "outlier", "percentile"],
    icon: "BarChart3", popularity: 56,
    fields: [{ ...DATA_FIELD, def: "1, 2, 3, 4, 5, 6, 7, 8" }],
    compute: (v) => {
      const a = nums(v.data);
      const q1 = quantile(a, 25);
      const q3 = quantile(a, 75);
      const iqr = q3 - q1;
      return [
        P("IQR", fmt(iqr)),
        R("Q1 (25th percentile)", fmt(q1)),
        R("Q2 (median)", fmt(median(a))),
        R("Q3 (75th percentile)", fmt(q3)),
        M("Outlier fences", `${fmt(q1 - 1.5 * iqr)} to ${fmt(q3 + 1.5 * iqr)}`),
      ];
    },
    examples: [{ label: "1…8", inputs: { data: "1, 2, 3, 4, 5, 6, 7, 8" }, expect: "3.5" }],
  },
  {
    id: "percentile-rank", name: "Percentile Rank Calculator", category: "statistics",
    description: "The percentile rank of a score within a data set.",
    keywords: ["percentile", "rank", "score", "position", "statistics"],
    icon: "Percent", popularity: 52,
    fields: [
      { ...DATA_FIELD, def: "10, 20, 30, 40, 50" },
      { key: "score", label: "Score to rank", def: 30 },
    ],
    formula: "rank = (below + 0.5 × equal) / n × 100",
    compute: (v) => {
      const a = nums(v.data);
      const score = need(v.score, "Score");
      const below = a.filter((x) => x < score).length;
      const equal = a.filter((x) => x === score).length;
      const rank = ((below + 0.5 * equal) / a.length) * 100;
      return [P("Percentile rank", pct(rank)), M("Values below", `${below} of ${a.length}`)];
    },
    examples: [{ label: "Score 30 in 10…50", inputs: { data: "10, 20, 30, 40, 50", score: 30 }, expect: "50" }],
  },
  {
    id: "combinations", name: "Combinations Calculator (nCr)", category: "statistics",
    description: "Number of ways to choose r items from n when order doesn't matter.",
    keywords: ["combinations", "ncr", "choose", "binomial", "probability"],
    icon: "Dices", popularity: 58,
    fields: [
      { key: "n", label: "Total items (n)", def: 5, min: 0, step: 1 },
      { key: "r", label: "Chosen (r)", def: 2, min: 0, step: 1 },
    ],
    formula: "C(n, r) = n! / (r! · (n − r)!)",
    compute: (v) => {
      const n = need(v.n, "n");
      const r = need(v.r, "r");
      if (r > n) return [R("No combinations", "0", "r cannot exceed n")];
      return [P("Combinations", fmt(nCr(n, r))), R("Permutations (nPr)", fmt(nPr(n, r)))];
    },
    examples: [{ label: "5 choose 2", inputs: { n: 5, r: 2 }, expect: "10" }],
  },
  {
    id: "permutations", name: "Permutations Calculator (nPr)", category: "statistics",
    description: "Number of ordered arrangements of r items chosen from n.",
    keywords: ["permutations", "npr", "arrangements", "order", "probability"],
    icon: "Dices", popularity: 54,
    fields: [
      { key: "n", label: "Total items (n)", def: 5, min: 0, step: 1 },
      { key: "r", label: "Chosen (r)", def: 2, min: 0, step: 1 },
    ],
    formula: "P(n, r) = n! / (n − r)!",
    compute: (v) => {
      const n = need(v.n, "n");
      const r = need(v.r, "r");
      if (r > n) return [R("No permutations", "0", "r cannot exceed n")];
      return [P("Permutations", fmt(nPr(n, r))), R("Combinations (nCr)", fmt(nCr(n, r)))];
    },
    examples: [{ label: "5 permute 2", inputs: { n: 5, r: 2 }, expect: "20" }],
  },
  {
    id: "probability-calculator", name: "Probability Calculator", category: "statistics",
    description: "Probability of an event, its complement and the odds.",
    keywords: ["probability", "odds", "chance", "event", "likelihood"],
    icon: "Percent", featured: true, popularity: 70,
    fields: [
      { key: "favorable", label: "Favourable outcomes", def: 1, min: 0 },
      { key: "total", label: "Total outcomes", def: 6, min: 1 },
    ],
    formula: "P = favourable / total",
    compute: (v) => {
      const fav = need(v.favorable, "Favourable");
      const total = needPos(v.total, "Total");
      if (fav > total) return [R("Invalid", "—", "Favourable outcomes exceed the total")];
      const p = fav / total;
      return [
        P("Probability", pct(p * 100)),
        R("As decimal", fmt(p)),
        R("Complement (not happening)", pct((1 - p) * 100)),
        M("Odds in favour", `${fmt(fav)} : ${fmt(total - fav)}`),
      ];
    },
    examples: [{ label: "1 in 6", inputs: { favorable: 1, total: 6 }, expect: "16.67" }],
  },
  {
    id: "correlation-coefficient", name: "Correlation Coefficient", category: "statistics",
    description: "Pearson correlation coefficient between two data sets.",
    keywords: ["correlation", "pearson", "r", "relationship", "covariance", "scatter"],
    icon: "LineChart", popularity: 50,
    fields: [
      { key: "x", label: "X values", kind: "textarea", def: "1, 2, 3, 4, 5", wide: true },
      { key: "y", label: "Y values", kind: "textarea", def: "2, 4, 5, 4, 5", wide: true },
    ],
    formula: "r = Σ(x−x̄)(y−ȳ) / √(Σ(x−x̄)² · Σ(y−ȳ)²)",
    compute: (v) => {
      const xs = nums(v.x, "X values");
      const ys = nums(v.y, "Y values");
      if (xs.length !== ys.length) fail("X and Y must have the same number of values.");
      const mx = mean(xs);
      const my = mean(ys);
      let sxy = 0, sxx = 0, syy = 0;
      for (let i = 0; i < xs.length; i++) {
        const dx = xs[i] - mx, dy = ys[i] - my;
        sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
      }
      const r = sxy / Math.sqrt(sxx * syy);
      const strength = Math.abs(r) > 0.7 ? "strong" : Math.abs(r) > 0.3 ? "moderate" : "weak";
      return [P("Correlation (r)", fmt(r)), R("r²", fmt(r * r)), M("Interpretation", `${strength} ${r >= 0 ? "positive" : "negative"} correlation`)];
    },
    examples: [{ label: "Two 5-point sets", inputs: { x: "1, 2, 3, 4, 5", y: "2, 4, 5, 4, 5" }, expect: "0.774" }],
  },
  {
    id: "linear-regression", name: "Linear Regression Calculator", category: "statistics",
    description: "Best-fit line (slope, intercept and R²) for paired data.",
    keywords: ["linear regression", "least squares", "slope", "intercept", "trend", "best fit"],
    icon: "LineChart", popularity: 56,
    fields: [
      { key: "x", label: "X values", kind: "textarea", def: "1, 2, 3, 4, 5", wide: true },
      { key: "y", label: "Y values", kind: "textarea", def: "2, 4, 5, 4, 5", wide: true },
    ],
    formula: "y = a·x + b (ordinary least squares)",
    compute: (v) => {
      const xs = nums(v.x, "X values");
      const ys = nums(v.y, "Y values");
      if (xs.length !== ys.length) fail("X and Y must have the same number of values.");
      const mx = mean(xs);
      const my = mean(ys);
      let sxy = 0, sxx = 0, syy = 0;
      for (let i = 0; i < xs.length; i++) {
        const dx = xs[i] - mx, dy = ys[i] - my;
        sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
      }
      const slope = sxy / sxx;
      const intercept = my - slope * mx;
      const r2 = (sxy * sxy) / (sxx * syy);
      return [
        P("Equation", `y = ${fmt(slope)}x ${intercept >= 0 ? "+" : "−"} ${fmt(Math.abs(intercept))}`),
        R("Slope (a)", fmt(slope)),
        R("Intercept (b)", fmt(intercept)),
        R("R²", fmt(r2)),
      ];
    },
    examples: [{ label: "Two 5-point sets", inputs: { x: "1, 2, 3, 4, 5", y: "2, 4, 5, 4, 5" }, expect: "0.6" }],
  },
  {
    id: "weighted-average", name: "Weighted Average Calculator", category: "statistics",
    description: "Average of values with corresponding weights.",
    keywords: ["weighted average", "weighted mean", "grades", "weights", "gpa"],
    icon: "Scale", popularity: 60,
    fields: [
      { key: "values", label: "Values", kind: "textarea", def: "80, 90, 100", wide: true },
      { key: "weights", label: "Weights", kind: "textarea", def: "1, 2, 3", wide: true },
    ],
    formula: "x̄ = Σ(value × weight) / Σweight",
    compute: (v) => {
      const vals = nums(v.values, "Values");
      const wts = nums(v.weights, "Weights");
      if (vals.length !== wts.length) fail("Values and weights must have the same count.");
      const wsum = sum(wts);
      if (wsum === 0) fail("Weights cannot sum to zero.");
      const wa = sum(vals.map((x, i) => x * wts[i])) / wsum;
      return [P("Weighted average", fmt(wa)), R("Simple average", fmt(mean(vals))), M("Total weight", fmt(wsum))];
    },
    examples: [{ label: "80,90,100 weighted 1,2,3", inputs: { values: "80, 90, 100", weights: "1, 2, 3" }, expect: "93.33" }],
  },
];
