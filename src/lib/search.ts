/**
 * METER · client-side search
 * ---------------------------------------------------------------------------
 * Instant fuzzy-ish ranking over tool metadata: name, keywords, category and
 * description, with field-weighted scoring and multi-term AND matching. Runs
 * entirely on the client over the compact generated index (no network).
 */

import { CATEGORY_BY_ID } from "@/data/categories";
import { TOOLS } from "@/data/tools.generated";
import type { CalcMeta } from "@/lib/calc/types";

export interface Indexed {
  tool: CalcMeta;
  name: string;
  category: string;
  keywords: string;
  description: string;
}

/** Pre-lowercased haystacks, built once. */
const INDEX: Indexed[] = TOOLS.map((tool) => ({
  tool,
  name: tool.name.toLowerCase(),
  category: (CATEGORY_BY_ID[tool.category]?.name ?? tool.category).toLowerCase(),
  keywords: tool.keywords.join(" ").toLowerCase(),
  description: tool.description.toLowerCase(),
}));

function scoreTerm(row: Indexed, term: string): number {
  if (row.name === term) return 100;
  if (row.name.startsWith(term)) return 64;
  if (new RegExp(`\\b${escapeRe(term)}`).test(row.name)) return 48;
  if (row.name.includes(term)) return 34;
  if (row.keywords.includes(term)) return 24;
  if (row.category.includes(term)) return 15;
  if (row.description.includes(term)) return 9;
  return 0;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Ranked matches for a query. Empty query → empty list. */
export function searchTools(query: string, limit = 40): CalcMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const hits: { tool: CalcMeta; score: number }[] = [];
  for (const row of INDEX) {
    let total = 0;
    let matchedAll = true;
    for (const term of terms) {
      const s = scoreTerm(row, term);
      if (s === 0) {
        matchedAll = false;
        break;
      }
      total += s;
    }
    if (!matchedAll) continue;
    total += row.tool.featured ? 10 : 0;
    total += row.tool.popularity / 18;
    hits.push({ tool: row.tool, score: total });
  }

  hits.sort((a, b) => b.score - a.score || b.tool.popularity - a.tool.popularity);
  return hits.slice(0, limit).map((h) => h.tool);
}
