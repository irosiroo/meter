import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ToolGrid } from "@/components/tools/tool-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_BY_ID, CATEGORY_IDS } from "@/data/categories";
import { accent } from "@/lib/accents";
import { toolsInCategory } from "@/lib/tools";
import { cn, SITE } from "@/lib/utils";
import type { CategoryId } from "@/lib/calc/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_IDS.map((id) => ({ category: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_BY_ID[category as CategoryId];
  if (!cat) return { title: "Category not found" };
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `/categories/${cat.id}` },
    openGraph: {
      title: `${cat.name} · ${SITE.name}`,
      description: cat.description,
      url: `${SITE.url}/categories/${cat.id}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = CATEGORY_BY_ID[category as CategoryId];
  if (!cat) notFound();

  const a = accent(cat.accent);
  const tools = toolsInCategory(cat.id);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: cat.name },
        ]}
      />

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
            a.gradient,
          )}
        >
          <Icon name={cat.icon} size={28} />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">{cat.name}</h1>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-fg-muted">{cat.description}</p>
        </div>
        <span className="text-sm font-medium text-fg-subtle sm:ml-auto sm:shrink-0">{tools.length} tools</span>
      </header>

      <div className="mt-8">
        {tools.length > 0 ? (
          <ToolGrid tools={tools} />
        ) : (
          <EmptyState
            title="No tools yet"
            message="Tools for this category are being prepared. Please check back shortly."
            action={{ href: "/categories", label: "Browse other categories" }}
          />
        )}
      </div>
    </div>
  );
}
