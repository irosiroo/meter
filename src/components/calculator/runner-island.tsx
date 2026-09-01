"use client";

/**
 * Client island for a calculator page. Lazy-loads just this tool's category
 * chunk (via loadSpec) so the interactive runner — and its `compute` — never
 * ship in the shared bundle. Shows a skeleton while the chunk streams in.
 */

import { useEffect, useState } from "react";
import { CalculatorRunner } from "@/components/calculator/calculator-runner";
import { loadSpec } from "@/lib/calc/load";
import type { CalcSpec, CategoryId } from "@/lib/calc/types";

function RunnerSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="glass-strong shimmer h-80 rounded-3xl" aria-hidden />
      ))}
    </div>
  );
}

export function RunnerIsland({ category, slug }: { category: CategoryId; slug: string }) {
  const [spec, setSpec] = useState<CalcSpec | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setSpec(null);
    setFailed(false);
    loadSpec(category, slug)
      .then((s) => {
        if (!alive) return;
        if (s) setSpec(s);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [category, slug]);

  if (failed) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/8 px-4 py-4 text-sm text-rose-600 dark:text-rose-300">
        This tool could not be loaded. Please refresh the page.
      </div>
    );
  }
  if (!spec) return <RunnerSkeleton />;
  return <CalculatorRunner spec={spec} />;
}
