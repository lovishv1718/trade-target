import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";
import { MarketStatusBadge } from "./market-status-badge";

type Quote = { id: string; name: string; value: number; change: number; changePct: number; unit?: string; unitLabel?: string };

function QuoteRow({ q }: { q: Quote }) {
  const dir = q.change > 0 ? 1 : q.change < 0 ? -1 : 0;
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  const sign = dir > 0 ? "+" : dir < 0 ? "−" : "";
  const tone = dir > 0 ? "text-up" : dir < 0 ? "text-down" : "text-muted";
  return (
    <tr className="border-t border-rule align-top">
      <th scope="row" className="py-2 pr-3 text-left text-sm font-semibold leading-snug text-ink">
        {q.name}
        {q.unitLabel ? <span className="block text-2xs font-normal text-muted">{q.unitLabel}</span> : null}
      </th>
      <td className="whitespace-nowrap py-2 text-right text-sm leading-snug tabular-nums text-ink">
        {q.unit === "rupee" ? "₹" : ""}
        {formatNumber(q.value, decimals)}
      </td>
      <td className={`whitespace-nowrap py-2 pl-3 text-right leading-snug tabular-nums ${tone}`}>
        <span className="block text-sm font-semibold">
          {dir !== 0 ? (
            <span aria-hidden className="mr-1 text-2xs">
              {dir > 0 ? "▲" : "▼"}
            </span>
          ) : null}
          {sign}
          {Math.abs(q.changePct).toFixed(2)}%
        </span>
        <span className="block text-2xs">
          {sign}
          {formatNumber(Math.abs(q.change), decimals)}
        </span>
      </td>
    </tr>
  );
}

/** The quote board: a black terminal panel beside the newspaper. */
export function MarketsBoard() {
  return (
    <section aria-labelledby="markets-heading" className="surface-ink px-4 pb-4 pt-1">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2 id="markets-heading" className="kicker text-sm text-ink">
          Markets
        </h2>
        <MarketStatusBadge />
      </div>
      <table className="w-full">
        <caption className="sr-only">Indices, commodities and currency</caption>
        <thead>
          <tr className="text-2xs uppercase tracking-wide text-muted">
            <th scope="col" className="pb-1.5 text-left font-semibold">
              <span className="sr-only">Name</span>
            </th>
            <th scope="col" className="pb-1.5 text-right font-semibold">
              Last
            </th>
            <th scope="col" className="pb-1.5 pl-3 text-right font-semibold">
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {(markets.board as Quote[]).map((q) => (
            <QuoteRow key={q.id} q={q} />
          ))}
        </tbody>
        <tbody>
          <tr>
            <th scope="colgroup" colSpan={3} className="kicker pb-1 pt-4 text-left text-muted">
              Commodities and currency
            </th>
          </tr>
          {(markets.commodities as Quote[]).map((q) => (
            <QuoteRow key={q.id} q={q} />
          ))}
        </tbody>
      </table>
      <p className="mt-3 border-t border-rule pt-2 text-2xs text-muted">Sample values for this preview. Indicative, may be delayed.</p>
    </section>
  );
}
