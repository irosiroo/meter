/**
 * METER · verification suite
 * ---------------------------------------------------------------------------
 * The single source of truth that the product actually works:
 *   1. every tool computes a result on its default inputs (no crashes, no
 *      empty output) — the "instant result" guarantee the UI relies on;
 *   2. every worked example runs, and every example carrying an `expect`
 *      asserts that value appears in the output — so the docs are tests;
 *   3. ids are unique + kebab-case and the grand total is exactly 309.
 *
 * Run with: `npm run verify`  (add `--loose` to skip the 309 gate while
 * authoring). Exits non-zero on any failure, which gates the production build.
 */

import { CATEGORIES } from "../src/data/categories";
import { ALL_SPECS, BY_CATEGORY } from "../src/data/calculators/index";
import { defaultVals, mergeVals, outputValues, runCompute } from "../src/lib/calc/runtime";

const TARGET = 309;
const LOOSE = process.argv.includes("--loose");

let failures = 0;
const fail = (id: string, msg: string) => {
  failures++;
  console.error(`  ✗ [${id}] ${msg}`);
};

/* ------------------------------------------------- 1. defaults smoke test */

let smoke = 0;
for (const s of ALL_SPECS) {
  const res = runCompute(s.compute, defaultVals(s.fields));
  if (!res.ok) fail(s.id, `default inputs throw — ${res.error}`);
  else if (!res.output.rows.length) fail(s.id, "produced no result rows on defaults");
  else smoke++;
}

/* ---------------------------------------------------- 2. worked examples */

let ran = 0;
let asserted = 0;
for (const s of ALL_SPECS) {
  for (const ex of s.examples ?? []) {
    ran++;
    const res = runCompute(s.compute, mergeVals(s.fields, ex.inputs));
    if (!res.ok) {
      fail(s.id, `example "${ex.label}" threw — ${res.error}`);
      continue;
    }
    if (ex.expect != null) {
      asserted++;
      const values = outputValues(res.output);
      if (!values.some((v) => v.includes(ex.expect!))) {
        fail(
          s.id,
          `example "${ex.label}" expected to contain "${ex.expect}" — got: ${values
            .slice(0, 8)
            .join("  |  ")}`,
        );
      }
    }
  }
}

/* ----------------------------------------------------- 3. structure + count */

const seen = new Set<string>();
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
for (const s of ALL_SPECS) {
  if (!KEBAB.test(s.id)) fail(s.id, "id is not kebab-case");
  if (seen.has(s.id)) fail(s.id, "duplicate id");
  seen.add(s.id);
}

/* --------------------------------------------------------------- report */

console.log("\nMETER · verification");
console.log("────────────────────────────────────────────");
for (const c of CATEGORIES) {
  const n = (BY_CATEGORY[c.id] ?? []).length;
  console.log(`  ${String(n).padStart(3)}  ${c.name}`);
}
console.log("────────────────────────────────────────────");
console.log(`  ${String(ALL_SPECS.length).padStart(3)}  TOTAL tools`);
console.log(
  `\n  smoke-tested: ${smoke}/${ALL_SPECS.length}   examples run: ${ran}   assertions: ${asserted}`,
);

if (ALL_SPECS.length !== TARGET) {
  const msg = `expected exactly ${TARGET} tools, found ${ALL_SPECS.length}`;
  if (LOOSE) console.warn(`\n  ⚠ ${msg} (ignored: --loose)`);
  else fail("TOTAL", msg);
}

if (failures) {
  console.error(`\n✗ ${failures} problem(s) found.\n`);
  process.exit(1);
}
console.log("\n✓ All checks passed.\n");
