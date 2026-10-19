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

/** The section label. `pill` sets it on a soft tint of its own colour, as on story cards. */
export function Kicker({ label, className = "", pill = false }: { label: string; className?: string; pill?: boolean }) {
  return <span className={`kicker ${pill ? "kicker-pill" : ""} ${kickerColor(label)} ${className}`}>{label}</span>;
}

/** CSS colour used for section rules. The old names (navy, accent, results, commodities, funds) still resolve.
 *  The paper's own voice (ink) marks its sections in the theme's primary blue. */
export const ACCENT_VAR: Record<string, string> = {
  ink: "var(--color-primary)",
  news: "var(--color-primary)",
  ipo: "var(--color-ipo)",
  company: "var(--color-company-mark)",
  money: "var(--color-money)",
  learn: "var(--color-learn)",
  navy: "var(--color-primary)",
  accent: "var(--color-primary)",
  results: "var(--color-company-mark)",
  commodities: "var(--color-primary)",
  funds: "var(--color-money)",
};
