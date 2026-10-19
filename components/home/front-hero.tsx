"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import markets from "@/content/markets.json";
import type { ArticleCard } from "@/lib/content";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { ipoStatus, type Ipo } from "@/lib/ipo";
import { istDateLong, marketSession, sampleSeries } from "@/lib/market";
import { useIstToday } from "@/lib/use-ist-today";
import { useNow } from "@/lib/use-now";
import { Illustration, artFor } from "../illustrations";
import { Kicker } from "../kicker";
import { photoCredit } from "../photo";
import { AreaSpark } from "../spark";
import { authorName } from "../story";

const SIZES = "(min-width: 1280px) 620px, (min-width: 1024px) 700px, (min-width: 768px) 460px, 100vw";

/** A rounded gradient tile holding a white glyph, for the glance cards */
function GlyphTile({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(145deg,#4b93ff,#1453db)] text-white shadow-[0_10px_18px_-8px_rgb(31_107_255/0.8),inset_0_1px_0_rgb(255_255_255/0.35)]">
      {children}
    </span>
  );
}

/** One benchmark as a glance card: name, level and move, with the session's line */
function IndexCard({ id, name, value, change, pct }: { id: string; name: string; value: number; change: number; pct: number }) {
  const up = change >= 0;
  return (
    <div className="glance-card">
      <div className="min-w-0">
        <dt>{name}</dt>
        <dd className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-lg font-bold text-ink">{formatNumber(value, 2)}</span>
          <span className={`text-sm font-bold ${up ? "text-up" : "text-down"}`}>
            <span aria-hidden className="mr-0.5 text-2xs">
              {up ? "▲" : "▼"}
            </span>
            {up ? "+" : "−"}
            {Math.abs(pct).toFixed(2)}%
          </span>
        </dd>
      </div>
      <span className={`ml-auto hidden shrink-0 sm:block ${up ? "text-up" : "text-down"}`}>
        <AreaSpark values={sampleSeries(id, value - change, value)} id={`glance-${id}`} width={56} height={34} className="h-9 w-14" />
      </span>
    </div>
  );
}

/**
 * The row of glance cards across the top of the front page: the date and market state, the two
 * benchmark indices and what is open in IPO today, all from data already on the page. Never animated.
 */
export function Glance({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const now = useNow();
  const today = useIstToday(buildDate);
  const session = now ? marketSession(now) : null;
  const state = session ? (session.open ? "open" : session.label === "Pre-open session" ? "pre" : "closed") : null;
  const open = ipos.filter((i) => ipoStatus(i, today) === "open");
  const next = ipos
    .filter((i) => ipoStatus(i, today) === "upcoming" && i.dates.open)
    .sort((a, b) => (a.dates.open! < b.dates.open! ? -1 : 1))[0];
  const ipo = open[0] ?? next;
  const [nifty, sensex] = markets.board;
  return (
    <dl className="glance" aria-label="At a glance">
      <div className="glance-card max-md:col-span-2">
        <GlyphTile>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <rect x="2.5" y="4" width="15" height="13.5" rx="3" />
            <path d="M2.5 8.5h15M6.5 2v4M13.5 2v4" />
            <circle cx="7" cy="12.5" r="0.6" fill="currentColor" />
            <circle cx="10" cy="12.5" r="0.6" fill="currentColor" />
            <circle cx="13" cy="12.5" r="0.6" fill="currentColor" />
          </svg>
        </GlyphTile>
        <div className="min-w-0">
          <dt className="glance-date" suppressHydrationWarning>
            {now ? istDateLong(now) : "Today"}
          </dt>
          <dd className="mt-1.5">
            {state ? (
              <span className="mkt-state" data-state={state}>
                <span aria-hidden className="mkt-dot" />
                {session!.label}
              </span>
            ) : (
              <span aria-hidden className="inline-block h-[1.625rem] w-28" />
            )}
          </dd>
        </div>
      </div>
      <IndexCard id={nifty.id} name={nifty.name} value={nifty.value} change={nifty.change} pct={nifty.changePct} />
      <IndexCard id={sensex.id} name={sensex.name} value={sensex.value} change={sensex.change} pct={sensex.changePct} />
      <div className="glance-card max-md:col-span-2">
        <GlyphTile>
          <svg width="22" height="20" viewBox="0 0 22 20" fill="currentColor">
            <path d="M15.5 2.2a1 1 0 0 1 1.5.86v13.88a1 1 0 0 1-1.5.86L9.6 14.4H6a3 3 0 0 1-3-3V8.6a3 3 0 0 1 3-3h3.6z" />
            <path d="M6.2 15.2h3l1.1 3.1a1 1 0 0 1-.94 1.34H8.1a1 1 0 0 1-.93-.64z" />
            <path d="M18.8 7.3a3.4 3.4 0 0 1 0 5.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </GlyphTile>
        <div className="min-w-0 flex-1">
          <dt>{open.length ? "IPO open today" : "IPO opening next"}</dt>
          <dd className="mt-1 truncate text-base font-bold">
            {ipo ? (
              <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="link-quiet text-ipo after:absolute after:inset-0 after:rounded-[inherit]">
                {ipo.name}
                {open.length > 1 ? <span className="font-normal text-muted"> +{open.length - 1} more</span> : null}
                {!open.length && next ? <span className="font-normal text-muted">, {formatDayMonth(next.dates.open!)}</span> : null}
              </Link>
            ) : (
              <span className="font-normal text-muted">No issue this week</span>
            )}
          </dd>
        </div>
        {ipo ? (
          <svg aria-hidden width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ipo">
            <path d="M2 2l6 6-6 6" />
          </svg>
        ) : null}
      </div>
    </dl>
  );
}

/** The lead as a photograph with its headline on a frosted plate, caption and byline beside it */
function HeroCard({ story, priority }: { story: ArticleCard; priority: boolean }) {
  const caption = story.image?.caption && story.image.caption !== story.title ? story.image.caption : "";
  return (
    <article className="hero-card group">
      <Link prefetch={false} href={story.path} tabIndex={-1} aria-hidden className="hero-photo">
        {story.image ? <Image src={story.image.src} alt="" fill sizes={SIZES} priority={priority} className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]" /> : null}
      </Link>
      <div className="hero-copy">
        <Kicker label={story.kicker} pill className="hero-kicker" />
        <Link prefetch={false} href={story.path} className="block">
          <h2 className="hero-title headline text-balance">{story.title}</h2>
        </Link>
        <p className="hero-deck deck">{story.standfirst}</p>
      </div>
      <div className="hero-aside">
        {caption ? <p className="text-sm leading-snug text-white">{caption}</p> : null}
        {story.image ? <p className="mt-2 text-2xs font-semibold uppercase leading-snug tracking-[0.06em] text-white/70">{photoCredit(story.image)}</p> : null}
        <p className="mt-4 text-2xs font-semibold uppercase tracking-[0.08em] text-white/70">By</p>
        <p className="text-sm font-bold text-white">{authorName(story.author)}</p>
      </div>
    </article>
  );
}

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg aria-hidden width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "next" ? "M2 2l6 6-6 6" : "M8 2L2 8l6 6"} />
    </svg>
  );
}

