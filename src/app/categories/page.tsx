import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CategoryCard } from "@/components/tools/category-card";
import { CATEGORIES } from "@/data/categories";
import { TOTAL } from "@/data/tools.generated";
import { SITE } from "@/lib/utils";

const COUNT = TOTAL || 309;

export const metadata: Metadata = {
  title: "All Categories",
  description: `Browse ${SITE.name}'s ${COUNT} calculators and tools across ${CATEGORIES.length} categories — mathematics, finance, science, health and more.`,
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">Explore by category</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-fg-muted">
          {COUNT} precise, instant tools across {CATEGORIES.length} categories — measurement, money, science, health,
          construction and everyday life.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
