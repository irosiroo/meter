"use client";

import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ToolGrid } from "@/components/tools/tool-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORIES } from "@/data/categories";
import { searchTools } from "@/lib/search";
import { useFavorites, useHydrated } from "@/lib/store/meter-store";
import { cn } from "@/lib/utils";
import type { CalcMeta } from "@/lib/calc/types";

type Sort = "popular" | "az" | "za";

const controlCls =
  "h-10 rounded-xl border border-[rgb(var(--line)/0.16)] bg-[rgb(var(--surface)/0.6)] px-3 text-sm font-medium text-fg outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20";

export function AllToolsExplorer({ tools }: { tools: CalcMeta[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [favOnly, setFavOnly] = useState(false);

  const hydrated = useHydrated();
  const favorites = useFavorites();
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const results = useMemo(() => {
    const q = query.trim();
    let list: CalcMeta[] = q ? searchTools(q, 2000) : tools.slice();
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (favOnly) list = list.filter((t) => favSet.has(t.id));
    if (!q) {
      list.sort((a, b) =>
        sort === "az"
          ? a.name.localeCompare(b.name)
          : sort === "za"
            ? b.name.localeCompare(a.name)
            : b.popularity - a.popularity || a.name.localeCompare(b.name),
      );
    }
    return list;
  }, [query, category, sort, favOnly, favSet, tools]);

  const emptyFavorites = favOnly && hydrated && favorites.length === 0;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, keyword or category…"
            aria-label="Filter tools"
            className="h-11 w-full rounded-xl border border-[rgb(var(--line)/0.16)] bg-[rgb(var(--surface)/0.6)] pl-11 pr-4 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={controlCls}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className={cn(controlCls, "disabled:opacity-50")}
            aria-label="Sort tools"
            disabled={query.trim().length > 0}
          >
            <option value="popular">Most popular</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
          <button
            type="button"
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors",
              favOnly
                ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                : "border-[rgb(var(--line)/0.16)] bg-[rgb(var(--surface)/0.6)] text-fg-muted hover:text-fg",
            )}
          >
            <Heart size={16} className={cn(favOnly && "fill-rose-500 text-rose-500")} />
            Saved
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-fg-subtle">
        {emptyFavorites
          ? "No saved tools yet"
          : `${results.length} ${results.length === 1 ? "tool" : "tools"}`}
      </p>

      <div className="mt-4">
        {results.length > 0 ? (
          <ToolGrid tools={results} />
        ) : (
          <EmptyState
            title={favOnly ? "No saved tools" : "No tools found"}
            message={
              favOnly
                ? "Tap the heart on any tool to save it here for quick access."
                : "Try a different search term or clear the filters."
            }
          />
        )}
      </div>
    </div>
  );
}
