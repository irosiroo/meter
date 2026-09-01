/**
 * METER · client tool helpers
 * ---------------------------------------------------------------------------
 * Thin, compute-free views over the generated metadata. Importable from both
 * server and client components because it only touches `CalcMeta` (no `compute`
 * functions), so pulling it into a bundle never drags a category's math along.
 */

import { CATEGORY_COUNTS, TOOLS, TOOL_BY_ID, TOTAL } from "@/data/tools.generated";
import type { CalcMeta, CategoryId } from "@/lib/calc/types";

export { TOOLS, TOOL_BY_ID, TOTAL, CATEGORY_COUNTS };

/** All tools, most "popular" first (editorial weight, then name). */
export const byPopularity: CalcMeta[] = [...TOOLS].sort(
  (a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name),
);

/** Featured flagships, most popular first. */
export const featuredTools: CalcMeta[] = byPopularity.filter((t) => t.featured);

/** The n most popular tools overall. */
export function topTools(n: number): CalcMeta[] {
  return byPopularity.slice(0, n);
}

/** Tools in a category, most popular first. */
export function toolsInCategory(id: CategoryId): CalcMeta[] {
  return byPopularity.filter((t) => t.category === id);
}

/** Other tools in the same category, for the "Related tools" rail. */
export function relatedTools(tool: CalcMeta, n = 6): CalcMeta[] {
  return byPopularity.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, n);
}

/** Canonical route for a tool. */
export function toolHref(id: string): string {
  return `/calculator/${id}`;
}

export function getTool(id: string): CalcMeta | undefined {
  return TOOL_BY_ID[id];
}
