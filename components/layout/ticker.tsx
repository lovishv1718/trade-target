import type { CSSProperties } from "react";
import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";

type Quote = (typeof markets.ticker)[number];

/** Reserve a cell's width in tabular digits, so a changing value never nudges its neighbours. */
const cell = (s: string): CSSProperties => ({ minWidth: `${s.length}ch` });

function Item({ q }: { q: Quote }) {
  const up = q.change >= 0;
  const sign = up ? "+" : "−";
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  const value = `${q.unit === "rupee" ? "₹" : ""}${formatNumber(q.value, decimals)}`;
  const change = `${sign}${formatNumber(Math.abs(q.change), 2)}`;
  const pct = `${sign}${Math.abs(q.changePct).toFixed(2)}%`;
  return (
    <li className="flex shrink-0 items-baseline gap-2 whitespace-nowrap border-r border-rule px-4 tabular">
      <span className="font-semibold text-ink">{q.name}</span>
      <span className="text-right text-ink-2" style={cell(value)}>
        {value}
      </span>
      <span className={`flex items-baseline gap-1.5 text-xs font-semibold ${up ? "text-up" : "text-down"}`}>
        <span aria-hidden>{up ? "▲" : "▼"}</span>
        <span className="text-right" style={cell(change)}>
          {change}
        </span>
        <span className="text-right" style={cell(pct)}>
          {pct}
        </span>
      </span>
    </li>
  );
}

/**
 * Right-to-left looping market tape. The list is rendered twice so the loop is seamless.
 * Under reduced motion the tape stands still and scrolls sideways instead, without the copy.
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
          className="group flex min-w-0 flex-1 items-center overflow-hidden focus-visible:-outline-offset-2 motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:thin]"
        >
          <div className="flex w-max animate-ticker will-change-transform [backface-visibility:hidden] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
            <ul className="flex">
              {markets.ticker.map((q) => (
                <Item key={q.id} q={q} />
              ))}
            </ul>
            <ul className="flex motion-reduce:hidden" aria-hidden>
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
