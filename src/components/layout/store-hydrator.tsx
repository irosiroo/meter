"use client";

/**
 * The Zustand store is created with `skipHydration: true` so server and client
 * render identically on first paint. This component triggers the one-shot
 * rehydrate from LocalStorage after mount, flipping `hydrated` to true.
 */

import { useEffect } from "react";
import { useMeterStore } from "@/lib/store/meter-store";

export function StoreHydrator() {
  useEffect(() => {
    void useMeterStore.persist.rehydrate();
  }, []);
  return null;
}