/**
 * The front page block: the lead photograph and a numbered list of the top stories
 * that switches the lead. Never rotates by itself. Tabs take arrow keys, the picture takes a swipe,
 * and desktop has arrows. Slides are stacked in one grid cell so the block keeps the height of its
 * tallest story and nothing below it moves when the lead changes.
 */
export function FrontHero({ stories }: { stories: ArticleCard[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const n = stories.length;

  const go = (i: number, focus = false) => {
    const next = (i + n) % n;
    setActive(next);
    if (focus) tabs.current[next]?.focus({ preventScroll: true });
  };

  // Beside the lead the list is as tall as the picture and scrolls inside itself: keep the chosen
  // story in view there, without moving the page
  useEffect(() => {
    const box = list.current;
    const tab = tabs.current[active];
    if (!box || !tab || box.scrollHeight <= box.clientHeight) return;
    const top = tab.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const bottom = top + tab.offsetHeight;
    if (top >= box.scrollTop && bottom <= box.scrollTop + box.clientHeight) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: top < box.scrollTop ? top : bottom - box.clientHeight, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: n - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key], true);
  };

  // On a phone the list sits below the lead: bring the lead back into view when a story is chosen
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
      <div className="hero-grid">
        <div ref={stage} className="hero-stage scroll-mt-20" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
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
              <HeroCard story={s} priority={i === 0} />
            </div>
          ))}
          {/* Pointer conveniences over the picture; the labelled controls are in the list header */}
          <div aria-hidden className="hero-dots">
            {stories.map((s, i) => (
              <span key={s.slug} data-active={i === active || undefined} />
            ))}
          </div>
          <button type="button" tabIndex={-1} aria-hidden onClick={() => go(active + 1)} className="hero-next">
            <Arrow dir="next" />
          </button>
        </div>
        <div className="hero-index glass">
          <div className="hero-index-head">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-ink">Top stories</p>
            <p className="tabular text-sm text-muted" aria-live="polite">
              <span className="font-bold text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary btn-icon btn-round" aria-controls={`hero-slide-${active}`} aria-label="Previous story" onClick={() => go(active - 1)}>
                <Arrow dir="prev" />
              </button>
              <button type="button" className="btn btn-secondary btn-icon btn-round" aria-controls={`hero-slide-${active}`} aria-label="Next story" onClick={() => go(active + 1)}>
                <Arrow dir="next" />
              </button>
            </div>
          </div>
          <div ref={list} role="tablist" aria-label="Top stories" aria-orientation="vertical" className="hero-tabs">
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
                <Illustration art={artFor(s.kicker)} id={`tab-${i}`} className="hero-tab-art" />
                <span className="min-w-0">
                  <Kicker label={s.kicker} pill />
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
