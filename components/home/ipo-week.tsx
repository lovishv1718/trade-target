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

/** IPOs open now, opening in the next 7 days, or listing in the next 7 days. */
export function IpoThisWeek({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const today = useIstToday(buildDate);
  const horizon = addDays(today, 7);
  const items = ipos
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .filter(({ ipo, status }) => status === "open" || (status === "upcoming" && (ipo.dates.open ?? "") <= horizon) || ((status === "allotted" || status === "closed") && (ipo.dates.listing ?? "") <= horizon))
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status));

  return (
    <section aria-labelledby="ipo-week" className="border-t-[3px] border-ipo bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h2 id="ipo-week" className="headline text-xl">
          IPO this week
        </h2>
        <Link prefetch={false} href="/ipo/" className="text-sm font-semibold text-ipo hover:underline">
          Dashboard →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No mainboard issues open or listing in the next seven days.</p>
      ) : (
        <ul className="mt-1 divide-y divide-rule">
          {items.map(({ ipo, status }) => (
            <li key={ipo.slug} className="py-2.5">
              <div className="flex items-start justify-between gap-2">
                <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="font-semibold leading-snug hover:text-ipo hover:underline">
                  {ipo.name}
                </Link>
                <StatusPill status={status} />
              </div>
              <p className="mt-0.5 text-[0.8rem] text-muted">
                {status === "allotted" || status === "closed"
                  ? `Lists ${ipo.dates.listing ? formatDayMonth(ipo.dates.listing) : "soon"}`
                  : `${ipo.dates.open ? formatDayMonth(ipo.dates.open) : ""} – ${ipo.dates.close ? formatDayMonth(ipo.dates.close) : ""}`}
                {" · "}
                {priceBandLabel(ipo)}
                {ipo.gmp !== null ? (
                  <>
                    {" · GMP "}
                    <span className={ipo.gmp > 0 ? "font-semibold text-up-ink" : ipo.gmp < 0 ? "font-semibold text-down" : ""}>
                      ₹{formatNumber(ipo.gmp)}
                      {gmpPct(ipo) !== null ? ` (${gmpPct(ipo)!.toFixed(1)}%)` : ""}
                    </span>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[0.72rem] text-muted">Includes sample data. GMP is unofficial.</p>
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
      <table className="data-table min-w-[620px]">
        <thead>
          <tr>
            <th>Company</th>
            <th>Dates</th>
            <th>Price band</th>
            <th className="text-right">GMP</th>
            <th className="text-right">Subscribed</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ ipo, status }) => (
            <tr key={ipo.slug}>
              <td>
                <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="font-semibold hover:text-ipo hover:underline">
                  {ipo.name}
                </Link>
              </td>
              <td className="whitespace-nowrap">{ipo.dates.open && ipo.dates.close ? `${formatDayMonth(ipo.dates.open)} – ${formatDayMonth(ipo.dates.close)}` : ipo.dates.close ? `Closed ${formatDayMonth(ipo.dates.close)}` : "–"}</td>
              <td className="whitespace-nowrap">{priceBandLabel(ipo)}</td>
              <td className={`text-right font-semibold ${ipo.gmp && ipo.gmp > 0 ? "text-up-ink" : ipo.gmp && ipo.gmp < 0 ? "text-down" : ""}`}>{ipo.gmp === null ? "–" : `₹${formatNumber(ipo.gmp)}`}</td>
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
