"use client";

import { useSyncExternalStore } from "react";

/**
 * Current time on the client, refreshed every `intervalMs`. Returns null while
 * prerendering and hydrating, so static HTML never bakes in the build date.
 */
export function useNow(intervalMs = 60_000): Date | null {
  const bucket = useSyncExternalStore(
    (onChange) => {
      const id = window.setInterval(onChange, intervalMs);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs),
    () => null,
  );
  return bucket === null ? null : new Date(bucket * intervalMs);
}
