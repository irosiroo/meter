"use client";

/**
 * METER · mobile bottom tab bar
 * ---------------------------------------------------------------------------
 * The primary navigation on small screens (hidden ≥ md). The centre item opens
 * the command palette rather than routing.
 */

import { Clock, Grid3x3, Heart, Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/search/command-palette";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Browse", icon: Grid3x3 },
  { search: true, label: "Search", icon: Search },
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/history", label: "History", icon: Clock },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const palette = useCommandPalette();

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-[rgb(var(--line)/0.1)] bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5">
        {TABS.map((t) => {
          const isActive = "href" in t && active(t.href);
          const cls = cn(
            "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
            isActive ? "text-brand-600 dark:text-brand-300" : "text-fg-subtle",
          );
          const inner = (
            <>
              <t.icon size={21} strokeWidth={isActive ? 2.3 : 1.9} />
              {t.label}
            </>
          );
          return "search" in t ? (
            <button key={t.label} type="button" onClick={palette.open} className={cls} aria-label="Search tools">
              {inner}
            </button>
          ) : (
            <Link key={t.label} href={t.href} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
