/**
 * METER · spec factories
 * ---------------------------------------------------------------------------
 * Factories that turn a table of units into a complete, working calculator so
 * the conversion tools stay correct, consistent and terse to author.
 */

import { fail, fmt, need } from "./helpers";
import type { CalcSpec, CategoryId, Example, FieldOption, Output } from "./types";

export interface UnitDef {
  /** Machine key used in the URL/state, e.g. `"km"`. */
  key: string;
  /** Human label shown in the select, e.g. `"Kilometre (km)"`. */
  label: string;
  /** How many base units one of these equals (linear units). */
  factor?: number;
  /** Non-linear units (temperature, fuel economy) supply both directions. */
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
}

export interface ConverterConfig {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  category?: CategoryId;
  icon?: string;
  featured?: boolean;
  popularity?: number;
  /** Name of the base unit, used in the explanation text. */
  base: string;
  units: UnitDef[];
  /** Default `[from, to]` unit keys. */
  def: [string, string];
  defValue?: number;
  how?: string;
  examples?: Example[];
  /** Units listed in the comparison table (defaults to all of them). */
  tableUnits?: string[];
}

const toBase = (u: UnitDef, v: number): number =>
  u.toBase ? u.toBase(v) : v * (u.factor ?? 1);

const fromBase = (u: UnitDef, v: number): number =>
  u.fromBase ? u.fromBase(v) : v / (u.factor ?? 1);

/**
 * Build a unit converter: a value + from/to selects, a headline result, the
 * reverse rate, and a full table of the value in every supported unit.
 */
export function converter(cfg: ConverterConfig): CalcSpec {
  const opts: FieldOption[] = cfg.units.map((u) => ({ value: u.key, label: u.label }));
  const find = (key: string): UnitDef => {
    const u = cfg.units.find((x) => x.key === key);
    if (!u) fail(`Unknown unit "${key}".`);
    return u;
  };
  const tableKeys = cfg.tableUnits ?? cfg.units.map((u) => u.key);

  return {
    id: cfg.id,
    name: cfg.name,
    category: cfg.category ?? "unit-conversion",
    description: cfg.description,
    keywords: [...cfg.keywords, "converter", "convert", "units"],
    icon: cfg.icon ?? "ArrowLeftRight",
    featured: cfg.featured,
    popularity: cfg.popularity,
    fields: [
      { key: "value", label: "Value", def: cfg.defValue ?? 1 },
      { key: "from", label: "From", kind: "select", options: opts, def: cfg.def[0] },
      { key: "to", label: "To", kind: "select", options: opts, def: cfg.def[1] },
    ],
    formula: `base = value × factor(from) · result = base ÷ factor(to)   (base unit: ${cfg.base})`,
    how:
      cfg.how ??
      `Both units are expressed against a single base unit (${cfg.base}). The input is converted to the base unit and then out again, which keeps every pairing exact and consistent. The table shows the same quantity in every supported unit.`,
    examples: cfg.examples,
    compute: (v): Output => {
      const value = need(v.value, "Value");
      const from = find(String(v.from));
      const to = find(String(v.to));
      const base = toBase(from, value);
      const result = fromBase(to, base);
      const one = fromBase(to, toBase(from, 1));
      const inverse = fromBase(from, toBase(to, 1));

      return {
        rows: [
          {
            label: `${fmt(value)} ${from.key} in ${to.key}`,
            value: `${fmt(result)} ${to.key}`,
            tone: "primary",
          },
          { label: "Conversion rate", value: `1 ${from.key} = ${fmt(one)} ${to.key}` },
          { label: "Reverse rate", value: `1 ${to.key} = ${fmt(inverse)} ${from.key}` },
          { label: `In base units (${cfg.base})`, value: fmt(base), tone: "muted" },
        ],
        table: {
          caption: `${fmt(value)} ${from.key} expressed in every unit`,
          head: ["Unit", "Value"],
          rows: tableKeys.map((k) => {
            const u = find(k);
            return [u.label, fmt(fromBase(u, base))];
          }),
        },
      };
    },
  };
}

/**
 * Length-style helper: build linear units from a compact `[key, label, factor]`
 * tuple list to keep the data files readable.
 */
export function units(list: [string, string, number][]): UnitDef[] {
  return list.map(([key, label, factor]) => ({ key, label, factor }));
}
