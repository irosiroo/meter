import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { HomeCalculator } from "@/components/home/home-calculator";
import { SearchTrigger } from "@/components/search/search-trigger";
import { CategoryCard } from "@/components/tools/category-card";
import { ToolGrid } from "@/components/tools/tool-grid";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionHeading } from "@/components/ui/section-heading";
import { CATEGORIES } from "@/data/categories";
import { topTools, TOTAL } from "@/lib/tools";
import { cn } from "@/lib/utils";

const COUNT = TOTAL || 309;

export default function HomePage() {
  const popular = topTools(9);

  return (
    <div className="pb-4">
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blueprint absolute inset-0" />
          <div className="absolute -left-24 -top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl animate-float-slow" />
          <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-flux-400/15 blur-3xl animate-float-slower" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3.5 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-300">
              <Sparkles size={15} />
              {COUNT} smart tools · {CATEGORIES.length} categories
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-fg sm:text-6xl">
              Measure. Calculate. <span className="text-gradient">Solve.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
              {COUNT} intelligent calculators and professional tools in one powerful panel — from a full
              scientific calculator to finance, unit conversion, health, engineering and beyond.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <SearchTrigger className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                <Search size={18} /> Search {COUNT} tools
                <kbd className="ml-1 rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold">
                  ⌘K
                </kbd>
              </SearchTrigger>
              <Link href="/categories" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Browse categories
                <ArrowRight size={17} />
              </Link>
            </div>

            <dl className="mx-auto mt-10 flex max-w-md items-center justify-center gap-8 text-center">
              <div>
                <dt className="text-2xl font-bold text-fg tnum">{COUNT}</dt>
                <dd className="text-xs uppercase tracking-wide text-fg-subtle">Tools</dd>
              </div>
              <div className="h-8 w-px bg-[rgb(var(--line)/0.14)]" />
              <div>
                <dt className="text-2xl font-bold text-fg tnum">{CATEGORIES.length}</dt>
                <dd className="text-xs uppercase tracking-wide text-fg-subtle">Categories</dd>
              </div>
              <div className="h-8 w-px bg-[rgb(var(--line)/0.14)]" />
              <div>
                <dt className="text-2xl font-bold text-fg">Free</dt>
                <dd className="text-xs uppercase tracking-wide text-fg-subtle">Always</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Scientific calc */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Scientific calculator"
          subtitle="Trig, logs, powers, factorials, memory and history — type directly or tap the keypad."
        />
        <div className="mt-6">
          <HomeCalculator />
        </div>
      </section>

      {/* ------------------------------------------------------- Popular */}
      {popular.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Popular tools"
            subtitle="The calculators people reach for most."
            action={{ href: "/all-tools", label: "All tools" }}
          />
          <ToolGrid tools={popular} className="mt-6" />
        </section>
      )}

      {/* ----------------------------------------------------- Categories */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Browse by category"
          subtitle="Twenty professional categories, each a focused toolkit."
          action={{ href: "/categories", label: "See all" }}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- CTA */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white sm:px-12">
          <div className="blueprint absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">One panel for every calculation.</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Save your favorites, keep a history of results, and find any of {COUNT} tools in a keystroke.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/all-tools"
                className={cn(buttonVariants({ variant: "solid", size: "lg" }), "bg-white text-brand-700 hover:bg-white/90")}
              >
                Explore all tools <ArrowRight size={17} />
              </Link>
              <Link
                href="/favorites"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/30 text-white hover:bg-white/10")}
              >
                Your favorites
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
