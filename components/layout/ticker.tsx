import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";

type Quote = (typeof markets.ticker)[number];

// Each copy of the track holds the quotes twice, so one copy is wider than any screen and the
// strip never shows a gap at the loop. The repeat is decoration: hidden from assistive tech, and
// dropped with the second copy under reduced motion.
const RUN = [...markets.ticker, ...markets.ticker];
const SHOWN = markets.ticker.length;

function Item({ q, echo = false }: { q: Quote; echo?: boolean }) {
  const up = q.change >= 0;
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  return (
    <li aria-hidden={echo || undefined} className={`flex shrink-0 items-center gap-4 whitespace-nowrap tabular ${echo ? "dx-tape-copy" : ""}`}>
      <span className="uppercase text-white/85">{q.name}</span>
      <span className="text-white">
        {q.unit === "rupee" ? "₹" : ""}
        {formatNumber(q.value, decimals)}
      </span>
      <span className={up ? "text-up-bright" : "text-down-bright"}>
        <span aria-hidden>{up ? "+" : "−"}</span>
        <span className="sr-only">{up ? "up" : "down"}</span> {Math.abs(q.changePct).toFixed(2)}%
      </span>
    </li>
  );
}

/**
 * The slim market strip above the header: one quiet line of indices in mono that runs right to
 * left without end. The quotes are set twice in one track (the second copy hidden from assistive
 * tech) and the track slides left by one copy (.dx-tape in data.css). It holds still under the
 * pointer and while focus is inside it; under reduced motion it stands still and scrolls sideways.
 * The indicative label stays put at the right end.
 */
export function Ticker() {
  return (
    <div className="pm-tape">
      <div className="flex h-[2.375rem] items-stretch">
        <div
          role="region"
          aria-label="Market figures, indicative, sample values"
          tabIndex={0}
          className="dx-tape no-scrollbar relative flex min-w-0 flex-1 items-center focus-visible:-outline-offset-2"
        >
          <div className="dx-tape-track">
            <ul className="flex shrink-0">
              {RUN.map((q, i) => (
                <Item key={`${i}-${q.id}`} q={q} echo={i >= SHOWN} />
              ))}
            </ul>
            <ul className="dx-tape-copy flex shrink-0" aria-hidden>
              {RUN.map((q, i) => (
                <Item key={`${i}-${q.id}`} q={q} />
              ))}
            </ul>
          </div>
        </div>
        <p className="flex shrink-0 items-center border-l border-[#3a3835] px-4 uppercase text-white/45">Indicative</p>
      </div>
    </div>
  );
}
