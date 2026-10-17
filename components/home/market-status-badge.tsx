"use client";

import { marketSession } from "@/lib/market";
import { useNow } from "@/lib/use-now";

const STATE_LABEL = { open: "Open", pre: "Pre-open", closed: "Closed" } as const;

/** "16 Oct, 15:30 IST" from the feed's as-of time, always in Indian time. */
export function istStamp(iso: string) {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
  return `${s} IST`;
}

/**
 * Session state you cannot misread: a boxed label (filled dot when open, hollow when closed,
 * amber in pre-open), never colour alone. The dot breathes only while the market trades.
 * `stamp` adds the time the figures are from.
 */
export function MarketStatus({ asOf, compact = false }: { asOf?: string; compact?: boolean }) {
  const now = useNow();
  return (
    <span className="flex items-center gap-2">
      {now ? <State now={now} compact={compact} /> : <span aria-hidden className="inline-block h-[1.375rem] w-20" />}
      {asOf ? (
        <span className="mkt-stamp">
          As of <time dateTime={asOf}>{istStamp(asOf)}</time>
        </span>
      ) : null}
    </span>
  );
}

function State({ now, compact }: { now: Date; compact: boolean }) {
  const s = marketSession(now);
  const state = s.open ? "open" : s.label === "Pre-open session" ? "pre" : "closed";
  return (
    <span className="mkt-state" data-state={state}>
      <span aria-hidden className="mkt-dot" />
      {compact ? <span>{STATE_LABEL[state]}</span> : s.label}
      {compact ? <span className="sr-only"> ({s.label})</span> : null}
    </span>
  );
}

