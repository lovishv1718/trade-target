"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatDayMonth, formatNumber } from "@/lib/format";
import { gmpPct, ipoStatus, listingGainPct, priceBandLabel, statusOrder, summarise, type Ipo, type IpoStatus } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";
import { StatusPill } from "./status-pill";

const FILTERS: { key: "all" | IpoStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "upcoming", label: "Upcoming" },
  { key: "closed", label: "Closed" },
  { key: "allotted", label: "Allotment out" },
  { key: "listed", label: "Listed" },
];

function Signed({ value, suffix = "", prefix = "" }: { value: number | null; suffix?: string; prefix?: string }) {
  if (value === null) return <span className="text-muted">–</span>;
  const cls = value > 0 ? "text-up-ink" : value < 0 ? "text-down" : "text-muted";
  return (
    <span className={`font-semibold ${cls}`}>
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {prefix}
      {formatNumber(Math.abs(value), suffix === "%" ? 1 : 0)}
      {suffix}
    </span>
  );
}

function dateRange(ipo: Ipo) {
  const { open, close } = ipo.dates;
  if (open && close) return `${formatDayMonth(open)} – ${formatDayMonth(close)}`;
  if (close) return `Closed ${formatDayMonth(close)}`;
  return "–";
}

export function IpoDashboard({ ipos, buildDate }: { ipos: Ipo[]; buildDate: string }) {
  const params = useSearchParams();
  const [board, setBoard] = useState<"mainboard" | "sme">(params.get("board") === "sme" ? "sme" : "mainboard");
  const [filter, setFilter] = useState<"all" | IpoStatus>("all");
  const today = useIstToday(buildDate);

  const boardIpos = useMemo(() => ipos.filter((i) => i.board === board), [ipos, board]);
  const rows = useMemo(
    () =>
      boardIpos
        .map((ipo) => ({ ipo, status: ipoStatus(ipo, today) }))
        .filter((r) => filter === "all" || r.status === filter)
        .sort((a, b) => statusOrder(a.status) - statusOrder(b.status) || ((b.ipo.dates.close ?? "") > (a.ipo.dates.close ?? "") ? 1 : -1)),
    [boardIpos, today, filter],
  );
  const summary = summarise(boardIpos, today);
  const year = today.slice(0, 4);
  const withBrokers = boardIpos.filter((i) => i.brokers);

  const cards = [
    { label: `Listed in ${year}`, value: summary.listedThisYear, tone: "border-navy" },
    { label: "Open now", value: summary.open, tone: "border-ipo" },
    { label: "Upcoming", value: summary.upcoming, tone: "border-gold" },
    { label: "Gained on listing", value: summary.gained, tone: "border-up", valueClass: "text-up-ink" },
    { label: "Fell on listing", value: summary.fell, tone: "border-down", valueClass: "text-down" },
  ];

  return (
    <div>
      <div role="tablist" aria-label="IPO board" className="flex border-b border-rule">
        {(["mainboard", "sme"] as const).map((b) => (
          <button
            key={b}
            role="tab"
            type="button"
            aria-selected={board === b}
            onClick={() => {
              setBoard(b);
              setFilter("all");
              window.history.replaceState(null, "", b === "sme" ? "?board=sme" : window.location.pathname);
            }}
            className={`-mb-px border-b-[3px] px-4 py-2.5 text-[1rem] font-semibold ${board === b ? "border-ipo text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {b === "mainboard" ? "Mainboard" : "SME"}
            <span className="ml-1.5 text-sm font-normal text-muted">({ipos.filter((i) => i.board === b).length})</span>
          </button>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className={`border-t-[3px] bg-white px-4 py-3.5 ${c.tone}`}>
            <dt className="text-[0.82rem] font-semibold text-muted">{c.label}</dt>
            <dd className={`headline mt-1 text-[2rem] leading-none tabular ${c.valueClass ?? ""}`}>{c.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
        <span className="mr-1 text-sm font-semibold text-muted">Status</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`border px-3 py-1.5 text-sm font-semibold ${filter === f.key ? "border-navy bg-navy text-white" : "border-rule bg-white text-ink hover:border-navy/50"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-wrap mt-4">
        <table className="data-table min-w-[960px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-navy">Company</th>
              <th>Dates</th>
              <th>Price band</th>
              <th className="text-right">Lot size</th>
              <th className="text-right">GMP</th>
              <th className="text-right">Subscription</th>
              <th>Listing</th>
              <th className="text-right">Listing gain</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted">
                  No {board === "sme" ? "SME" : "mainboard"} IPOs match this status{filter === "open" || filter === "upcoming" ? " this week" : ""}.
                </td>
              </tr>
            ) : (
              rows.map(({ ipo, status }) => (
                <tr key={ipo.slug}>
                  <td className="sticky left-0 z-[1] bg-inherit">
                    <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="font-semibold text-ink hover:text-ipo hover:underline">
                      {ipo.name}
                    </Link>
                    <span className="block text-xs text-muted">
                      {ipo.sector}
                      {ipo.sample ? <span className="ml-1.5 border border-gold/70 px-1 text-[0.65rem] font-bold uppercase text-[#7a5300]">Sample</span> : null}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">{dateRange(ipo)}</td>
                  <td className="whitespace-nowrap">{priceBandLabel(ipo)}</td>
                  <td className="text-right">{ipo.lotSize ? formatNumber(ipo.lotSize) : "–"}</td>
                  <td className="whitespace-nowrap text-right">
                    {ipo.gmp === null ? (
                      <span className="text-muted">–</span>
                    ) : (
                      <>
                        <Signed value={ipo.gmp} prefix="₹" />
                        <span className="block text-xs text-muted">{gmpPct(ipo) !== null ? `${gmpPct(ipo)!.toFixed(1)}%` : ""}</span>
                      </>
                    )}
                  </td>
                  <td className="text-right">{ipo.subscription?.total != null ? `${ipo.subscription.total.toFixed(2)}x` : <span className="text-muted">–</span>}</td>
                  <td className="whitespace-nowrap">{ipo.dates.listing ? formatDayMonth(ipo.dates.listing) + (ipo.dates.listing.slice(0, 4) !== year ? ` ${ipo.dates.listing.slice(0, 4)}` : "") : "–"}</td>
                  <td className="text-right">
                    <Signed value={listingGainPct(ipo)} suffix="%" />
                  </td>
                  <td>
                    <StatusPill status={status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        GMP is the unofficial grey market premium per share and is not an indicator of listing price. Subscription is the overall number of times the issue was
        bid. Status is worked out from the issue dates and today’s date ({formatDayMonth(today)}).
      </p>

      {withBrokers.length ? (
        <section className="mt-10" aria-labelledby="broker-heading">
          <h2 id="broker-heading" className="headline text-[1.45rem]">
            What brokers are saying
          </h2>
          <p className="mt-1 text-sm text-muted">Count of brokerage notes by view. Sample data.</p>
          <div className="table-wrap mt-3">
            <table className="data-table min-w-[640px]">
              <thead>
                <tr>
                  <th>Company</th>
                  <th className="text-right">Apply</th>
                  <th className="text-right">Neutral</th>
                  <th className="text-right">Avoid</th>
                  <th className="w-[40%]">Split</th>
                </tr>
              </thead>
              <tbody>
                {withBrokers.map((ipo) => {
                  const b = ipo.brokers!;
                  const total = b.apply + b.neutral + b.avoid || 1;
                  return (
                    <tr key={ipo.slug}>
                      <td>
                        <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="font-semibold hover:text-ipo hover:underline">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="text-right font-semibold">{b.apply}</td>
                      <td className="text-right">{b.neutral}</td>
                      <td className="text-right">{b.avoid}</td>
                      <td>
                        <div role="img" className="flex h-3 w-full overflow-hidden bg-paper-2" aria-label={`${b.apply} apply, ${b.neutral} neutral, ${b.avoid} avoid`}>
                          <span className="bg-navy" style={{ width: `${(b.apply / total) * 100}%` }} />
                          <span className="bg-gold" style={{ width: `${(b.neutral / total) * 100}%` }} />
                          <span className="bg-accent-ink" style={{ width: `${(b.avoid / total) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-navy" /> Apply
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-gold" /> Neutral
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-accent-ink" /> Avoid
            </span>
          </p>
        </section>
      ) : (
        <p className="mt-10 border border-rule bg-white px-4 py-3 text-sm text-muted">No brokerage views are tracked for {board === "sme" ? "SME" : "mainboard"} issues on this board yet.</p>
      )}
    </div>
  );
}
