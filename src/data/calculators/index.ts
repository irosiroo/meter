/**
 * METER · calculator registry (server-side)
 * ---------------------------------------------------------------------------
 * Imports every category's specs eagerly. This module carries `compute`
 * functions for all 309 tools, so it must only be used server-side —
 * build scripts (`gen`, `verify`), the sitemap, and `generateStaticParams`.
 *
 * Client components load a single category chunk on demand via
 * `src/lib/calc/load.ts` instead, keeping calculation code out of the shell.
 */

import type { CalcSpec, CategoryId } from "../../lib/calc/types";

import { CALCULATORS as mathematics } from "./mathematics";
import { CALCULATORS as finance } from "./finance";
import { CALCULATORS as unitConversion } from "./unit-conversion";
import { CALCULATORS as engineering } from "./engineering";
import { CALCULATORS as physics } from "./physics";
import { CALCULATORS as chemistry } from "./chemistry";
import { CALCULATORS as construction } from "./construction";
import { CALCULATORS as health } from "./health";
import { CALCULATORS as statistics } from "./statistics";
import { CALCULATORS as biology } from "./biology";
import { CALCULATORS as foodNutrition } from "./food-nutrition";
import { CALCULATORS as everydayLife } from "./everyday-life";
import { CALCULATORS as timeDate } from "./time-date";
import { CALCULATORS as digitalTechnology } from "./digital-technology";
import { CALCULATORS as energyEnvironment } from "./energy-environment";
import { CALCULATORS as sports } from "./sports";
import { CALCULATORS as education } from "./education";
import { CALCULATORS as business } from "./business";
import { CALCULATORS as geometry } from "./geometry";
import { CALCULATORS as otherTools } from "./other-tools";

/** Specs grouped by category, in canonical category order. */
export const BY_CATEGORY: Record<CategoryId, CalcSpec[]> = {
  "mathematics": mathematics,
  "finance": finance,
  "unit-conversion": unitConversion,
  "engineering": engineering,
  "physics": physics,
  "chemistry": chemistry,
  "construction": construction,
  "health": health,
  "statistics": statistics,
  "biology": biology,
  "food-nutrition": foodNutrition,
  "everyday-life": everydayLife,
  "time-date": timeDate,
  "digital-technology": digitalTechnology,
  "energy-environment": energyEnvironment,
  "sports": sports,
  "education": education,
  "business": business,
  "geometry": geometry,
  "other-tools": otherTools,
};

export const ALL_SPECS: CalcSpec[] = Object.values(BY_CATEGORY).flat();

export const SPEC_BY_ID: Map<string, CalcSpec> = new Map(
  ALL_SPECS.map((s) => [s.id, s]),
);

export function specById(id: string): CalcSpec | undefined {
  return SPEC_BY_ID.get(id);
}
