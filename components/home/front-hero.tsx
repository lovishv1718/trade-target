"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import markets from "@/content/markets.json";
import type { ArticleCard } from "@/lib/content";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { ipoStatus, type Ipo } from "@/lib/ipo";
import { istDateLong, marketSession } from "@/lib/market";
import { useIstToday } from "@/lib/use-ist-today";
import { useNow } from "@/lib/use-now";
import { Kicker } from "../kicker";
import { LeadComposition } from "../story";

const SIZES = "(min-width: 1280px) 520px, (min-width: 1024px) 660px, (min-width: 768px) 440px, 100vw";

/** One index move for the glance strip, sign and arrow as well as colour. */
function Move({ name, value, change, pct }: { name: string; value: number; change: number; pct: number }) {
  const up = change >= 0;
  return (
    <div className="glance-cell">
      <dt>{name}</dt>
      <dd>
        <span className="text-ink">{formatNumber(value, 2)}</span>
        <span className={`ml-2 font-semibold ${up ? "text-up" : "text-down"}`}>
          <span aria-hidden className="mr-0.5 text-2xs">
            {up ? "▲" : "▼"}
          </span>
          {up ? "+" : "−"}
          {Math.abs(pct).toFixed(2)}%
        </span>
      </dd>
    </div>
  );
}

/**
 * The hero's folio line: the date and market state, the two benchmark indices and what is open in
 * IPO today, all from data already on the page. Set as a ruled ledger, never animated.
 */
function Glance({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const now = useNow();
  const today = useIstToday(buildDate);
  const session = now ? marketSession(now) : null;
  const state = session ? (session.open ? "open" : session.label === "Pre-open session" ? "pre" : "closed") : null;
  const open = ipos.filter((i) => ipoStatus(i, today) === "open");
  const next = ipos
    .filter((i) => ipoStatus(i, today) === "upcoming" && i.dates.open)
    .sort((a, b) => (a.dates.open! < b.dates.open! ? -1 : 1))[0];
  const [nifty, sensex] = markets.board;
  return (
    <dl className="glance" aria-label="At a glance">
      <div className="glance-cell">
        <dt suppressHydrationWarning>{now ? istDateLong(now) : "Today"}</dt>
        <dd>
          {state ? (
            <span className="mkt-state" data-state={state}>
              <span aria-hidden className="mkt-dot" />
              {session!.label}
            </span>
          ) : (
            <span aria-hidden className="inline-block h-[1.375rem] w-28" />
          )}
        </dd>
      </div>
      <Move name={nifty.name} value={nifty.value} change={nifty.change} pct={nifty.changePct} />
      <Move name={sensex.name} value={sensex.value} change={sensex.change} pct={sensex.changePct} />
      <div className="glance-cell">
        <dt>{open.length ? "IPO open today" : "IPO opening next"}</dt>
        <dd className="truncate">
          {open.length ? (
            <Link prefetch={false} href={`/ipo/${open[0].slug}/`} className="link-quiet text-ipo">
              {open[0].name}
              {open.length > 1 ? <span className="font-normal text-muted"> +{open.length - 1} more</span> : null}
            </Link>
          ) : next ? (
            <Link prefetch={false} href={`/ipo/${next.slug}/`} className="link-quiet text-ipo">
              {next.name}
              <span className="font-normal text-muted">, {formatDayMonth(next.dates.open!)}</span>
            </Link>
          ) : (
            <span className="font-normal text-muted">No issue this week</span>
          )}
        </dd>
      </div>
    </dl>
  );
}

/**
 * The front page block: a folio line of live context, the lead composition, and a numbered index
 * of the top stories that switches the lead. Never rotates by itself. Tabs take arrow keys, the
 * picture takes a swipe, and desktop has arrows. Slides are stacked in one grid cell so the block
 * keeps the height of its tallest story and nothing below it moves when the lead changes.
 */
export function FrontHero({ stories, ipos, buildDate }: { stories: ArticleCard[]; ipos: Ipo[]; buildDate: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const n = stories.length;

  const go = (i: number, focus = false) => {
    const next = (i + n) % n;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: n - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key], true);
  };

  // On a phone the index sits below the lead: bring the lead back into view when a tab is chosen
  const choose = (i: number) => {
    go(i);
    const el = stage.current;
    if (el && el.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Top stories">
      <Glance ipos={ipos} buildDate={buildDate} />
      <div className="hero-grid">
        <div ref={stage} className="hero-stage scroll-mt-14" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
          {stories.map((s, i) => (
            <div
              key={s.slug}
              id={`hero-slide-${i}`}
              role="tabpanel"
              aria-roledescription="slide"
              aria-labelledby={`hero-tab-${i}`}
              aria-hidden={i !== active}
              inert={i !== active}
              data-active={i === active || undefined}
              className="hero-slide"
            >
              <LeadComposition story={s} priority={i === 0} sizes={SIZES} reveal={i === 0} />
            </div>
          ))}
        </div>
        <div className="hero-index">
          <div className="hero-index-head">
            <p className="kicker text-ink">Top stories</p>
            <p className="tabular text-xs text-muted" aria-live="polite">
              <span className="font-semibold text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </p>
            <div className="hidden gap-2 md:flex">
              <button type="button" className="btn btn-secondary btn-sm btn-icon" aria-controls={`hero-slide-${active}`} aria-label="Previous story" onClick={() => go(active - 1)}>
                <svg aria-hidden width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M13 6H1.5M6 1L1 6l5 5" />
                </svg>
              </button>
              <button type="button" className="btn btn-secondary btn-sm btn-icon" aria-controls={`hero-slide-${active}`} aria-label="Next story" onClick={() => go(active + 1)}>
                <svg aria-hidden width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M1 6h11.5M8 1l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
          <div role="tablist" aria-label="Top stories" aria-orientation="vertical" className="hero-tabs">
            {stories.map((s, i) => (
              <button
                key={s.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`hero-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`hero-slide-${i}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => choose(i)}
                onKeyDown={onTabKey}
                className="hero-tab"
              >
                <span aria-hidden className="hero-tab-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <Kicker label={s.kicker} className="block" />
                  <span className="hero-tab-title">{s.title}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
