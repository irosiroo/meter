"use client";

/**
 * METER · persistent user store
 * ---------------------------------------------------------------------------
 * Favorites, calculation history, recently-used tools and recent searches,
 * persisted to localStorage. Hydration is deferred (`skipHydration`) and
 * triggered once on the client by <StoreHydrator/>, so server-rendered markup
 * always matches the first client paint. Read `hydrated` before rendering
 * anything that depends on stored data.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CategoryId, HistoryEntry } from "../calc/types";

const MAX_HISTORY = 200;
const MAX_RECENTS = 24;
const MAX_SEARCHES = 8;

export interface NewHistory {
  slug: string;
  name: string;
  category: CategoryId;
  input: string;
  result: string;
}

interface MeterState {
  hydrated: boolean;
  favorites: string[];
  history: HistoryEntry[];
  recents: string[];
  searches: string[];

  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;

  pushHistory: (entry: NewHistory) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;

  markUsed: (id: string) => void;

  pushSearch: (query: string) => void;
  clearSearches: () => void;
}

let seq = 0;
const uid = () => `h_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export const useMeterStore = create<MeterState>()(
  persist(
    (set) => ({
      hydrated: false,
      favorites: [],
      history: [],
      recents: [],
      searches: [],

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [id, ...s.favorites],
        })),
      clearFavorites: () => set({ favorites: [] }),

      pushHistory: (entry) =>
        set((s) => ({
          history: [{ ...entry, id: uid(), at: Date.now() }, ...s.history].slice(0, MAX_HISTORY),
        })),
      removeHistory: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),

      markUsed: (id) =>
        set((s) => ({ recents: [id, ...s.recents.filter((x) => x !== id)].slice(0, MAX_RECENTS) })),

      pushSearch: (query) => {
        const q = query.trim();
        if (!q) return;
        set((s) => ({
          searches: [q, ...s.searches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(
            0,
            MAX_SEARCHES,
          ),
        }));
      },
      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: "meter:v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        favorites: s.favorites,
        history: s.history,
        recents: s.recents,
        searches: s.searches,
      }),
      onRehydrateStorage: () => () => useMeterStore.setState({ hydrated: true }),
    },
  ),
);

/* ------------------------------------------------------------- selectors */

export const useHydrated = () => useMeterStore((s) => s.hydrated);
export const useFavorites = () => useMeterStore((s) => s.favorites);
export const useIsFavorite = (id: string) =>
  useMeterStore((s) => s.favorites.includes(id));
export const useHistory = () => useMeterStore((s) => s.history);
export const useRecents = () => useMeterStore((s) => s.recents);
export const useSearches = () => useMeterStore((s) => s.searches);
