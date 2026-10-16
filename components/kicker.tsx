const COLORS: Record<string, string> = {
  IPO: "text-ipo",
  Results: "text-results-ink",
  Dividends: "text-results-ink",
  Commodities: "text-commodities-ink",
  Funds: "text-funds-ink",
  Markets: "text-navy",
  Business: "text-accent-ink",
  News: "text-accent-ink",
  "Share Analysis": "text-navy",
  "Stock Market IQ": "text-accent-ink",
  "Personal Finance": "text-funds-ink",
  "Blog Junction": "text-funds-ink",
  Calculators: "text-accent-ink",
};

export function kickerColor(label: string) {
  return COLORS[label] ?? "text-accent-ink";
}

export function Kicker({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`kicker ${kickerColor(label)} ${className}`}>{label}</span>;
}

/** CSS colour used for section rules */
export const ACCENT_VAR: Record<string, string> = {
  navy: "var(--color-navy)",
  accent: "var(--color-accent)",
  ipo: "var(--color-ipo)",
  results: "var(--color-results)",
  commodities: "var(--color-commodities)",
  funds: "var(--color-funds)",
};
