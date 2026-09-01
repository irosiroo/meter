/**
 * METER · calculator lazy loader (client-side)
 * ---------------------------------------------------------------------------
 * Each entry is a literal dynamic import, so the bundler code-splits every
 * category into its own chunk. Opening a calculator page fetches just that one
 * category's math — never all 309. Results are memoised for the session.
 */

import type { CalcSpec, CategoryId } from "./types";

type Mod = { CALCULATORS: CalcSpec[] };

const LOADERS: Record<CategoryId, () => Promise<Mod>> = {
  "mathematics": () => import("../../data/calculators/mathematics"),
  "finance": () => import("../../data/calculators/finance"),
  "unit-conversion": () => import("../../data/calculators/unit-conversion"),
  "engineering": () => import("../../data/calculators/engineering"),
  "physics": () => import("../../data/calculators/physics"),
  "chemistry": () => import("../../data/calculators/chemistry"),
  "construction": () => import("../../data/calculators/construction"),
  "health": () => import("../../data/calculators/health"),
  "statistics": () => import("../../data/calculators/statistics"),
  "biology": () => import("../../data/calculators/biology"),
  "food-nutrition": () => import("../../data/calculators/food-nutrition"),
  "everyday-life": () => import("../../data/calculators/everyday-life"),
  "time-date": () => import("../../data/calculators/time-date"),
  "digital-technology": () => import("../../data/calculators/digital-technology"),
  "energy-environment": () => import("../../data/calculators/energy-environment"),
  "sports": () => import("../../data/calculators/sports"),
  "education": () => import("../../data/calculators/education"),
  "business": () => import("../../data/calculators/business"),
  "geometry": () => import("../../data/calculators/geometry"),
  "other-tools": () => import("../../data/calculators/other-tools"),
};

const cache = new Map<CategoryId, CalcSpec[]>();

export async function loadCategory(id: CategoryId): Promise<CalcSpec[]> {
  const hit = cache.get(id);
  if (hit) return hit;
  const mod = await LOADERS[id]();
  cache.set(id, mod.CALCULATORS);
  return mod.CALCULATORS;
}

export async function loadSpec(
  category: CategoryId,
  id: string,
): Promise<CalcSpec | undefined> {
  const list = await loadCategory(category);
  return list.find((s) => s.id === id);
}
