import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";
import { ChangeChip } from "./change-chip";
import { MarketStatus } from "./market-status-badge";
import { TickValue } from "./tick-value";

type Quote = { id: string; name: string; value: number; change: number; changePct: number; unit?: string; unitLabel?: string };

const board = markets.board as Quote[];
const desk = markets.commodities as Quote[];

const decimalsFor = (q: Quote) => (q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2);

/**
 * One instrument. Rows take focus so the board can be read from the keyboard; hover and focus look
 * the same. The last price and the change update in place, flashing their direction when they move.
 */
function QuoteRow({ q }: { q: Quote }) {
  const decimals = decimalsFor(q);
  return (
    <tr tabIndex={0}>
      <th scope="row" className="text-left text-sm font-medium leading-tight text-ink">
        {q.name}
        {q.unitLabel ? <span className="mt-0.5 block text-2xs font-normal text-muted">{q.unitLabel}</span> : null}
      </th>
      <td className="whitespace-nowrap text-right font-mono text-sm text-ink">
        <TickValue value={q.value} className="inline-block">
          {q.unit === "rupee" ? "₹" : ""}
          {formatNumber(q.value, decimals)}
        </TickValue>
      </td>
      <td className="w-[5.5rem] text-right">
        <TickValue value={q.change} className="inline-flex" fit>
          <ChangeChip value={q.change} pct={`${Math.abs(q.changePct).toFixed(2)}%`} abs={formatNumber(Math.abs(q.change), decimals)} />
        </TickValue>
      </td>
    </tr>
  );
}

/** The quote board: a quiet hairline table of indices, then commodities and currency. */
export function MarketsBoard() {
  return (
    <section aria-labelledby="markets-heading" className="terminal border border-rule bg-white">
      <div className="terminal-head">
        <h2 id="markets-heading" className="kicker text-ink">
          Markets
        </h2>
        <MarketStatus asOf={markets.asOf} compact />
      </div>
      <table className="quotes">
        <caption className="sr-only">Indices, commodities and currency, with the change since the previous close. Sample values.</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Name</span>
            </th>
            <th scope="col">Last</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          {board.map((q) => (
            <QuoteRow key={q.id} q={q} />
          ))}
        </tbody>
        <tbody className="quotes-desk">
          <tr className="quotes-tab">
            <th scope="colgroup" colSpan={3} className="text-left">
              <span>Commodities and currency</span>
            </th>
          </tr>
          {desk.map((q) => (
            <QuoteRow key={q.id} q={q} />
          ))}
        </tbody>
      </table>
      <p className="terminal-foot">Sample values for this preview. Indicative, may be delayed.</p>
    </section>
  );
}
