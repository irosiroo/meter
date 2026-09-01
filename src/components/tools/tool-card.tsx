import Link from "next/link";
import { FavoriteButton } from "@/components/tools/favorite-button";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_BY_ID } from "@/data/categories";
import { accent } from "@/lib/accents";
import { toolHref } from "@/lib/tools";
import { cn } from "@/lib/utils";
import type { CalcMeta } from "@/lib/calc/types";

/**
 * Tool card. The whole card is a link via an absolute overlay so the favorite
 * button can live on top without nesting a <button> inside an <a>.
 */
export function ToolCard({ tool }: { tool: CalcMeta }) {
  const cat = CATEGORY_BY_ID[tool.category];
  const a = accent(cat?.accent ?? "blue");

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[rgb(var(--line)/0.09)] bg-[rgb(var(--surface)/0.5)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/25 hover:bg-[rgb(var(--surface)/0.85)] hover:shadow-lg hover:shadow-ink-950/5">
      <Link href={toolHref(tool.id)} className="absolute inset-0 z-[1] rounded-2xl" aria-label={tool.name}>
        <span className="sr-only">{tool.name}</span>
      </Link>

      <div className="flex items-start justify-between gap-2">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", a.softBg, a.text)}>
          <Icon name={tool.icon} size={20} />
        </span>
        <FavoriteButton id={tool.id} size={17} className="relative z-[2]" />
      </div>

      <h3 className="mt-3.5 font-semibold leading-snug text-fg transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
        {tool.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-muted">{tool.description}</p>

      <div className="mt-3 flex items-center gap-2 pt-0.5">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", a.chip)}>{cat?.name ?? tool.category}</span>
      </div>
    </div>
  );
}
