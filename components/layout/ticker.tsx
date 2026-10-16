import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";

type Quote = (typeof markets.ticker)[number];

function Item({ q }: { q: Quote }) {
  const up = q.change >= 0;
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  return (
    <li className="flex shrink-0 items-baseline gap-2 px-5 tabular">
      <span className="font-semibold text-ink">{q.name}</span>
      <span className="text-ink/85">
        {q.unit === "rupee" ? "₹" : ""}
        {formatNumber(q.value, decimals)}
      </span>
      <span className={`text-[0.78rem] font-semibold ${up ? "text-up-ink" : "text-down"}`}>
        <span aria-hidden>{up ? "▲" : "▼"}</span> {formatNumber(Math.abs(q.change), 2)} ({up ? "+" : "−"}
        {Math.abs(q.changePct).toFixed(2)}%)
      </span>
    </li>
  );
}

/** Right-to-left looping market strip. The list is rendered twice so the loop is seamless. */
export function Ticker() {
  return (
    <div className="border-b border-rule bg-white">
      <div className="wrap flex h-10 items-center gap-3 text-[0.86rem]">
        <p className="hidden shrink-0 border-r border-rule pr-3 text-[0.7rem] font-semibold uppercase leading-tight tracking-wide text-muted sm:block">
          Indicative,
          <br />
          may be delayed
        </p>
        <div className="group relative min-w-0 flex-1 overflow-hidden" aria-label="Market ticker, indicative, may be delayed" role="region">
          <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
            <ul className="flex">
              {markets.ticker.map((q) => (
                <Item key={q.id} q={q} />
              ))}
            </ul>
            <ul className="flex" aria-hidden>
              {markets.ticker.map((q) => (
                <Item key={q.id} q={q} />
              ))}
            </ul>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent" />
        </div>
        <p className="shrink-0 text-[0.68rem] text-muted sm:hidden">Indicative</p>
      </div>
    </div>
  );
}
