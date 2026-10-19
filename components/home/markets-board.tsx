import Link from "next/link";
import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";
import { sampleSeries } from "@/lib/market";
import { IndexTile, Illustration } from "../illustrations";
import { AreaSpark } from "../spark";
import { ChangeChip } from "./change-chip";
import { MarketStatus } from "./market-status-badge";
import { TickValue } from "./tick-value";

/** `series`, when a feed supplies it, is the session's prices in order; the sample draws an illustrative path. */
type Quote = { id: string; name: string; value: number; change: number; changePct: number; unit?: string; unitLabel?: string; series?: number[] };

const board = markets.board as Quote[];
// USD/INR runs on the tape; the desk card shows the two metals
const desk = (markets.commodities as Quote[]).filter((q) => q.id === "gold" || q.id === "silver");

const decimalsFor = (q: Quote) => (q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2);
const seriesFor = (q: Quote) => (q.series && q.series.length > 1 ? q.series : sampleSeries(q.id, q.value - q.change, q.value));

/**
 * One instrument. Rows take focus so the board can be read from the keyboard; hover and focus look
 * the same. The last price and the change update in place, flashing their direction when they move.
 */
function QuoteRow({ q }: { q: Quote }) {
  const decimals = decimalsFor(q);
  const dir = q.change > 0 ? "text-up" : q.change < 0 ? "text-down" : "text-muted";
  return (
    <tr tabIndex={0}>
      <th scope="row" className="text-left">
        <span className="flex items-center gap-3">
          <IndexTile id={q.id} />
          <span className="text-sm font-bold leading-tight text-ink">{q.name}</span>
        </span>
      </th>
      <td className="whitespace-nowrap text-right text-sm font-semibold text-ink">
        <TickValue value={q.value} className="inline-block">
          {q.unit === "rupee" ? "₹" : ""}
          {formatNumber(q.value, decimals)}
        </TickValue>
      </td>
      <td className="text-right">
        <TickValue value={q.change} className="inline-flex" fit>
          <ChangeChip value={q.change} pct={`${Math.abs(q.changePct).toFixed(2)}%`} abs={formatNumber(Math.abs(q.change), decimals)} />
        </TickValue>
      </td>
      <td className="hidden w-24 sm:table-cell lg:hidden xl:table-cell">
        <span className={`block ${dir}`}>
          <AreaSpark values={seriesFor(q)} id={`board-${q.id}`} width={88} height={34} className="h-9 w-[5.5rem]" />
        </span>
      </td>
    </tr>
  );
}

/** The quote board: a navy instrument panel beside the newspaper. */
export function MarketsBoard() {
  return (
    <section aria-labelledby="markets-heading" className="surface-ink glass-navy terminal markets-panel">
      <div className="terminal-head">
        <h2 id="markets-heading" className="text-xl font-bold uppercase tracking-[0.06em] text-ink">
          Markets
        </h2>
        <MarketStatus asOf={markets.asOf} compact />
      </div>
      <table className="quotes">
        <caption className="sr-only">Indices, with the change since the previous close. Sample values.</caption>
        <thead>
          <tr>
            <th scope="col">Index</th>
            <th scope="col">Last</th>
            <th scope="col">Change</th>
            <th scope="col" className="hidden sm:table-cell lg:hidden xl:table-cell">
              Day chart
            </th>
          </tr>
        </thead>
        <tbody>
          {board.map((q) => (
            <QuoteRow key={q.id} q={q} />
          ))}
        </tbody>
      </table>
      <p className="terminal-foot">Sample values for this preview. Indicative, may be delayed.</p>
    </section>
  );
}

/** Commodities and currency on their own frosted card, each with its picture */
export function CommoditiesCard() {
  return (
    <section aria-labelledby="desk-heading" className="glass terminal p-1">
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <h2 id="desk-heading" className="text-sm font-bold uppercase tracking-[0.08em] text-ink">
          Commodities and currency
        </h2>
        <Link prefetch={false} href="/news/?topic=Commodities" aria-label="Commodities news" className="btn btn-secondary btn-icon btn-round btn-sm min-h-8 w-8">
          <svg aria-hidden width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 1.5L6.5 6 2 10.5" />
          </svg>
        </Link>
      </div>
      <table className="quotes quotes-light">
        <caption className="sr-only">Gold and silver, with the change since the previous close. Sample values.</caption>
        <tbody>
          {desk.map((q) => {
            const decimals = decimalsFor(q);
            return (
              <tr key={q.id} tabIndex={0}>
                <th scope="row" className="text-left">
                  <span className="flex items-center gap-3">
                    {q.id === "gold" || q.id === "silver" ? (
                      <Illustration art={q.id as "gold" | "silver"} id={`desk-${q.id}`} className="size-12 shrink-0" />
                    ) : (
                      <span className="grid size-12 shrink-0 place-items-center">
                        <IndexTile id={q.id} />
                      </span>
                    )}
                    <span>
                      <span className="block text-base font-bold leading-tight text-ink">{q.name}</span>
                      {q.unitLabel ? <span className="mt-0.5 block text-xs text-muted">{q.unitLabel}</span> : null}
                    </span>
                  </span>
                </th>
                <td className="whitespace-nowrap text-right text-sm font-semibold text-ink">
                  <TickValue value={q.value} className="inline-block">
                    {q.unit === "rupee" ? "₹" : ""}
                    {formatNumber(q.value, decimals)}
                  </TickValue>
                </td>
                <td className="text-right">
                  <TickValue value={q.change} className="inline-flex" fit>
                    <ChangeChip value={q.change} pct={`${Math.abs(q.changePct).toFixed(2)}%`} abs={formatNumber(Math.abs(q.change), decimals)} />
                  </TickValue>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
