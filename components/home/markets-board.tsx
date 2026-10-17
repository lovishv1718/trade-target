import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";
import { ChangeChip } from "./change-chip";
import { MarketStatus } from "./market-status-badge";
import { TickValue } from "./tick-value";

/** `series`, when a feed supplies it, is the session's prices in order; the sample has only the close. */
type Quote = { id: string; name: string; value: number; change: number; changePct: number; unit?: string; unitLabel?: string; series?: number[] };

const board = markets.board as Quote[];
const desk = markets.commodities as Quote[];

const decimalsFor = (q: Quote) => (q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2);

// Every sparkline shares one vertical scale, so a steeper line is a bigger move.
const DOMAIN = Math.max(0.25, ...board.map((q) => Math.abs(q.changePct))) * 1.1;

const W = 48;
const H = 18;

/**
 * The session drawn from the previous close (the dotted baseline) to the latest value, as a
 * percentage on the shared scale. With only the close in the sample data this is a straight
 * run; with a feed's intraday series it becomes the full path. Drawn still: on the board only the
 * figures move, and only when they change.
 */
function Spark({ q }: { q: Quote }) {
  const prev = q.value - q.change;
  const pts = (q.series && q.series.length > 1 ? q.series : [prev, q.value]).map((v) => ((v - prev) / prev) * 100);
  const mid = H / 2;
  const y = (p: number) => mid - (p / DOMAIN) * (mid - 2);
  const x = (i: number) => (i / (pts.length - 1)) * (W - 3);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const last = pts.length - 1;
  return (
    <span className={`block ${q.change > 0 ? "text-up" : q.change < 0 ? "text-down" : "text-muted"}`}>
      <svg className="spark" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden>
        <line className="spark-base" x1="0" x2={W} y1={mid} y2={mid} strokeWidth="1" />
        <path d={`${line} L${x(last).toFixed(1)} ${mid} L0 ${mid} Z`} fill="currentColor" opacity="0.18" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(last)} cy={y(pts[last])} r="1.9" fill="currentColor" />
      </svg>
    </span>
  );
}

/**
 * One instrument. Rows take focus so the board can be read from the keyboard; hover and focus look
 * the same. The last price and the change update in place, flashing their direction when they move.
 */
function QuoteRow({ q, spark }: { q: Quote; spark: boolean }) {
  const decimals = decimalsFor(q);
  return (
    <tr tabIndex={0}>
      <th scope="row" colSpan={spark ? 1 : 2} className="text-left text-sm font-semibold leading-tight text-ink">
        {q.name}
        {q.unitLabel ? <span className="mt-0.5 block text-2xs font-normal text-muted">{q.unitLabel}</span> : null}
      </th>
      {spark ? (
        <td className="w-12">
          <Spark q={q} />
        </td>
      ) : null}
      <td className="whitespace-nowrap text-right text-sm text-ink">
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

/** The quote board: a black instrument panel beside the newspaper. */
export function MarketsBoard() {
  return (
    <section aria-labelledby="markets-heading" className="surface-ink terminal">
      <div className="terminal-head">
        <h2 id="markets-heading" className="terminal-title">
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
            <th scope="col" className="text-left">
              Day
            </th>
            <th scope="col">Last</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          {board.map((q) => (
            <QuoteRow key={q.id} q={q} spark />
          ))}
        </tbody>
        <tbody className="quotes-desk">
          <tr className="quotes-tab">
            <th scope="colgroup" colSpan={4} className="text-left">
              <span>Commodities and currency</span>
            </th>
          </tr>
          {desk.map((q) => (
            <QuoteRow key={q.id} q={q} spark={false} />
          ))}
        </tbody>
      </table>
      <p className="terminal-foot">Sample values for this preview. Indicative, may be delayed.</p>
    </section>
  );
}
