import { formatNumber } from "@/lib/format";
import { gmpPct, type Ipo } from "@/lib/ipo";

/** The largest premium on the board, as a percentage of the upper band: the full width of every GMP bar. */
export function gmpScale(ipos: Ipo[]) {
  return Math.max(10, ...ipos.map((i) => Math.abs(gmpPct(i) ?? 0)));
}

/**
 * Grey market premium for a table cell: a short bar shows the size of the premium against the
 * largest on the board, beside the rupee figure (arrow and sign, never colour alone) and the
 * percentage of the upper band.
 */
export function GmpCell({ ipo, scale }: { ipo: Ipo; scale: number }) {
  if (ipo.gmp === null) return <span className="text-muted">–</span>;
  const pct = gmpPct(ipo);
  const dir = ipo.gmp > 0 ? "up" : ipo.gmp < 0 ? "down" : "flat";
  const sign = dir === "up" ? "+" : dir === "down" ? "−" : "";
  const w = pct === null ? 0 : Math.min(Math.abs(pct) / scale, 1);
  return (
    <span className="gmp">
      <span className="gmp-bar" data-dir={dir} aria-hidden style={{ ["--w" as string]: w }}>
        <i />
      </span>
      <span className="text-right">
        <span className={`block whitespace-nowrap font-semibold ${dir === "up" ? "text-up" : dir === "down" ? "text-down" : "text-ink"}`}>
          {dir !== "flat" ? (
            <span aria-hidden className="mr-1 text-2xs">
              {dir === "up" ? "▲" : "▼"}
            </span>
          ) : null}
          {sign}₹{formatNumber(Math.abs(ipo.gmp))}
        </span>
        {pct !== null ? (
          <span className="block text-xs text-muted">
            {sign}
            {Math.abs(pct).toFixed(1)}%
          </span>
        ) : null}
      </span>
    </span>
  );
}
