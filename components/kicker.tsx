// Five section groups (see the colour tokens in app/globals.css). News and the
// market desks speak in ink, the paper's own voice; the other groups each have one colour.
const COLORS: Record<string, string> = {
  News: "text-ink",
  Markets: "text-ink",
  Business: "text-ink",
  Commodities: "text-ink",
  IPO: "text-ipo",
  "Share Analysis": "text-company",
  Results: "text-company",
  Dividends: "text-company",
  "Personal Finance": "text-money",
  Funds: "text-money",
  "Blog Junction": "text-money",
  "Stock Market IQ": "text-learn",
  Calculators: "text-learn",
};

export function kickerColor(label: string) {
  return COLORS[label] ?? "text-ink";
}

export function Kicker({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`kicker ${kickerColor(label)} ${className}`}>{label}</span>;
}

/** CSS colour used for section rules. The old names (navy, accent, results, commodities, funds) still resolve. */
export const ACCENT_VAR: Record<string, string> = {
  ink: "var(--color-ink)",
  news: "var(--color-ink)",
  ipo: "var(--color-ipo)",
  company: "var(--color-company-mark)",
  money: "var(--color-money)",
  learn: "var(--color-learn)",
  navy: "var(--color-ink)",
  accent: "var(--color-ink)",
  results: "var(--color-company-mark)",
  commodities: "var(--color-ink)",
  funds: "var(--color-money)",
};
