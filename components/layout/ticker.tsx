import type { CSSProperties } from "react";
import markets from "@/content/markets.json";
import { TickValue } from "@/components/home/tick-value";
import { formatNumber } from "@/lib/format";

type Quote = (typeof markets.ticker)[number];

/** Reserve a cell's width in tabular digits, so a changing value never nudges its neighbours. */
const cell = (s: string): CSSProperties => ({ minWidth: `${s.length}ch` });

/** One quote on the tape. The value and the change update in place, flashing their direction when they move. */
function Item({ q }: { q: Quote }) {
  const up = q.change >= 0;
  const sign = up ? "+" : "−";
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  const value = `${q.unit === "rupee" ? "₹" : ""}${formatNumber(q.value, decimals)}`;
  const change = `${sign}${formatNumber(Math.abs(q.change), 2)}`;
  const pct = `${sign}${Math.abs(q.changePct).toFixed(2)}%`;
  return (
    <li className="flex shrink-0 snap-start items-baseline gap-2 whitespace-nowrap border-r border-rule px-4 tabular">
      <span className="font-semibold text-ink">{q.name}</span>
      <TickValue value={q.value} className="text-right text-ink-2" style={cell(value)}>
        {value}
      </TickValue>
      <TickValue value={q.change} className={`flex items-baseline gap-1.5 text-xs font-semibold ${up ? "text-up" : "text-down"}`}>
        <span aria-hidden>{up ? "▲" : "▼"}</span>
        <span className="text-right" style={cell(change)}>
          {change}
        </span>
        <span className="text-right" style={cell(pct)}>
          {pct}
        </span>
      </TickValue>
    </li>
  );
}

/**
 * The market tape, ruled like a terminal strip. It runs right to left without end: the quotes are
 * set twice in one track (the second copy hidden from assistive tech) and the track slides left by
 * exactly one copy, so the join never shows. This is the one linear motion on the site, because a
 * tape must run at constant speed; it is transform only (.dx-tape in data.css) and holds still under
 * the pointer and while focus is inside it. Under reduced motion it stands still, set once, and
 * scrolls sideways under the finger, the trackpad or the arrow keys.
 */
export function Ticker() {
  return (
    <div className="surface-ink border-t border-rule">
      <div className="wrap flex h-9 items-stretch text-sm">
        <p className="hidden shrink-0 items-center border-r border-rule pr-3 text-2xs font-semibold uppercase leading-tight tracking-caps text-muted sm:flex">
          Indicative,
          <br />
          may be delayed
        </p>
        <div
          role="region"
          aria-label="Market ticker, indicative, may be delayed"
          tabIndex={0}
          className="dx-tape no-scrollbar flex min-w-0 flex-1 items-center overscroll-x-contain focus-visible:-outline-offset-2"
        >
          <div className="dx-tape-track">
            <ul className="flex shrink-0">
              {markets.ticker.map((q) => (
                <Item key={q.id} q={q} />
              ))}
            </ul>
            <ul className="dx-tape-copy flex shrink-0" aria-hidden>
              {markets.ticker.map((q) => (
                <Item key={q.id} q={q} />
              ))}
            </ul>
          </div>
        </div>
        <p className="flex shrink-0 items-center border-l border-rule pl-3 text-2xs font-semibold uppercase tracking-caps text-muted sm:hidden">Indicative</p>
      </div>
    </div>
  );
}
