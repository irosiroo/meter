import { ToolCard } from "@/components/tools/tool-card";
import { cn } from "@/lib/utils";
import type { CalcMeta } from "@/lib/calc/types";

export function ToolGrid({ tools, className }: { tools: CalcMeta[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {tools.map((t) => (
        <ToolCard key={t.id} tool={t} />
      ))}
    </div>
  );
}
