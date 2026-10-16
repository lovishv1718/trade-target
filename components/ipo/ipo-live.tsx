"use client";

import { formatDate, formatDayMonth, formatNumber } from "@/lib/format";
import { gmpPct, ipoStatus, TIMELINE_STEPS, upperPrice, type Ipo, type IpoStatus } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";
import { StatusPill } from "./status-pill";

/** One line saying where the issue stands today, built from its dates. */
function stateLine(ipo: Ipo, status: IpoStatus): string {
  const { open, close, allotment, listing } = ipo.dates;
  switch (status) {
    case "upcoming":
      return open ? `Opens for bidding ${formatDayMonth(open)}` : "Dates not yet announced";
    case "open":
      return close ? `Bidding open, closes ${formatDayMonth(close)}` : "Bidding open";
    case "closed":
      return allotment ? `Bidding closed, allotment ${formatDayMonth(allotment)}` : "Bidding closed";
    case "allotted":
      return listing ? `Allotment out, lists ${formatDayMonth(listing)}` : "Allotment out";
    case "listed":
      return listing ? `Listed ${formatDate(listing)}` : "Listed";
  }
}

/** Status tag that reflects today's date in the browser. `detail` adds a one-line state. */
export function LiveStatus({ ipo, buildDate, detail = false }: { ipo: Ipo; buildDate: string; detail?: boolean }) {
  const today = useIstToday(buildDate);
  const status = ipoStatus(ipo, today);
  if (!detail) return <StatusPill status={status} />;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <StatusPill status={status} />
      <span className="text-sm font-semibold text-ink tabular">{stateLine(ipo, status)}</span>
    </span>
  );
}

const STEP_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-3 md:grid-cols-5",
  6: "sm:grid-cols-3 md:grid-cols-6",
};

export function IpoTimeline({ ipo, buildDate }: { ipo: Ipo; buildDate: string }) {
  const today = useIstToday(buildDate);
  const steps = TIMELINE_STEPS.filter((s) => ipo.dates[s.key]);
  const nextIndex = steps.findIndex((s) => (ipo.dates[s.key] as string) > today);
  return (
    <ol className={`grid border-b border-rule sm:gap-x-px sm:gap-y-4 sm:border-b-0 ${STEP_COLS[steps.length] ?? "sm:grid-cols-3"}`}>
      {steps.map((s, i) => {
        const date = ipo.dates[s.key] as string;
        const isToday = date === today;
        const done = date < today;
        const next = i === nextIndex;
        const marker = isToday ? "Today" : next ? "Next" : done ? "Done" : "";
        const bar = isToday || next ? "sm:border-t-ipo" : done ? "sm:border-t-ink" : "sm:border-t-rule";
        return (
          <li
            key={s.key}
            aria-current={isToday || (next && !steps.some((x) => ipo.dates[x.key] === today)) ? "step" : undefined}
            className={`flex items-baseline justify-between gap-3 border-t border-rule py-2.5 sm:block sm:border-t-3 sm:pb-3 sm:pt-2 sm:pr-3 ${bar} ${isToday || next ? "border-l-3 border-l-ipo pl-3 sm:border-l-0 sm:pl-0" : ""}`}
          >
            <p className={`text-xs font-semibold ${isToday || next ? "text-ipo" : done ? "text-ink" : "text-muted"}`}>{s.label}</p>
            <p className="flex items-baseline gap-2 sm:mt-0.5 sm:block">
              <time dateTime={date} className={`text-base font-semibold tabular sm:text-lg ${done || isToday || next ? "text-ink" : "text-ink-2"}`}>
                {formatDayMonth(date)}
              </time>
              <span className={`block min-w-10 text-right text-2xs font-bold uppercase tracking-caps sm:min-w-0 sm:text-left ${isToday || next ? "text-ipo" : "text-muted"}`}>
                {marker || <span aria-hidden>&nbsp;</span>}
              </span>
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function AtAGlance({ ipo, buildDate }: { ipo: Ipo; buildDate: string }) {
  const today = useIstToday(buildDate);
  const status = ipoStatus(ipo, today);
  const up = upperPrice(ipo);
  const pct = gmpPct(ipo);
  const est = up !== null && ipo.gmp !== null ? up + ipo.gmp : null;
  const rows: [string, string][] = [
    ["Price band", ipo.priceBand[0] && ipo.priceBand[1] ? `₹${formatNumber(ipo.priceBand[0])} – ₹${formatNumber(ipo.priceBand[1])}` : up ? `Up to ₹${formatNumber(up)}` : "–"],
    ["Lot size", ipo.lotSize ? `${formatNumber(ipo.lotSize)} shares` : "–"],
    ["Issue size", ipo.issueSizeCr ? `₹${formatNumber(ipo.issueSizeCr, ipo.issueSizeCr % 1 ? 2 : 0)} crore` : "–"],
    ["Opens", ipo.dates.open ? formatDate(ipo.dates.open) : "–"],
    ["Closes", ipo.dates.close ? formatDate(ipo.dates.close) : "–"],
    ["Listing", ipo.dates.listing ? formatDate(ipo.dates.listing) : "–"],
  ];
  const gmpTone = ipo.gmp === null ? "text-ink" : ipo.gmp > 0 ? "text-up" : ipo.gmp < 0 ? "text-down" : "text-ink";
  return (
    <div className="border border-rule border-t-3 border-t-ipo bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="kicker text-ipo">At a glance</p>
        <StatusPill status={status} />
      </div>
      <p className="mt-2 text-sm font-semibold text-ink tabular">{stateLine(ipo, status)}</p>
      <div className="mt-4 grid grid-cols-2 gap-4 border-y border-rule py-4">
        <div>
          <p className="text-xs font-semibold text-muted">GMP</p>
          <p className={`mt-0.5 text-2xl font-semibold leading-tight tabular ${gmpTone}`}>
            {ipo.gmp === null ? "–" : `${ipo.gmp > 0 ? "+" : ipo.gmp < 0 ? "−" : ""}₹${formatNumber(Math.abs(ipo.gmp))}`}
          </p>
          {pct !== null ? <p className="mt-0.5 text-xs text-muted tabular">{pct.toFixed(1)}% of upper band</p> : null}
        </div>
        <div>
          <p className="text-xs font-semibold text-muted">Est. listing</p>
          <p className="mt-0.5 text-2xl font-semibold leading-tight text-ink tabular">{est !== null ? `₹${formatNumber(est)}` : "–"}</p>
          <p className="mt-0.5 text-xs text-muted">Upper band + GMP</p>
        </div>
      </div>
      <dl className="mt-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-rule py-2 last:border-b-0">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-semibold text-ink tabular">{v}</dd>
          </div>
        ))}
      </dl>
      {status === "allotted" || status === "closed" ? (
        <div className="mt-3 border-t border-ink pt-3 text-sm">
          <p className="font-semibold text-ink">Check allotment</p>
          <ul className="mt-1.5 space-y-1.5">
            <li>
              <a href="https://www.bseindia.com/investors/appli_check.aspx" target="_blank" rel="noopener noreferrer" className="link">
                BSE allotment status<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li className="text-muted">Registrar: {ipo.registrar}</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
