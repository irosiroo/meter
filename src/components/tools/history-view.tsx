"use client";

import { Clock, Trash2, X } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { useHistory, useHydrated, useMeterStore } from "@/lib/store/meter-store";
import { formatStamp, relativeTime } from "@/lib/utils";

function ListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgb(var(--line)/0.1)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shimmer h-16 border-b border-[rgb(var(--line)/0.06)] last:border-0" aria-hidden />
      ))}
    </div>
  );
}

export function HistoryView() {
  const hydrated = useHydrated();
  const history = useHistory();
  const removeHistory = useMeterStore((s) => s.removeHistory);
  const clearHistory = useMeterStore((s) => s.clearHistory);

  if (!hydrated) return <ListSkeleton />;

  if (history.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={26} />}
        title="No history yet"
        message="Calculations you run are saved here automatically, so you can revisit or re-open them anytime."
        action={{ href: "/all-tools", label: "Find a tool" }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-subtle">
          {history.length} {history.length === 1 ? "calculation" : "calculations"}
        </p>
        <button
          type="button"
          onClick={clearHistory}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
        >
          <Trash2 size={15} />
          Clear all
        </button>
      </div>

      <ul className="mt-4 divide-y divide-[rgb(var(--line)/0.08)] overflow-hidden rounded-2xl border border-[rgb(var(--line)/0.1)] bg-[rgb(var(--surface)/0.4)]">
        {history.map((h) => (
          <li key={h.id} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[rgb(var(--surface)/0.7)]">
            <div className="min-w-0 flex-1">
              <Link
                href={`/calculator/${h.slug}`}
                className="font-medium text-fg transition-colors hover:text-brand-600 dark:hover:text-brand-300"
              >
                {h.name}
              </Link>
              <p className="mt-0.5 truncate text-sm text-fg-muted">
                <span className="tabular-nums">{h.input}</span>
                <span className="mx-1.5 text-fg-subtle">→</span>
                <span className="font-medium tabular-nums text-fg">{h.result}</span>
              </p>
            </div>
            <time
              dateTime={new Date(h.at).toISOString()}
              title={formatStamp(h.at)}
              className="shrink-0 text-xs tabular-nums text-fg-subtle"
            >
              {relativeTime(h.at)}
            </time>
            <button
              type="button"
              onClick={() => removeHistory(h.id)}
              aria-label={`Remove ${h.name} from history`}
              className="shrink-0 rounded-lg p-1.5 text-fg-subtle opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
