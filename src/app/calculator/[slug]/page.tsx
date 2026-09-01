import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RelatedTools } from "@/components/calculator/related-tools";
import { RunnerIsland } from "@/components/calculator/runner-island";
import { ToolActions } from "@/components/calculator/tool-actions";
import { WorkedExamples } from "@/components/calculator/worked-examples";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Icon } from "@/components/ui/icon";
import { ALL_SPECS, specById } from "@/data/calculators";
import { CATEGORY_BY_ID } from "@/data/categories";
import { accent } from "@/lib/accents";
import { cn, SITE } from "@/lib/utils";

/** The catalog is fixed at build time — unknown slugs 404 rather than render. */
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_SPECS.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spec = specById(slug);
  if (!spec) return { title: "Tool not found" };
  const cat = CATEGORY_BY_ID[spec.category];
  const ogTitle = `${spec.name} · ${cat?.name ?? SITE.name}`;
  return {
    title: spec.name,
    description: spec.description,
    keywords: spec.keywords,
    alternates: { canonical: `/calculator/${spec.id}` },
    openGraph: {
      title: ogTitle,
      description: spec.description,
      url: `${SITE.url}/calculator/${spec.id}`,
      type: "website",
    },
    twitter: { card: "summary", title: ogTitle, description: spec.description },
  };
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spec = specById(slug);
  if (!spec) notFound();

  const cat = CATEGORY_BY_ID[spec.category];
  const a = accent(cat?.accent ?? "blue");
  const formulaLines = spec.formula ? (Array.isArray(spec.formula) ? spec.formula : [spec.formula]) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: cat?.name ?? spec.category,
        item: `${SITE.url}/categories/${spec.category}`,
      },
      { "@type": "ListItem", position: 3, name: spec.name, item: `${SITE.url}/calculator/${spec.id}` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: cat?.name ?? spec.category, href: `/categories/${spec.category}` },
          { label: spec.name },
        ]}
      />

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
            a.gradient,
          )}
        >
          <Icon name={spec.icon ?? cat?.icon ?? "Calculator"} size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{spec.name}</h1>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-fg-muted">{spec.description}</p>
        </div>
        <ToolActions id={spec.id} name={spec.name} className="shrink-0" />
      </header>

      <div className="mt-8">
        <RunnerIsland category={spec.category} slug={spec.id} />
      </div>

      {(formulaLines.length > 0 || spec.how) && (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {formulaLines.length > 0 && (
            <section className="rounded-2xl border border-[rgb(var(--line)/0.1)] bg-[rgb(var(--surface)/0.5)] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Formula</h2>
              <div className="mt-3 space-y-2">
                {formulaLines.map((f, i) => (
                  <p key={i} className="overflow-x-auto rounded-lg bg-sunken px-3 py-2 font-mono text-sm text-fg">
                    {f}
                  </p>
                ))}
              </div>
            </section>
          )}
          {spec.how && (
            <section className="rounded-2xl border border-[rgb(var(--line)/0.1)] bg-[rgb(var(--surface)/0.5)] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">How it works</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-fg-muted">{spec.how}</p>
            </section>
          )}
        </div>
      )}

      <WorkedExamples slug={spec.id} />

      <RelatedTools currentId={spec.id} category={spec.category} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
