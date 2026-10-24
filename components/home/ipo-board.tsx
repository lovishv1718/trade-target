"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { ipoStatus, priceBandLabel, statusOrder, type Ipo, type IpoStatus } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LABEL: Record<IpoStatus, string> = { open: "Open", upcoming: "Upcoming", closed: "Closed", allotted: "Allotment", listed: "Listed" };

/** An issue with the small picture its row shows, where there is one */
export type BoardIpo = Ipo & { thumb: string | null };

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

/** The price band in mono, its rupee sign in the sans: the mono face has no rupee sign of its own */
function Price({ label }: { label: string }) {
  if (!label.startsWith("₹")) return label;
  return (
    <>
      <span className="hm-rupee">₹</span>
      {label.slice(1)}
    </>
  );
}

/**
 * The front page's IPO desk, laid out as designed: a switch between this week and today, four
 * counts, and the mainboard issues behind them, open first, four to the panel. Status comes from
 * each issue's own dates, worked out in the reader's browser, so the static page never goes stale.
 * `intro` is the section's title block and `aside` the results panel beside the issues.
 */
export function IpoBoard({ ipos, buildDate, intro, aside }: { ipos: BoardIpo[]; buildDate: string; intro: ReactNode; aside: ReactNode }) {
  const today = useIstToday(buildDate);
  const [view, setView] = useState<"week" | "today">("week");
  const monday = weekStart(today);
  const sunday = shift(monday, 6);
  const dates = (ipo: Ipo) => [ipo.dates.open, ipo.dates.close, ipo.dates.allotment, ipo.dates.listing].filter((d): d is string => !!d);

  const all = ipos
    .filter((i) => i.board === "mainboard")
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .filter(({ ipo, status }) =>
      view === "today" ? status === "open" || dates(ipo).includes(today) : status === "open" || dates(ipo).some((d) => d >= monday && d <= sunday),
    )
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
  const rows = all.slice(0, 4);

  const counts = [
    { key: "open", label: "Open now", n: all.filter((r) => r.status === "open").length },
    { key: "upcoming", label: "Upcoming", n: all.filter((r) => r.status === "upcoming").length },
    { key: "allotment", label: "In allotment", n: all.filter((r) => r.status === "closed" || r.status === "allotted").length },
    { key: "listed", label: "Listed", n: all.filter((r) => r.status === "listed").length },
  ];

  return (
    <>
      {intro}
      <div className="hm-seg hm-ipo-seg" role="group" aria-label="Show issues for">
        <button type="button" aria-pressed={view === "week"} onClick={() => setView("week")}>
          Week of {dayMonthYear(monday)} <span aria-hidden>→</span>
        </button>
        <button type="button" aria-pressed={view === "today"} onClick={() => setView("today")}>
          Today
        </button>
      </div>

      <dl className="hm-ipo-counts" aria-live="polite">
        {counts.map((c) => (
          <div key={c.key} className="hm-ipo-cell">
            <dt className="hm-ipo-lab">{c.label}</dt>
            <dd className="hm-ipo-num hm-count" data-s={c.key}>
              {String(c.n).padStart(2, "0")}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="board-heading" className="hm-ipo-board">
        <div className="hm-ipo-head">
          <h3 id="board-heading" className="hm-ipo-hl">
            Mainboard issues
          </h3>
          <Link prefetch={false} href="/ipo/" className="hm-ipo-hlink">
            Full IPO table <span aria-hidden>→</span>
          </Link>
        </div>
        {rows.length ? (
          <ul className="hm-ipo-rows">
            {rows.map(({ ipo, status }) => (
              <li key={ipo.slug}>
                <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="hm-ipo-row group">
                  <span className="hm-ipo-thumb">{ipo.thumb ? <Image src={ipo.thumb} alt="" width={142} height={59} unoptimized /> : null}</span>
                  <span className="hm-ipo-txt">
                    <span className="hm-ipo-name">{ipo.name}</span>
                    <span className="hm-ipo-det">{detail(ipo, status)}</span>
                  </span>
                  <span className="hm-ipo-side">
                    <span className="hm-pill" data-s={status}>
                      {LABEL[status]}
                    </span>
                    <span className="hm-ipo-price">
                      <Price label={priceBandLabel(ipo)} />
                    </span>
                  </span>
                  <svg aria-hidden viewBox="0 0 8 12" className="hm-ipo-chev" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1.5 1l5 5-5 5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hm-ipo-empty">Nothing on the mainboard calendar {view === "today" ? "today" : "this week"}.</p>
        )}
      </section>
      {aside}
      <p className="hm-ipo-note">Issue sizes, price bands and dates as published by TradeTarget · GMP is unofficial and indicative</p>
    </>
  );
}
