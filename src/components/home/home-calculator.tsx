"use client";

/**
 * Homepage hero calculator. The scientific calculator takes a `CalcSpec`, but a
 * spec carries a `compute` function which can't cross the server→client
 * boundary — so we build the (compute-less) pseudo-spec here, entirely on the
 * client. This tool is intentionally NOT in the 309-tool registry; it's the
 * hero instrument, not a catalog entry.
 */

import { ScientificCalculator } from "@/components/calculator/scientific-calculator";
import type { CalcSpec } from "@/lib/calc/types";

const SCIENTIFIC_SPEC: CalcSpec = {
  id: "scientific-calculator",
  name: "Scientific Calculator",
  category: "mathematics",
  description: "Full scientific calculator with trig, logs, powers, factorials and memory.",
  keywords: ["scientific", "calculator", "trigonometry", "logarithm"],
  fields: [],
  compute: () => [],
};

export function HomeCalculator() {
  return <ScientificCalculator spec={SCIENTIFIC_SPEC} />;
}
