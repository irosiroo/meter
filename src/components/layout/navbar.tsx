"use client";

/**
 * METER · top navigation
 * ---------------------------------------------------------------------------
 * Sticky glass header: brand, primary links (desktop), the command-palette
 * trigger with a ⌘K hint, and the theme toggle. Primary links collapse on
 * mobile, where <MobileTabBar/> takes over.
 */

import { Clock, Grid3x3, Heart, Home, Layers, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/search/command-palette";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: Grid3x3 },
  { href: "/all-tools", label: "All Tools", icon: Layers },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/history", label: "History", icon: Clock },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const palette = useCommandPalette();

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="no-print sticky top-0 z-50 border-b border-[rgb(var(--line)/0.08)] bg-canvas/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="METER — home" className="rounded-lg transition-opacity hover:opacity-90">
          <Logo subtitle />
        </Link>

        <nav className="ml-5 hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active(l.href)
                  ? "bg-[rgb(var(--surface)/0.85)] text-fg"
                  : "text-fg-muted hover:bg-[rgb(var(--surface)/0.6)] hover:text-fg",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={palette.open}
            className="group flex items-center gap-2 rounded-xl border border-[rgb(var(--line)/0.12)] bg-[rgb(var(--surface)/0.6)] py-2 pl-3 pr-2 text-sm text-fg-subtle transition-colors hover:border-brand-500/30 hover:text-fg"
            aria-label="Search tools"
          >
            <Search size={16} />
            <span className="hidden lg:inline">Search tools…</span>
            <kbd className="hidden rounded border border-[rgb(var(--line)/0.16)] bg-canvas/80 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-fg-subtle sm:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
