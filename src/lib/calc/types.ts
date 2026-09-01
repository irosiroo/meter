/**
 * METER · calculator type system
 * ---------------------------------------------------------------------------
 * Every one of the 309 tools is a `CalcSpec`: declarative inputs + a pure
 * `compute()` function + documentation (formula, explanation, worked examples).
 *
 * The generic <CalculatorRunner /> renders any spec, so a new working tool is
 * ~15 lines of data — no bespoke page, no placeholder.
 *
 * Worked examples are executed by `scripts/verify.ts`, which means the docs on
 * every page are also that tool's regression test.
 *
 * NOTE: this module is imported by build scripts run through `tsx`, so it and
 * everything under `src/data` use relative imports only (no `@/` alias).
 */

export type CategoryId =
  | "mathematics"
  | "finance"
  | "unit-conversion"
  | "engineering"
  | "physics"
  | "chemistry"
  | "construction"
  | "health"
  | "statistics"
  | "biology"
  | "food-nutrition"
  | "everyday-life"
  | "time-date"
  | "digital-technology"
  | "energy-environment"
  | "sports"
  | "education"
  | "business"
  | "geometry"
  | "other-tools";

/** Bespoke UIs that replace the generic runner. Kept deliberately tiny. */
export type CustomKey = "scientific";

export type FieldKind =
  | "number"
  | "select"
  | "text"
  | "textarea"
  | "toggle"
  | "date"
  | "time";

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  key: string;
  label: string;
  /** Defaults to `"number"`. */
  kind?: FieldKind;
  /** Initial value. Numbers may be given as number or string. */
  def?: string | number | boolean;
  /** Short unit rendered inside the control, e.g. `kg`, `%`, `年`. */
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: FieldOption[];
  placeholder?: string;
  /** One-line hint under the control. */
  help?: string;
  /** Occupy the full width of the two-column input grid. */
  wide?: boolean;
  /** Blank is allowed; `compute` receives `NaN`/`""`. */
  optional?: boolean;
  /** Show this field only when another field has one of these values. */
  showIf?: { key: string; in: (string | number | boolean)[] };
}

/** Coerced input values handed to `compute` (numbers are already numbers). */
export type Vals = Record<string, any>;

export type Tone = "primary" | "default" | "muted" | "good" | "warn" | "bad";

export interface Row {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}

export interface ResultTable {
  head: string[];
  rows: (string | number)[][];
  caption?: string;
}

/** Lightweight horizontal bar viz — no charting dependency. */
export interface ResultBar {
  label: string;
  value: number;
  max?: number;
  hint?: string;
  tone?: Tone;
}

export interface Output {
  rows: Row[];
  /** Contextual sentence shown under the result rows. */
  note?: string;
  table?: ResultTable;
  bars?: ResultBar[];
  /** Step-by-step working, rendered as a numbered list. */
  steps?: string[];
}

export type Compute = (v: Vals) => Output | Row[];

export interface Example {
  label: string;
  inputs: Vals;
  /**
   * Substring that must appear in one of the produced row values.
   * Present on examples that assert numeric correctness in `npm run verify`.
   */
  expect?: string;
  note?: string;
}

export interface CalcSpec {
  /** Stable kebab-case id; also the URL slug. */
  id: string;
  name: string;
  category: CategoryId;
  /** One sentence, sentence case, no trailing period needed. */
  description: string;
  keywords: string[];
  /** Lucide icon name, e.g. `"Sigma"`. Falls back to the category icon. */
  icon?: string;
  featured?: boolean;
  /** 0–100 editorial weight used for "Most popular" ordering. */
  popularity?: number;
  fields: Field[];
  compute: Compute;
  /** LaTeX-free, human-readable formula line(s). */
  formula?: string | string[];
  /** How the calculation works / when to use it. Markdown-lite (plain text). */
  how?: string;
  examples?: Example[];
  custom?: CustomKey;
}

/**
 * Serializable projection of a spec, emitted to `src/data/tools.generated.ts`
 * by `npm run gen`. Client bundles (search, favorites, cards) import only this;
 * `compute` stays in the per-category chunk loaded on demand.
 */
export interface CalcMeta {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  keywords: string[];
  icon: string;
  featured: boolean;
  popularity: number;
  inputs: number;
  custom?: CustomKey;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  /** Punchy one-liner for the category hero. */
  tagline: string;
  icon: string;
  /** Accent ramp key from the design system. */
  accent: AccentKey;
}

export type AccentKey =
  | "blue"
  | "cyan"
  | "indigo"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "teal";

export interface HistoryEntry {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  input: string;
  result: string;
  at: number;
}
