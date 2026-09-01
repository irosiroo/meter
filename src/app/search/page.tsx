import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SearchView } from "@/components/search/search-view";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  description: `Search all ${SITE.name} calculators and tools by name, keyword or category.`,
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">Search</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-fg-muted">
          Find any of {SITE.name}&rsquo;s tools by name, keyword or category.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<div className="shimmer h-14 rounded-2xl" aria-hidden />}>
          <SearchView />
        </Suspense>
      </div>
    </div>
  );
}
