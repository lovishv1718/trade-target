import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";
import { MarketStatusBadge } from "./market-status-badge";

type Quote = { id: string; name: string; value: number; change: number; changePct: number; unit?: string; unitLabel?: string };

function QuoteRow({ q }: { q: Quote }) {
  const up = q.change >= 0;
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  return (
    <tr className="border-t border-rule">
      <th scope="row" className="py-2 pr-2 text-left font-semibold">
        {q.name}
        {q.unitLabel ? <span className="block text-[0.72rem] font-normal text-muted">{q.unitLabel}</span> : null}
      </th>
      <td className="py-2 text-right tabular">
        {q.unit === "rupee" ? "₹" : ""}
        {formatNumber(q.value, decimals)}
      </td>
      <td className={`py-2 pl-2 text-right text-[0.85rem] font-semibold tabular ${up ? "text-up-ink" : "text-down"}`}>
        {up ? "+" : "−"}
        {Math.abs(q.changePct).toFixed(2)}%
      </td>
    </tr>
  );
}

export function MarketsBoard() {
  return (
    <section aria-labelledby="markets-heading" className="border-t-[3px] border-navy bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 id="markets-heading" className="headline text-xl">
          Markets
        </h2>
        <MarketStatusBadge />
      </div>
      <table className="mt-2 w-full text-[0.92rem]">
        <caption className="sr-only">Indices</caption>
        <tbody>
          {markets.board.map((q) => (
            <QuoteRow key={q.id} q={q} />
          ))}
        </tbody>
      </table>
      <p className="kicker mt-4 text-muted">Commodities and currency</p>
      <table className="mt-1 w-full text-[0.92rem]">
        <caption className="sr-only">Commodities and currency</caption>
        <tbody>
          {(markets.commodities as Quote[]).map((q) => (
            <QuoteRow key={q.id} q={q} />
          ))}
        </tbody>
      </table>
      <p className="mt-3 border-t border-rule pt-2 text-[0.72rem] leading-snug text-muted">Sample values for this preview. Indicative, may be delayed.</p>
    </section>
  );
}
