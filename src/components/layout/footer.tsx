/**
 * METER · site footer (server component)
 */

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/lib/utils";

const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/all-tools", label: "All Tools" },
  { href: "/favorites", label: "Favorites" },
  { href: "/history", label: "History" },
];

const LEGAL = [
  { href: "/about", label: "About" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="no-print mt-24 border-t border-[rgb(var(--line)/0.08)] bg-canvas-deep">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1.6fr] lg:px-8">
        <div>
          <Logo subtitle />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">{SITE.tagline}</p>
          <p className="mt-3 text-sm text-fg-subtle">309 smart tools. One powerful panel.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-fg">Explore</h3>
          <ul className="mt-4 space-y-2.5">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-fg">Categories</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categories/${c.id}`}
                  className="text-sm text-fg-muted transition-colors hover:text-fg"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[rgb(var(--line)/0.06)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-fg-subtle sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {SITE.name}. {SITE.subtitle}.
          </p>
          <div className="flex gap-4">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-fg">
                {l.label}
              </Link>
            ))}
          </div>
          <p>Measure. Calculate. Solve.</p>
        </div>
      </div>
    </footer>
  );
}
