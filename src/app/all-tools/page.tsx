import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AllToolsExplorer } from "@/components/tools/all-tools-explorer";
import { TOOLS, TOTAL } from "@/data/tools.generated";
import { SITE } from "@/lib/utils";

const COUNT = TOTAL || 309;

export const metadata: Metadata = {
  title: "All Tools",
  description: `Search, filter and sort all ${COUNT} ${SITE.name} calculators and tools in one place.`,
  alternates: { canonical: "/all-tools" },
};

export default function AllToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Tools" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">All tools</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-fg-muted">
          Every {SITE.name} tool in one place — {COUNT} of them. Filter by category, sort, search, or show just your
          saved favorites.
        </p>
      </header>

      <div className="mt-8">
        <AllToolsExplorer tools={TOOLS} />
      </div>
    </div>
  );
}
