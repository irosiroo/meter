"use client";

import { Heart, Trash2 } from "lucide-react";

import { ToolGrid } from "@/components/tools/tool-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { TOOL_BY_ID } from "@/data/tools.generated";
import { useFavorites, useHydrated, useMeterStore } from "@/lib/store/meter-store";
import type { CalcMeta } from "@/lib/calc/types";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shimmer h-36 rounded-2xl border border-[rgb(var(--line)/0.08)]" aria-hidden />
      ))}
    </div>
  );
}

export function FavoritesView() {
  const hydrated = useHydrated();
  const favorites = useFavorites();
  const clearFavorites = useMeterStore((s) => s.clearFavorites);

  const tools = favorites.map((id) => TOOL_BY_ID[id]).filter(Boolean) as CalcMeta[];

  if (!hydrated) return <GridSkeleton />;

  if (tools.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={26} />}
        title="No favorites yet"
        message="Tap the heart on any tool to pin it here for one-tap access."
        action={{ href: "/all-tools", label: "Browse all tools" }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-subtle">
          {tools.length} saved {tools.length === 1 ? "tool" : "tools"}
        </p>
        <button
          type="button"
          onClick={clearFavorites}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
        >
          <Trash2 size={15} />
          Clear all
        </button>
      </div>
      <ToolGrid tools={tools} className="mt-4" />
    </div>
  );
}
