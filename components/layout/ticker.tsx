import Image from "next/image";
import type { CSSProperties } from "react";
import markets from "@/content/markets.json";
import { SessionStack } from "@/components/home/market-status-badge";
import { TickValue } from "@/components/home/tick-value";
import { AreaSpark } from "@/components/spark";
import { formatNumber } from "@/lib/format";
import { sampleSeries } from "@/lib/market";

type Quote = (typeof markets.ticker)[number];

/** Reserve a cell's width in tabular digits, so a changing value never nudges its neighbours. */
const cell = (s: string): CSSProperties => ({ minWidth: `${s.length}ch` });

/**
 * One quote on the tape: the name over the level and the move, with the session's line beside
 * them. The value and the change update in place, flashing their direction when they move.
 */
function Item({ q, copy }: { q: Quote; copy: string }) {
  const up = q.change >= 0;
  const sign = up ? "+" : "−";
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  const value = `${q.unit === "rupee" ? "₹" : ""}${formatNumber(q.value, decimals)}`;
  const change = `${sign}${formatNumber(Math.abs(q.change), 2)}`;
  const pct = `${sign}${Math.abs(q.changePct).toFixed(2)}%`;
  const series = sampleSeries(q.id, q.value - q.change, q.value);
  return (
    <li className="flex shrink-0 snap-start items-center gap-4 whitespace-nowrap border-r border-rule px-5 tabular">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-ink">{q.name}</span>
        <span className="flex items-baseline gap-2">
          <TickValue value={q.value} className="text-right text-sm font-semibold text-ink" style={cell(value)}>
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
        </span>
      </span>
      <span className={up ? "text-up" : "text-down"}>
        <AreaSpark values={series} id={`tape-${copy}-${q.id}`} width={72} height={30} className="h-8 w-[4.5rem]" />
      </span>
    </li>
  );
}

/**
 * The market tape, a navy strip under the navigation. It runs right to left without end: the
 * quotes are set twice in one track (the second copy hidden from assistive tech) and the track
 * slides left by exactly one copy, so the join never shows. Transform only (.dx-tape in data.css);
 * it holds still under the pointer and while focus is inside it. Under reduced motion it stands
 * still and scrolls sideways under the finger, the trackpad or the arrow keys.
 */
export function Ticker() {
  return (
    <div className="wrap relative mt-4">
      {/* The bull sculpture standing on the right end of the tape, its hindquarters behind the
          frosted nav bar (which ends where they begin, see .hdr-nav). Decoration only, and only
          where the nav items end well before it. */}
      <Image
        src="/brand/bull-3d.webp"
        alt=""
        aria-hidden
        width={524}
        height={316}
        unoptimized
        loading="eager"
        className="bull-3d pointer-events-none absolute bottom-[calc(100%-3px)] right-0 z-30 hidden w-[262px] select-none min-[1440px]:block"
      />
      <div className="hdr-tape surface-ink glass-navy flex h-[4.5rem] items-stretch rounded-2xl">
        <div className="hidden shrink-0 items-center border-r border-rule pl-5 pr-5 sm:flex" title="Indicative, may be delayed. Sample values in this preview.">
          <SessionStack />
        </div>
        <div
          role="region"
          aria-label="Market ticker, indicative, may be delayed"
          tabIndex={0}
          className="dx-tape no-scrollbar flex min-w-0 flex-1 items-center overscroll-x-contain focus-visible:-outline-offset-2"
        >
          <div className="dx-tape-track">
            <ul className="flex shrink-0">
              {markets.ticker.map((q) => (
                <Item key={q.id} q={q} copy="a" />
              ))}
            </ul>
            <ul className="dx-tape-copy flex shrink-0" aria-hidden>
              {markets.ticker.map((q) => (
                <Item key={q.id} q={q} copy="b" />
              ))}
            </ul>
          </div>
        </div>
        <p className="flex shrink-0 items-center border-l border-rule px-3 text-2xs font-semibold uppercase tracking-caps text-muted sm:hidden">Indicative</p>
      </div>
    </div>
  );
}
