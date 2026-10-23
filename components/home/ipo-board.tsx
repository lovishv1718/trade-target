"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { ipoStatus, priceBandLabel, statusOrder, type Ipo, type IpoStatus } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LABEL: Record<IpoStatus, string> = { open: "Open", upcoming: "Upcoming", closed: "Closed", allotted: "Allotment", listed: "Listed" };

const shift = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
/** Monday of the IST week that holds `iso` */
const weekStart = (iso: string) => shift(iso, -((new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7));
const dayMonthYear = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/** The line under an issue's name: what happens next, with the issue size where it is known */
function detail(ipo: Ipo, status: IpoStatus) {
  const { open, close, allotment, listing } = ipo.dates;
  const size = ipo.issueSizeCr ? ` · ₹${formatNumber(ipo.issueSizeCr, ipo.issueSizeCr % 1 ? 2 : 0)} Cr` : "";
  if (status === "open" && close) return `Closes ${formatDayMonth(close)}${size}`;
  if (status === "upcoming" && open) return `Opens ${formatDayMonth(open)}${size}`;
  if ((status === "closed" || status === "allotted") && allotment) return `Allotment ${formatDayMonth(allotment)}${listing ? ` · Lists ${formatDayMonth(listing)}` : ""}`;
  if (status === "listed" && listing) return `Listed ${dayMonthYear(listing)}`;
  return ipo.sector;
}

/**
 * The front page's IPO desk: a switch between this week and today, four counts, and the mainboard
 * issues behind them, open first. Status comes from each issue's own dates, worked out in the
 * reader's browser, so the static page never goes stale. `intro` is the section's title block and
 * `aside` the results panel beside the issues.
 */
export function IpoBoard({ ipos, buildDate, intro, aside }: { ipos: Ipo[]; buildDate: string; intro: ReactNode; aside: ReactNode }) {
  const today = useIstToday(buildDate);
  const [view, setView] = useState<"week" | "today">("week");
  const monday = weekStart(today);
  const sunday = shift(monday, 6);
  const dates = (ipo: Ipo) => [ipo.dates.open, ipo.dates.close, ipo.dates.allotment, ipo.dates.listing].filter((d): d is string => !!d);

  const rows = ipos
    .filter((i) => i.board === "mainboard")
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .filter(({ ipo, status }) =>
      view === "today" ? status === "open" || dates(ipo).includes(today) : status === "open" || dates(ipo).some((d) => d >= monday && d <= sunday),
    )
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status))
    .slice(0, 5);

  const counts = [
    { key: "open", label: "Open now", n: rows.filter((r) => r.status === "open").length },
    { key: "upcoming", label: "Upcoming", n: rows.filter((r) => r.status === "upcoming").length },
    { key: "allotment", label: "In allotment", n: rows.filter((r) => r.status === "closed" || r.status === "allotted").length },
    { key: "listed", label: "Listed", n: rows.filter((r) => r.status === "listed").length },
  ];

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        {intro}
        <div className="hm-seg" role="group" aria-label="Show issues for">
          <button type="button" aria-pressed={view === "week"} onClick={() => setView("week")}>
            Week of {dayMonthYear(monday)} <span aria-hidden>→</span>
          </button>
          <button type="button" aria-pressed={view === "today"} onClick={() => setView("today")}>
            Today
          </button>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 border border-rule bg-white md:grid-cols-4" aria-live="polite">
        {counts.map((c, i) => (
          <div key={c.key} className={`px-6 py-6 md:px-10 ${i % 2 ? "border-l border-rule" : ""} ${i > 1 ? "border-t border-rule md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}>
            <dt className="hm-label text-ink">{c.label}</dt>
            <dd className="hm-count pm-figure mt-2 text-5xl md:text-6xl" data-s={c.key}>
              {String(c.n).padStart(2, "0")}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)]">
        <section aria-labelledby="board-heading" className="border border-rule bg-white px-6 pb-2 pt-6 md:px-9">
          <div className="flex items-center justify-between gap-4 border-b border-rule pb-5">
            <h3 id="board-heading" className="hm-label font-medium text-ink">
              Mainboard issues
            </h3>
            <Link prefetch={false} href="/ipo/" className="hm-label hover:text-accent">
              Full IPO table <span aria-hidden>→</span>
            </Link>
          </div>
          {rows.length ? (
            <ul>
              {rows.map(({ ipo, status }) => (
                <li key={ipo.slug} className="border-b border-rule last:border-b-0">
                  <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-4">
                    <span className="font-serif text-xl leading-snug tracking-[-0.01em] text-ink group-hover:text-accent md:text-[1.375rem]">{ipo.name}</span>
                    <span className="hm-pill justify-self-end" data-s={status}>
                      {LABEL[status]}
                    </span>
                    <span className="text-sm text-muted md:text-[0.9375rem]">{detail(ipo, status)}</span>
                    <span className="justify-self-end font-mono text-sm text-ink-2 md:text-[0.9375rem]">{priceBandLabel(ipo)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-muted">Nothing on the mainboard calendar {view === "today" ? "today" : "this week"}.</p>
          )}
        </section>
        {aside}
      </div>
      <p className="hm-label mt-6 text-[0.6875rem]">Issue sizes, price bands and dates as published by TradeTarget · GMP is unofficial and indicative</p>
    </>
  );
}
