"use client";

import Link from "next/link";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { gmpPct, ipoStatus, priceBandLabel, statusOrder, type Ipo } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";
import { GmpCell, gmpScale } from "../ipo/gmp-cell";
import { StatusPill } from "../ipo/status-pill";
import { ChangeChip } from "./change-chip";

const addDays = (iso: string, d: number) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + d);
  return t.toISOString().slice(0, 10);
};

/** IPOs open now, opening in the next 7 days, or listing in the next 7 days: a ticker of whole-row links. */
export function IpoThisWeek({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const today = useIstToday(buildDate);
  const horizon = addDays(today, 7);
  const items = ipos
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .filter(({ ipo, status }) => status === "open" || (status === "upcoming" && (ipo.dates.open ?? "") <= horizon) || ((status === "allotted" || status === "closed") && (ipo.dates.listing ?? "") <= horizon))
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status));

  return (
    <section aria-labelledby="ipo-week" className="surface-ink glass-navy terminal flex flex-col">
      <div className="terminal-head">
        <h2 id="ipo-week" className="terminal-title">
          IPO this week
        </h2>
        <Link prefetch={false} href="/ipo/" className="link-more">
          Dashboard <span className="arrow" aria-hidden>→</span>
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mx-3 my-3 border border-dashed border-rule-strong px-3 py-3 text-sm text-ink-2">No mainboard issues open or listing in the next seven days.</p>
      ) : (
        <ul>
          {items.map(({ ipo, status }) => {
            const pct = gmpPct(ipo);
            return (
              <li key={ipo.slug}>
                <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="tick" data-live={status === "open" || undefined}>
                  <span className="tick-name">{ipo.name}</span>
                  <StatusPill status={status} />
                  <span className="text-xs text-muted">
                    {status === "allotted" || status === "closed"
                      ? `Lists ${ipo.dates.listing ? formatDayMonth(ipo.dates.listing) : "soon"}`
                      : `${ipo.dates.open ? formatDayMonth(ipo.dates.open) : ""} – ${ipo.dates.close ? formatDayMonth(ipo.dates.close) : ""}`}
                    <span aria-hidden className="px-1">
                      ·
                    </span>
                    <span className="whitespace-nowrap">{priceBandLabel(ipo)}</span>
                  </span>
                  {ipo.gmp !== null ? (
                    <span className="flex items-center justify-end gap-1.5">
                      <span className="text-2xs font-semibold uppercase tracking-caps text-muted">GMP</span>
                      <ChangeChip value={ipo.gmp} pct={pct !== null ? `${Math.abs(pct).toFixed(1)}%` : "–"} abs={`₹${formatNumber(Math.abs(ipo.gmp))}`} />
                    </span>
                  ) : (
                    <span />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="terminal-foot mt-auto">Includes sample data. GMP is unofficial.</p>
    </section>
  );
}

export function IpoPreviewTable({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const today = useIstToday(buildDate);
  const mainboard = ipos.filter((i) => i.board === "mainboard");
  const scale = gmpScale(mainboard);
  const rows = mainboard
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status) || ((b.ipo.dates.close ?? "") > (a.ipo.dates.close ?? "") ? 1 : -1))
    .slice(0, 6);
  return (
    <>
      <p className="scroll-hint mb-2">Swipe sideways for every column</p>
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Mainboard IPOs">
        <table className="data-table dx-rows min-w-[720px]">
          <thead>
            <tr>
              <th scope="col" className="sticky-col">
                Company
              </th>
              <th scope="col">Dates</th>
              <th scope="col" className="num">
                Price band
              </th>
              <th scope="col" className="num">
                GMP
              </th>
              <th scope="col" className="num">
                Subscribed
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ ipo, status }) => (
              <tr key={ipo.slug} data-live={status === "open" || undefined}>
                <th scope="row" className="sticky-col min-w-36 sm:min-w-48">
                  <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="link-quiet">
                    {ipo.name}
                  </Link>
                </th>
                <td className="whitespace-nowrap">{ipo.dates.open && ipo.dates.close ? `${formatDayMonth(ipo.dates.open)} – ${formatDayMonth(ipo.dates.close)}` : ipo.dates.close ? `Closed ${formatDayMonth(ipo.dates.close)}` : "–"}</td>
                <td className="num">{priceBandLabel(ipo)}</td>
                <td className="num">
                  <GmpCell ipo={ipo} scale={scale} />
                </td>
                <td className="num">{ipo.subscription?.total != null ? `${ipo.subscription.total.toFixed(2)}x` : "–"}</td>
                <td>
                  <StatusPill status={status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
