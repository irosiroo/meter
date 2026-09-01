"use client";

/**
 * METER · command palette
 * ---------------------------------------------------------------------------
 * Global instant search (Cmd/Ctrl-K, or the nav search button). Full keyboard
 * navigation, match highlighting, recent searches and a popular-tools fallback.
 * State lives in a context so any component can open it via useCommandPalette().
 */

import * as Dialog from "@radix-ui/react-dialog";
import { CornerDownLeft, Search, Trash2, TrendingUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Highlight } from "@/components/search/highlight";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_BY_ID } from "@/data/categories";
import { searchTools } from "@/lib/search";
import { useHydrated, useMeterStore, useSearches } from "@/lib/store/meter-store";
import { toolHref, topTools } from "@/lib/tools";
import { cn } from "@/lib/utils";
import type { CalcMeta } from "@/lib/calc/types";

interface CtxValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const Ctx = createContext<CtxValue>({ open() {}, close() {}, toggle() {} });

export function useCommandPalette(): CtxValue {
  return useContext(Ctx);
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo<CtxValue>(() => ({ open, close, toggle }), [open, close, toggle]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </Ctx.Provider>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-[rgb(var(--line)/0.2)] bg-[rgb(var(--surface)/0.8)] px-1.5 py-0.5 text-[10px] font-medium text-fg-muted">
      {children}
    </kbd>
  );
}

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const searches = useSearches();
  const pushSearch = useMeterStore((s) => s.pushSearch);
  const clearSearches = useMeterStore((s) => s.clearSearches);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim();
  const results = useMemo(() => (q ? searchTools(q, 24) : []), [q]);
  const popular = useMemo(() => topTools(6), []);
  const items: CalcMeta[] = q ? results : popular;

  useEffect(() => setActive(0), [q, open]);
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  // Close whenever the route changes (e.g. after selecting a result).
  useEffect(() => onOpenChange(false), [pathname, onOpenChange]);

  const go = useCallback(
    (tool?: CalcMeta) => {
      const t = tool ?? items[active];
      if (!t) return;
      if (q) pushSearch(q);
      onOpenChange(false);
      router.push(toolHref(t.id));
    },
    [items, active, q, pushSearch, onOpenChange, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go();
    }
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, items]);

  const showEmpty = q.length > 0 && results.length === 0;
  const showRecent = !q && hydrated && searches.length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink-950/55 backdrop-blur-[3px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[10vh] z-[61] w-[calc(100vw-1.5rem)] max-w-xl -translate-x-1/2 focus:outline-none"
        >
          <Dialog.Title className="sr-only">Search all tools</Dialog.Title>
          <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl shadow-ink-950/30 ring-1 ring-[rgb(var(--line)/0.12)]">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[rgb(var(--line)/0.1)] px-4">
              <Search size={18} className="shrink-0 text-fg-subtle" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search 309 tools by name, category or keyword…"
                aria-label="Search tools"
                className="h-14 w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-subtle"
              />
              <span className="hidden shrink-0 sm:block">
                <Kbd>esc</Kbd>
              </span>
            </div>

            {/* Body */}
            <div ref={listRef} className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
              {showRecent && (
                <div className="mb-1 px-2 pb-2">
                  <div className="flex items-center justify-between px-1 py-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Recent searches</span>
                    <button
                      onClick={() => clearSearches()}
                      className="inline-flex items-center gap-1 text-xs text-fg-subtle transition-colors hover:text-rose-500"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="rounded-full bg-[rgb(var(--surface)/0.8)] px-3 py-1 text-sm text-fg-muted transition-colors hover:text-fg"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!q && (
                <div className="flex items-center gap-1.5 px-3 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-fg-subtle">
                  <TrendingUp size={13} /> Popular
                </div>
              )}

              {showEmpty ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-fg">No tools match “{q}”.</p>
                  <p className="mt-1 text-sm text-fg-subtle">Try a different term, or browse all 309 tools.</p>
                </div>
              ) : (
                <ul>
                  {items.map((tool, i) => {
                    const cat = CATEGORY_BY_ID[tool.category];
                    return (
                      <li key={tool.id}>
                        <button
                          data-active={i === active}
                          onMouseMove={() => setActive(i)}
                          onClick={() => go(tool)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                            i === active ? "bg-brand-500/12" : "hover:bg-[rgb(var(--surface)/0.7)]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              i === active ? "bg-brand-500/18 text-brand-600 dark:text-brand-300" : "bg-sunken text-fg-muted",
                            )}
                          >
                            <Icon name={tool.icon} size={17} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-fg">
                              <Highlight text={tool.name} query={q} />
                            </span>
                            <span className="block truncate text-xs text-fg-subtle">{cat?.name ?? tool.category}</span>
                          </span>
                          {i === active && <CornerDownLeft size={15} className="shrink-0 text-fg-subtle" />}
                        </button>
                      </li>
                    );
                  })}
                  {items.length === 0 && !showEmpty && (
                    <li className="px-4 py-8 text-center text-sm text-fg-subtle">
                      Start typing to search across every tool.
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[rgb(var(--line)/0.1)] px-4 py-2.5 text-xs text-fg-subtle">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>↵</Kbd> open
                </span>
              </span>
              {q && results.length > 0 && (
                <span>
                  {results.length} result{results.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
