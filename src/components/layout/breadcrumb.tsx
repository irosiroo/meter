import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto text-sm text-fg-subtle">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
          {i > 0 && <ChevronRight size={14} className="text-fg-subtle/60" />}
          {it.href ? (
            <Link href={it.href} className="transition-colors hover:text-fg">
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-fg-muted" aria-current="page">
              {it.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
