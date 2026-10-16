"use client";

import { formatDate, formatDayMonth, formatNumber } from "@/lib/format";
import { gmpPct, ipoStatus, TIMELINE_STEPS, upperPrice, type Ipo } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";
import { StatusPill } from "./status-pill";

/** Status pill that reflects today's date in the browser. */
export function LiveStatus({ ipo, buildDate }: { ipo: Ipo; buildDate: string }) {
  const today = useIstToday(buildDate);
  return <StatusPill status={ipoStatus(ipo, today)} />;
}

export function IpoTimeline({ ipo, buildDate }: { ipo: Ipo; buildDate: string }) {
  const today = useIstToday(buildDate);
  const steps = TIMELINE_STEPS.filter((s) => ipo.dates[s.key]);
  const nextIndex = steps.findIndex((s) => (ipo.dates[s.key] as string) > today);
  return (
    <ol className="grid gap-0 sm:grid-cols-6">
      {steps.map((s, i) => {
        const date = ipo.dates[s.key] as string;
        const done = date <= today;
        const current = i === nextIndex;
        return (
          <li key={s.key} className="relative flex gap-3 pb-5 sm:block sm:pb-0 sm:pr-2">
            {/* connector */}
            <span aria-hidden className={`absolute left-[7px] top-4 h-full w-[2px] sm:left-4 sm:top-[7px] sm:h-[2px] sm:w-full ${i === steps.length - 1 ? "hidden" : ""} ${done ? "bg-navy" : "bg-rule"}`} />
            <span
              aria-hidden
              className={`relative z-[1] mt-0.5 block h-4 w-4 shrink-0 border-2 ${done ? "border-navy bg-navy" : current ? "border-accent bg-white" : "border-rule bg-white"}`}
            />
            <div className="sm:mt-3">
              <p className={`text-[0.82rem] font-semibold ${current ? "text-accent-ink" : done ? "text-ink" : "text-muted"}`}>{s.label}</p>
              <p className="text-[0.95rem] font-semibold tabular">{formatDayMonth(date)}</p>
              {current ? <p className="text-xs text-accent-ink">Next</p> : null}
            </div>
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
  return (
    <div className="border-t-[3px] border-ipo bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="kicker text-ipo">At a glance</p>
        <StatusPill status={status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-b border-rule pb-4">
        <div>
          <p className="text-xs font-semibold text-muted">GMP</p>
          <p className={`headline text-2xl tabular ${ipo.gmp === null ? "" : ipo.gmp > 0 ? "text-up-ink" : ipo.gmp < 0 ? "text-down" : ""}`}>
            {ipo.gmp === null ? "–" : `${ipo.gmp < 0 ? "−" : ""}₹${formatNumber(Math.abs(ipo.gmp))}`}
          </p>
          {pct !== null ? <p className="text-xs text-muted">{pct.toFixed(1)}% of upper band</p> : null}
        </div>
        <div>
          <p className="text-xs font-semibold text-muted">Est. listing</p>
          <p className="headline text-2xl tabular">{est !== null ? `₹${formatNumber(est)}` : "–"}</p>
          <p className="text-xs text-muted">Upper band + GMP</p>
        </div>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-semibold tabular">{v}</dd>
          </div>
        ))}
      </dl>
      {status === "allotted" || status === "closed" ? (
        <div className="mt-4 border-t border-rule pt-3 text-sm">
          <p className="font-semibold">Check allotment</p>
          <ul className="mt-1.5 space-y-1">
            <li>
              <a href="https://www.bseindia.com/investors/appli_check.aspx" target="_blank" rel="noopener noreferrer" className="text-ipo underline">
                BSE allotment status
              </a>
            </li>
            <li className="text-muted">Registrar: {ipo.registrar}</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
