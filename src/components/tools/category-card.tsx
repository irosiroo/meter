import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_COUNTS } from "@/data/tools.generated";
import { accent } from "@/lib/accents";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/calc/types";

export function CategoryCard({ category }: { category: Category }) {
  const a = accent(category.accent);
  const count = CATEGORY_COUNTS[category.id] ?? 0;

  return (
    <Link
      href={`/categories/${category.id}`}
      className="group relative flex flex-col rounded-2xl border border-[rgb(var(--line)/0.09)] bg-[rgb(var(--surface)/0.5)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/25 hover:bg-[rgb(var(--surface)/0.85)] hover:shadow-lg hover:shadow-ink-950/5"
    >
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", a.gradient)}>
        <Icon name={category.icon} size={24} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-fg">{category.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-fg-muted">{category.tagline}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-fg-subtle">{count} tools</span>
        <ArrowRight
          size={16}
          className="text-fg-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500"
        />
      </div>
    </Link>
  );
}
