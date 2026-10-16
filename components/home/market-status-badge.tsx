"use client";

import { marketSession } from "@/lib/market";
import { useNow } from "@/lib/use-now";

export function MarketStatusBadge() {
  const now = useNow();
  if (!now) return <span className="h-5" />;
  const s = marketSession(now);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.75rem] font-semibold ${s.open ? "text-up-ink" : "text-muted"}`}>
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${s.open ? "bg-up" : "bg-muted/60"}`} />
      {s.label}
    </span>
  );
}
