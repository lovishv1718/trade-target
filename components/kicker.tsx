// Section labels are small black capitals, whatever their section.
export function kickerColor(_label: string) {
  return "text-ink";
}

/** The section label. `pill` sets it on a soft tint of its own colour, as on story cards. */
export function Kicker({ label, className = "", pill = false }: { label: string; className?: string; pill?: boolean }) {
  return <span className={`kicker ${pill ? "kicker-pill" : ""} ${kickerColor(label)} ${className}`}>{label}</span>;
}

/** CSS colour used for section rules. The premium theme rules every section in ink; the old
 *  section names (navy, accent, results, commodities, funds) still resolve. */
export const ACCENT_VAR: Record<string, string> = {
  ink: "var(--color-ink)",
  news: "var(--color-ink)",
  ipo: "var(--color-ink)",
  company: "var(--color-ink)",
  money: "var(--color-ink)",
  learn: "var(--color-ink)",
  navy: "var(--color-ink)",
  accent: "var(--color-ink)",
  results: "var(--color-ink)",
  commodities: "var(--color-ink)",
  funds: "var(--color-ink)",
};
