"use client";

/**
 * Cycles light → dark → system, showing the icon for the *resolved* theme. The
 * button is gated on `mounted` so server and first client render match (both
 * emit the neutral Sun), avoiding a hydration mismatch before we know the OS
 * preference.
 */

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/components/theme/theme-provider";

const ORDER: Theme[] = ["light", "dark", "system"];
const LABEL: Record<Theme, string> = { light: "Light", dark: "Dark", system: "System" };

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolved, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = !mounted ? Sun : theme === "system" ? Monitor : resolved === "dark" ? Moon : Sun;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      className={className}
      aria-label={`Theme: ${mounted ? LABEL[theme] : "System"}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${mounted ? LABEL[theme] : "System"}`}
    >
      <Icon size={18} />
    </Button>
  );
}
