import markets from "@/content/markets.json";
import { formatNumber } from "@/lib/format";

type Quote = (typeof markets.ticker)[number];

// Each copy of the moving track holds the quotes twice, so one copy is wider than any phone and
// the strip never shows a gap at the loop. The repeat is decoration: hidden from assistive tech,
// and dropped with the second copy under reduced motion.
const RUN = [...markets.ticker, ...markets.ticker];
const SHOWN = markets.ticker.length;

/** Names in capitals, as in the design; the gram in "GOLD 10g" stays lower case */
const label = (name: string) => name.toUpperCase().replace(/(\d)G$/, "$1g");

function Item({ q, echo = false, still = false }: { q: Quote; echo?: boolean; still?: boolean }) {
  const up = q.change >= 0;
  const decimals = q.id === "usdinr" ? 2 : q.unit === "rupee" ? 0 : 2;
  return (
    <li aria-hidden={echo || undefined} className={`flex shrink-0 items-center whitespace-nowrap tabular ${still ? "" : "px-7"} ${echo ? "dx-tape-copy" : ""}`}>
      <span className="text-[#e4e4e4]">{label(q.name)}</span>
      <span className="hm-tape-v text-[#f0f0f0]">
        {q.unit === "rupee" ? "₹" : ""}
        {formatNumber(q.value, decimals)}
      </span>
      <span className={`hm-tape-c ${up ? "text-[#22a565]" : "text-[#ec3a3f]"}`}>
        <span aria-hidden className="mr-[0.3em] text-[0.82em]">
          {up ? "+" : "-"}
        </span>
        <span className="sr-only">{up ? "up" : "down"}</span>
        {Math.abs(q.changePct).toFixed(2)}%
      </span>
    </li>
  );
}

/**
 * The market strip above the header, as in the design: from 1440px the six quotes stand
 * still, centred, between hairlines; where they cannot all fit they run right to left without
 * end (.dx-tape in data.css), holding still under the pointer and under reduced motion. The
 * figures are sample values; the footer says they are indicative.
 */
export function Ticker() {
  return (
    <div className="pm-tape" role="region" aria-label="Market figures, indicative, sample values">
      <ul className="hm-tape-still hidden h-[38px] items-center justify-center min-[1440px]:flex">
        {markets.ticker.map((q) => (
          <Item key={q.id} q={q} still />
        ))}
      </ul>
      <div className="flex h-[38px] items-stretch min-[1440px]:hidden">
        <div tabIndex={0} className="dx-tape no-scrollbar relative flex min-w-0 flex-1 items-center focus-visible:-outline-offset-2">
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
      </div>
    </div>
  );
}
