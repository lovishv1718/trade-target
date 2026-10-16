"use client";

import { marketSession } from "@/lib/market";
import { useNow } from "@/lib/use-now";

/** Live or closed, readable without colour: a filled dot and green label when open, a hollow dot and muted label otherwise. */
export function MarketStatusBadge() {
  const now = useNow();
  // Same box before the clock is known, so nothing shifts when the label arrives
  if (!now) return <span aria-hidden className="inline-block h-4 w-28" />;
  const s = marketSession(now);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.open ? "text-up" : "text-muted"}`}>
      <span aria-hidden className={`inline-block size-2 rounded-full ${s.open ? "bg-up" : "border border-muted"}`} />
      {s.label}
    </span>
  );
}
