"use client";

import Link from "next/link";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { gmpPct, ipoStatus, priceBandLabel, statusOrder, type Ipo } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";
import { StatusPill } from "../ipo/status-pill";

const addDays = (iso: string, d: number) => {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + d);
  return t.toISOString().slice(0, 10);
};

/** Grey market premium with sign and arrow, so direction never rests on colour alone. */
function Gmp({ ipo, withPct = false }: { ipo: Ipo; withPct?: boolean }) {
  if (ipo.gmp === null) return <span className="text-muted">–</span>;
  const dir = ipo.gmp > 0 ? 1 : ipo.gmp < 0 ? -1 : 0;
  const sign = dir > 0 ? "+" : dir < 0 ? "−" : "";
  const pct = withPct ? gmpPct(ipo) : null;
  return (
    <span className={`whitespace-nowrap font-semibold tabular-nums ${dir > 0 ? "text-up" : dir < 0 ? "text-down" : "text-ink"}`}>
      {dir !== 0 ? (
        <span aria-hidden className="mr-1 text-2xs">
          {dir > 0 ? "▲" : "▼"}
        </span>
      ) : null}
      {sign}₹{formatNumber(Math.abs(ipo.gmp))}
      {pct !== null ? ` (${sign}${Math.abs(pct).toFixed(1)}%)` : ""}
    </span>
  );
}

/** IPOs open now, opening in the next 7 days, or listing in the next 7 days. */
export function IpoThisWeek({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const today = useIstToday(buildDate);
  const horizon = addDays(today, 7);
  const items = ipos
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .filter(({ ipo, status }) => status === "open" || (status === "upcoming" && (ipo.dates.open ?? "") <= horizon) || ((status === "allotted" || status === "closed") && (ipo.dates.listing ?? "") <= horizon))
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status));

  return (
    <section aria-labelledby="ipo-week" className="surface-ink flex flex-col px-4 pb-4 pt-1">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2 id="ipo-week" className="kicker text-sm text-ink">
          IPO this week
        </h2>
        <Link prefetch={false} href="/ipo/" className="link-more">
          Dashboard <span className="arrow" aria-hidden>→</span>
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-ink-2">No mainboard issues open or listing in the next seven days.</p>
      ) : (
        <ul>
          {items.map(({ ipo, status }) => (
            <li key={ipo.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-t border-rule py-2.5">
              <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="break-words text-sm font-semibold leading-snug text-ink hover:underline">
                {ipo.name}
              </Link>
              <StatusPill status={status} />
              <p className="text-xs text-muted">
                {status === "allotted" || status === "closed"
                  ? `Lists ${ipo.dates.listing ? formatDayMonth(ipo.dates.listing) : "soon"}`
                  : `${ipo.dates.open ? formatDayMonth(ipo.dates.open) : ""} – ${ipo.dates.close ? formatDayMonth(ipo.dates.close) : ""}`}
                <span aria-hidden className="px-1">
                  ·
                </span>
                <span className="whitespace-nowrap">{priceBandLabel(ipo)}</span>
              </p>
              {ipo.gmp !== null ? (
                <p className="text-right text-xs">
                  <span className="mr-1 text-2xs uppercase tracking-wide text-muted">GMP</span>
                  <Gmp ipo={ipo} withPct />
                </p>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-auto border-t border-rule pt-2 text-2xs text-muted">Includes sample data. GMP is unofficial.</p>
    </section>
  );
}

export function IpoPreviewTable({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const today = useIstToday(buildDate);
  const rows = ipos
    .filter((i) => i.board === "mainboard")
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status) || ((b.ipo.dates.close ?? "") > (a.ipo.dates.close ?? "") ? 1 : -1))
    .slice(0, 6);
  return (
    <div className="table-wrap">
      <table className="data-table min-w-[640px]">
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">Dates</th>
            <th scope="col" className="text-right">
              Price band
            </th>
            <th scope="col" className="text-right">
              GMP
            </th>
            <th scope="col" className="text-right">
              Subscribed
            </th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ ipo, status }) => (
            <tr key={ipo.slug}>
              <td>
                <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="font-semibold text-ink hover:text-ipo hover:underline">
                  {ipo.name}
                </Link>
              </td>
              <td className="whitespace-nowrap">{ipo.dates.open && ipo.dates.close ? `${formatDayMonth(ipo.dates.open)} – ${formatDayMonth(ipo.dates.close)}` : ipo.dates.close ? `Closed ${formatDayMonth(ipo.dates.close)}` : "–"}</td>
              <td className="whitespace-nowrap text-right">{priceBandLabel(ipo)}</td>
              <td className="text-right">
                <Gmp ipo={ipo} />
              </td>
              <td className="text-right">{ipo.subscription?.total != null ? `${ipo.subscription.total.toFixed(2)}x` : "–"}</td>
              <td>
                <StatusPill status={status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
