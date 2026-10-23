"use client";

import Link from "next/link";
import { formatDayMonth } from "@/lib/format";
import { ipoStatus, priceBandLabel, statusOrder, summarise, type Ipo } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";
import { StatusPill } from "../ipo/status-pill";

/**
 * The front page's IPO desk: three counts and the five mainboard issues that matter most today,
 * open first. Status is worked out from each issue's dates in the reader's browser, so the
 * static page never goes stale.
 */
export function IpoDesk({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const today = useIstToday(buildDate);
  const s = summarise(ipos, today);
  const rows = ipos
    .filter((i) => i.board === "mainboard")
    .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status) || ((b.ipo.dates.close ?? "") > (a.ipo.dates.close ?? "") ? 1 : -1))
    .slice(0, 5);
  const counts = [
    { label: "Open now", value: s.open },
    { label: "Upcoming", value: s.upcoming },
    { label: `Listed in ${today.slice(0, 4)}`, value: s.listedThisYear },
  ];
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <div className="grid content-start gap-8">
        <dl className="grid grid-cols-3 border-y border-rule lg:grid-cols-1 lg:border-y-0">
          {counts.map((c, i) => (
            <div key={c.label} className={`py-5 ${i ? "border-l border-rule pl-5 lg:border-l-0 lg:border-t lg:pl-0" : "lg:border-t lg:border-rule"} lg:py-6`}>
              <dt className="pm-meta">{c.label}</dt>
              <dd className="pm-figure mt-2 text-4xl md:text-5xl">{String(c.value).padStart(2, "0")}</dd>
            </div>
          ))}
        </dl>
        <Link prefetch={false} href="/ipo/" className="btn justify-self-start">
          Open the IPO dashboard <span className="pm-arrow" aria-hidden>→</span>
        </Link>
      </div>
      <div>
        <ul className="border-t border-rule">
          {rows.map(({ ipo, status }) => (
            <li key={ipo.slug} className="border-b border-rule">
              <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-5 sm:grid-cols-[minmax(0,1fr)_9rem_8rem_7.5rem]">
                <span className="font-serif text-lg font-bold leading-snug tracking-tight text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{ipo.name}</span>
                <span className="pm-meta col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto">
                  {ipo.dates.open && ipo.dates.close ? `${formatDayMonth(ipo.dates.open)} – ${formatDayMonth(ipo.dates.close)}` : ipo.dates.close ? `Closed ${formatDayMonth(ipo.dates.close)}` : "Dates to come"}
                </span>
                <span className="hidden text-right font-mono text-sm text-ink-2 sm:block">{priceBandLabel(ipo)}</span>
                <span className="row-span-2 justify-self-end sm:row-span-1">
                  <StatusPill status={status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">Some issues use sample figures in this preview. GMP is unofficial and indicative.</p>
      </div>
    </div>
  );
}
