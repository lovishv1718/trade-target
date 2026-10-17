/**
 * A move as one unit: arrow and percentage on top, the change in points or rupees beneath,
 * in a fixed-width chip so a column of them lines up. Direction is carried by the arrow and
 * the sign as well as the colour.
 */
export function ChangeChip({ value, pct, abs }: { value: number; pct: string; abs: string }) {
  const dir = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const sign = dir === "up" ? "+" : dir === "down" ? "−" : "";
  return (
    <span className="chg" data-dir={dir}>
      <span className="chg-pct">
        <span aria-hidden>{dir === "up" ? "▲" : dir === "down" ? "▼" : "■"}</span>
        <span className="sr-only">{dir === "up" ? "Up " : dir === "down" ? "Down " : "Unchanged "}</span>
        {sign}
        {pct}
      </span>
      <span className="chg-abs">
        {sign}
        {abs}
      </span>
    </span>
  );
}
