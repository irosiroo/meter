import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { FavoritesView } from "@/components/tools/favorites-view";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Favorites",
  description: `Your saved ${SITE.name} tools, ready for one-tap access.`,
  alternates: { canonical: "/favorites" },
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Favorites" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">Favorites</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-fg-muted">
          Your saved tools, stored privately on this device.
        </p>
      </header>

      <div className="mt-8">
        <FavoritesView />
      </div>
    </div>
  );
}
