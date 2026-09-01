import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { HistoryView } from "@/components/tools/history-view";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "History",
  description: `Revisit your recent ${SITE.name} calculations and results.`,
  alternates: { canonical: "/history" },
  robots: { index: false, follow: true },
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "History" }]} />

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">History</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-fg-muted">
          Your recent calculations, saved privately on this device.
        </p>
      </header>

      <div className="mt-8">
        <HistoryView />
      </div>
    </div>
  );
}
