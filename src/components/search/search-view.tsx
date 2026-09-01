"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ToolGrid } from "@/components/tools/tool-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { searchTools } from "@/lib/search";
import { useHydrated, useMeterStore, useSearches } from "@/lib/store/meter-store";
import { topTools } from "@/lib/tools";

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const urlQ = params.get("q") ?? "";

  const [query, setQuery] = useState(urlQ);
  const hydrated = useHydrated();
  const searches = useSearches();
  const pushSearch = useMeterStore((s) => s.pushSearch);
  const clearSearches = useMeterStore((s) => s.clearSearches);

  // Reflect external navigations to /search?q=… (navbar, links).
  useEffect(() => {
    setQuery(urlQ);
  }, [urlQ]);

  const q = query.trim();
  const results = useMemo(() => (q ? searchTools(q, 60) : []), [q]);
  const popular = useMemo(() => topTools(8), []);

  const commit = (value: string) => {
    setQuery(value);
    const v = value.trim();
    router.replace(v ? `/search?q=${encodeURIComponent(v)}` : "/search", { scroll: false });
    if (v) pushSearch(v);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(query);
        }}
        className="relative"
      >
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 309 tools…"
          aria-label="Search tools"
          className="h-14 w-full rounded-2xl border border-[rgb(var(--line)/0.16)] bg-[rgb(var(--surface)/0.6)] pl-12 pr-12 text-base text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => commit("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-fg-subtle transition-colors hover:text-fg"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {hydrated && searches.length > 0 && !q && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Recent searches</h2>
            <button type="button" onClick={clearSearches} className="text-xs text-fg-subtle transition-colors hover:text-fg">
              Clear
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {searches.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => commit(s)}
                className="rounded-full border border-[rgb(var(--line)/0.16)] bg-[rgb(var(--surface)/0.6)] px-3 py-1.5 text-sm text-fg-muted transition-colors hover:border-brand-500/30 hover:text-fg"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {q ? (
          results.length > 0 ? (
            <>
              <p className="text-sm text-fg-subtle">
                {results.length} {results.length === 1 ? "result" : "results"} for “{q}”
              </p>
              <ToolGrid tools={results} className="mt-4" />
            </>
          ) : (
            <EmptyState
              title="No results"
              message={`Nothing matched “${q}”. Try a different term or browse by category.`}
              action={{ href: "/categories", label: "Browse categories" }}
            />
          )
        ) : (
          <>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Popular tools</h2>
            <ToolGrid tools={popular} className="mt-4" />
          </>
        )}
      </div>
    </div>
  );
}
