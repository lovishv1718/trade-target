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

function signedText(value: number, digits: number) {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatNumber(Math.abs(value), digits)}`;
}

/** Signed figure: sign and colour together, never colour alone. */
function Signed({ value, suffix = "", prefix = "" }: { value: number | null; suffix?: string; prefix?: string }) {
  if (value === null) return <span className="text-muted">–</span>;
  const cls = value > 0 ? "text-up" : value < 0 ? "text-down" : "text-ink";
  return (
    <span className={`font-semibold tabular ${cls}`}>
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

const BOARD_LABEL = { mainboard: "Mainboard", sme: "SME" } as const;

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
  const boardName = BOARD_LABEL[board];
  const filterLabel = FILTERS.find((f) => f.key === filter)?.label ?? "All";

  const cards: { label: string; value: number; valueClass?: string }[] = [
    { label: `Listed in ${year}`, value: summary.listedThisYear },
    { label: "Open now", value: summary.open },
    { label: "Upcoming", value: summary.upcoming },
    { label: "Gained on listing", value: summary.gained, valueClass: "text-up" },
    { label: "Fell on listing", value: summary.fell, valueClass: "text-down" },
  ];

  return (
    <div>
      {/* Filters: board, then status */}
      <div className="flex flex-col gap-3 border-y border-rule py-3 md:flex-row md:flex-wrap md:items-center md:gap-x-8">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Board">
          <span className="kicker mr-1 w-14 text-muted md:w-auto">Board</span>
          {(["mainboard", "sme"] as const).map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={board === b}
              onClick={() => {
                setBoard(b);
                setFilter("all");
                window.history.replaceState(null, "", b === "sme" ? "?board=sme" : window.location.pathname);
              }}
              className="chip"
            >
              {BOARD_LABEL[b]}
              <span className="font-normal tabular opacity-80">{ipos.filter((i) => i.board === b).length}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          <span className="kicker mr-1 w-14 text-muted md:w-auto">Status</span>
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} className="chip">
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-white px-4 py-3">
            <dt className="text-xs font-semibold text-muted">{c.label}</dt>
            <dd className={`mt-1 text-3xl font-semibold leading-tight tabular ${c.valueClass ?? "text-ink"}`}>{c.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="headline text-2xl">{boardName} IPOs</h2>
        <p className="text-xs text-muted tabular" aria-live="polite">
          {rows.length} of {boardIpos.length} shown · Status: {filterLabel}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted sm:hidden">Swipe the table sideways for more columns. The company name stays in view.</p>

      <div className="table-wrap table-scroll mt-3" tabIndex={0} role="region" aria-label={`${boardName} IPOs table`}>
        <table className="data-table min-w-[960px]">
          <caption className="sr-only">
            {boardName} IPOs, status filter: {filterLabel}. GMP and listing gain show a plus or minus sign.
          </caption>
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
                Lot size
              </th>
              <th scope="col" className="num">
                GMP
              </th>
              <th scope="col" className="num">
                Subscription
              </th>
              <th scope="col">Listing</th>
              <th scope="col" className="num">
                Listing gain
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8">
                  <p className="font-semibold text-ink">
                    No {board === "sme" ? "SME" : "mainboard"} IPOs match this status{filter === "open" || filter === "upcoming" ? " this week" : ""}.
                  </p>
                  <p className="mt-1 text-sm text-muted">Try another status, or switch board.</p>
                  <button type="button" className="chip mt-3" onClick={() => setFilter("all")}>
                    Show all {board === "sme" ? "SME" : "mainboard"} IPOs
                  </button>
                </td>
              </tr>
            ) : (
              rows.map(({ ipo, status }) => {
                const pct = gmpPct(ipo);
                return (
                  <tr key={ipo.slug}>
                    <th scope="row" className="sticky-col min-w-36 font-normal sm:min-w-52">
                      <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="font-semibold text-ink hover:text-ipo hover:underline">
                        {ipo.name}
                      </Link>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-normal text-muted">
                        {ipo.sector}
                        {ipo.sample ? <span className="border border-company-mark px-1 text-2xs font-bold uppercase leading-snug tracking-caps text-company">Sample</span> : null}
                      </span>
                    </th>
                    <td className="whitespace-nowrap tabular">{dateRange(ipo)}</td>
                    <td className="num">{priceBandLabel(ipo)}</td>
                    <td className="num">{ipo.lotSize ? formatNumber(ipo.lotSize) : "–"}</td>
                    <td className="num">
                      {ipo.gmp === null ? (
                        <span className="text-muted">–</span>
                      ) : (
                        <>
                          <Signed value={ipo.gmp} prefix="₹" />
                          <span className="block text-xs text-muted">{pct !== null ? `${signedText(pct, 1)}%` : ""}</span>
                        </>
                      )}
                    </td>
                    <td className="num">{ipo.subscription?.total != null ? `${ipo.subscription.total.toFixed(2)}x` : <span className="text-muted">–</span>}</td>
                    <td className="whitespace-nowrap tabular">
                      {ipo.dates.listing ? formatDayMonth(ipo.dates.listing) + (ipo.dates.listing.slice(0, 4) !== year ? ` ${ipo.dates.listing.slice(0, 4)}` : "") : "–"}
                    </td>
                    <td className="num">
                      <Signed value={listingGainPct(ipo)} suffix="%" />
                    </td>
                    <td>
                      <StatusPill status={status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 max-w-3xl text-xs leading-normal text-muted">
        GMP is the unofficial grey market premium per share and is not an indicator of listing price. Subscription is the overall number of times the issue was
        bid. Status is worked out from the issue dates and today’s date ({formatDayMonth(today)}).
      </p>

      {withBrokers.length ? (
        <section className="mt-12" aria-labelledby="broker-heading">
          <h2 id="broker-heading" className="headline border-t border-ink pt-3 text-2xl">
            What brokers are saying
          </h2>
          <p className="mt-1 text-sm text-muted">Count of brokerage notes by view. Sample data.</p>
          <div className="table-wrap mt-3" tabIndex={0} role="region" aria-labelledby="broker-heading">
            <table className="data-table min-w-[640px]">
              <caption className="sr-only">Brokerage notes by view for {boardName.toLowerCase()} IPOs</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky-col">
                    Company
                  </th>
                  <th scope="col" className="num">
                    Apply
                  </th>
                  <th scope="col" className="num">
                    Neutral
                  </th>
                  <th scope="col" className="num">
                    Avoid
                  </th>
                  <th scope="col" className="w-[40%]">
                    Split
                  </th>
                </tr>
              </thead>
              <tbody>
                {withBrokers.map((ipo) => {
                  const b = ipo.brokers!;
                  const total = b.apply + b.neutral + b.avoid || 1;
                  return (
                    <tr key={ipo.slug}>
                      <th scope="row" className="sticky-col min-w-36 sm:min-w-52">
                        <Link prefetch={false} href={`/ipo/${ipo.slug}/`} className="font-semibold text-ink hover:text-ipo hover:underline">
                          {ipo.name}
                        </Link>
                      </th>
                      <td className="num font-semibold">{b.apply}</td>
                      <td className="num">{b.neutral}</td>
                      <td className="num">{b.avoid}</td>
                      <td className="align-middle">
                        <div role="img" className="flex h-2.5 w-full overflow-hidden bg-paper-2" aria-label={`${b.apply} apply, ${b.neutral} neutral, ${b.avoid} avoid`}>
                          <span className="bg-up" style={{ width: `${(b.apply / total) * 100}%` }} />
                          <span className="bg-rule-strong" style={{ width: `${(b.neutral / total) * 100}%` }} />
                          <span className="bg-down" style={{ width: `${(b.avoid / total) * 100}%` }} />
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
              <span aria-hidden className="inline-block size-2.5 bg-up" /> Apply
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block size-2.5 bg-rule-strong" /> Neutral
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block size-2.5 bg-down" /> Avoid
            </span>
          </p>
        </section>
      ) : (
        <p className="mt-12 border border-rule bg-white px-4 py-3 text-sm text-muted">No brokerage views are tracked for {board === "sme" ? "SME" : "mainboard"} issues on this board yet.</p>
      )}
    </div>
  );
}
