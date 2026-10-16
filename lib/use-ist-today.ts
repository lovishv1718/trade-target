"use client";

import { istToday } from "./ipo";
import { useNow } from "./use-now";

/**
 * Today's date in IST. Prerendered HTML uses the build date so crawlers see statuses;
 * the browser then recomputes from the real date.
 */
export function useIstToday(buildDate: string) {
  const now = useNow(10 * 60_000);
  return now ? istToday(now) : buildDate;
}
