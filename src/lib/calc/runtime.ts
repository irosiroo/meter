/**
 * METER · calc runtime
 * ---------------------------------------------------------------------------
 * The tiny bridge between a declarative `CalcSpec` and the world:
 *   • coercion of raw form values into the numbers/strings `compute` expects
 *   • default value derivation (every field is pre-filled → instant result)
 *   • a safe `runCompute` that turns thrown `CalcError`s into inline messages
 *
 * Shared verbatim by the client <CalculatorRunner /> and by `scripts/verify.ts`
 * so the regression suite exercises exactly the code path users hit. Relative
 * imports only — this module is loaded by `tsx` build scripts.
 */

import { CalcError } from "./helpers";
import type { Field, Output, Row, Vals } from "./types";

/** Coerce one raw control value to the type its `compute` expects. */
export function coerce(field: Field, raw: unknown): number | string | boolean {
  const kind = field.kind ?? "number";
  if (kind === "toggle") return Boolean(raw);
  if (kind === "number") {
    if (raw === "" || raw == null) return NaN;
    if (typeof raw === "number") return raw;
    const cleaned = String(raw).replace(/,/g, "").replace(/\s+/g, "").trim();
    if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "+") return NaN;
    return Number(cleaned);
  }
  // text / textarea / select / date / time
  return raw == null ? "" : String(raw);
}

/** Initial value for a field: its `def`, coerced. */
export function fieldDefault(field: Field): number | string | boolean {
  const kind = field.kind ?? "number";
  if (field.def !== undefined) return coerce(field, field.def);
  if (kind === "toggle") return false;
  if (kind === "number") return NaN;
  return "";
}

/** Build the fully-defaulted value object for a spec's fields. */
export function defaultVals(fields: Field[]): Vals {
  const v: Vals = {};
  for (const f of fields) v[f.key] = fieldDefault(f);
  return v;
}

/** Merge user-supplied (partial) example inputs over the defaults, coerced. */
export function mergeVals(fields: Field[], patch: Vals): Vals {
  const byKey = new Map(fields.map((f) => [f.key, f]));
  const v = defaultVals(fields);
  for (const [k, raw] of Object.entries(patch)) {
    const f = byKey.get(k);
    v[k] = f ? coerce(f, raw) : raw;
  }
  return v;
}

/** Whether a `showIf`-gated field is currently visible given the values. */
export function isVisible(field: Field, vals: Vals): boolean {
  if (!field.showIf) return true;
  return field.showIf.in.includes(vals[field.showIf.key]);
}

export function toOutput(o: Output | Row[]): Output {
  return Array.isArray(o) ? { rows: o } : o;
}

export interface RunOk {
  ok: true;
  output: Output;
}
export interface RunErr {
  ok: false;
  error: string;
}
export type RunResult = RunOk | RunErr;

/** Evaluate a compute function, converting domain errors into inline messages. */
export function runCompute(compute: (v: Vals) => Output | Row[], vals: Vals): RunResult {
  try {
    return { ok: true, output: toOutput(compute(vals)) };
  } catch (e) {
    if (e instanceof CalcError) return { ok: false, error: e.message };
    // Unexpected errors are bugs — surface them, but readably.
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    return { ok: false, error: msg };
  }
}

/** All string values across an Output — used by search snippets and verify. */
export function outputValues(o: Output): string[] {
  const vals = o.rows.map((r) => r.value);
  if (o.table) for (const row of o.table.rows) vals.push(...row.map(String));
  if (o.steps) vals.push(...o.steps);
  if (o.note) vals.push(o.note);
  return vals;
}
