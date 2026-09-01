"use client";

/** A button that opens the global command palette. Lets server components add a
 * search CTA without pulling the whole palette into their tree. */

import { useCommandPalette } from "@/components/search/command-palette";

export function SearchTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useCommandPalette();
  return (
    <button type="button" onClick={open} className={className} aria-label="Search tools">
      {children}
    </button>
  );
}
