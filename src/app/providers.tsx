"use client";

/**
 * METER · client providers
 * ---------------------------------------------------------------------------
 * Single client boundary mounted once in the root layout: theme state, one-shot
 * store hydration, and the global Cmd/Ctrl-K command palette. Everything below
 * it in the tree can call useTheme(), the store selectors and useCommandPalette().
 */

import { StoreHydrator } from "@/components/layout/store-hydrator";
import { CommandPaletteProvider } from "@/components/search/command-palette";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StoreHydrator />
      <CommandPaletteProvider>{children}</CommandPaletteProvider>
    </ThemeProvider>
  );
}
