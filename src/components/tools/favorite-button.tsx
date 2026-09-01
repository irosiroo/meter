"use client";

/**
 * Favorite toggle. Reads the persisted store; before hydration it renders the
 * "not favorited" state (matching SSR) and fills in once `hydrated` flips.
 */

import { Heart } from "lucide-react";
import { useHydrated, useIsFavorite, useMeterStore } from "@/lib/store/meter-store";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  id,
  size = 18,
  showLabel = false,
  className,
}: {
  id: string;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const hydrated = useHydrated();
  const isFav = useIsFavorite(id);
  const toggle = useMeterStore((s) => s.toggleFavorite);
  const on = hydrated && isFav;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-fg-muted transition-colors hover:text-rose-500",
        className,
      )}
    >
      <Heart size={size} className={cn("transition-colors", on && "fill-rose-500 text-rose-500")} />
      {showLabel && <span>{on ? "Saved" : "Save"}</span>}
    </button>
  );
}
