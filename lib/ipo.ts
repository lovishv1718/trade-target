// IPO types and status logic. Status is always derived from the dates and today's date in IST.

import ipoJson from "@/content/ipos.json";

export type IpoDates = {
  open: string | null;
  close: string | null;
  allotment: string | null;
  refund: string | null;
  demat: string | null;
  listing: string | null;
};

export type Subscription = { qib: number | null; nii: number | null; retail: number | null; employee: number | null; total: number | null };

export type Ipo = {
  slug: string;
  name: string;
  board: "mainboard" | "sme";
  sample: boolean;
  photo: string | null;
  sector: string;
  about: string;
  dates: IpoDates;
  priceBand: [number | null, number | null];
  lotSize: number | null;
  faceValue: number | null;
  issueSizeCr: number | null;
  freshIssueCr: number | null;
  ofsCr: number | null;
  exchanges: string[];
  registrar: string;
  leadManagers: string[];
  gmp: number | null;
  gmpHistory: { date: string; gmp: number }[];
  subscription: Subscription | null;
  subscriptionAsOf: string | null;
  listingPrice: number | null;
  brokers: { apply: number; neutral: number; avoid: number } | null;
  relatedArticles: string[];
};

export const IPO_NOTE = ipoJson.note;

export function getIpos(): Ipo[] {
  return ipoJson.ipos as Ipo[];
}

export function getIpo(slug: string): Ipo | null {
  return getIpos().find((i) => i.slug === slug) ?? null;
}

export type IpoStatus = "upcoming" | "open" | "closed" | "allotted" | "listed";

export const STATUS_META: Record<IpoStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-ipo text-white" },
  upcoming: { label: "Upcoming", className: "bg-gold/25 text-[#7a5300] ring-1 ring-inset ring-gold/60" },
  closed: { label: "Closed", className: "bg-navy/8 text-navy ring-1 ring-inset ring-navy/25" },
  allotted: { label: "Allotment out", className: "bg-funds/12 text-[#075f6b] ring-1 ring-inset ring-funds/40" },
  listed: { label: "Listed", className: "bg-ink/6 text-muted ring-1 ring-inset ring-ink/15" },
};

/** Today's date in IST as YYYY-MM-DD. */
export function istToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function ipoStatus(ipo: Pick<Ipo, "dates">, today: string): IpoStatus {
  const { open, close, allotment, listing } = ipo.dates;
  if (listing && today >= listing) return "listed";
  if (allotment && today >= allotment) return "allotted";
  if (close && today > close) return "closed";
  if (open && today >= open) return "open";
  if (!open && close && today <= close) return "open";
  return "upcoming";
}

export function upperPrice(ipo: Ipo) {
  return ipo.priceBand[1] ?? ipo.priceBand[0];
}

export function priceBandLabel(ipo: Ipo) {
  const [lo, hi] = ipo.priceBand;
  if (lo && hi) return `₹${lo.toLocaleString("en-IN")}–${hi.toLocaleString("en-IN")}`;
  if (hi) return `Up to ₹${hi.toLocaleString("en-IN")}`;
  return "–";
}

export function listingGainPct(ipo: Ipo): number | null {
  const up = upperPrice(ipo);
  if (!ipo.listingPrice || !up) return null;
  return ((ipo.listingPrice - up) / up) * 100;
}

export function gmpPct(ipo: Ipo): number | null {
  const up = upperPrice(ipo);
  if (ipo.gmp === null || !up) return null;
  return (ipo.gmp / up) * 100;
}

export function summarise(ipos: Ipo[], today: string) {
  const year = today.slice(0, 4);
  const statuses = ipos.map((i) => ({ ipo: i, status: ipoStatus(i, today) }));
  const listedThisYear = statuses.filter((s) => s.status === "listed" && s.ipo.dates.listing?.startsWith(year));
  return {
    listedThisYear: listedThisYear.length,
    open: statuses.filter((s) => s.status === "open").length,
    upcoming: statuses.filter((s) => s.status === "upcoming").length,
    gained: listedThisYear.filter((s) => (listingGainPct(s.ipo) ?? 0) > 0).length,
    fell: listedThisYear.filter((s) => (listingGainPct(s.ipo) ?? 0) < 0).length,
  };
}

export const TIMELINE_STEPS: { key: keyof IpoDates; label: string }[] = [
  { key: "open", label: "Opens" },
  { key: "close", label: "Closes" },
  { key: "allotment", label: "Allotment" },
  { key: "refund", label: "Refunds" },
  { key: "demat", label: "Shares in demat" },
  { key: "listing", label: "Listing" },
];

export type LotRow = { category: string; lots: number; shares: number; amount: number };

/** Mainboard application sizes at the upper price band: retail up to ₹2 lakh, S-HNI up to ₹10 lakh. */
export function lotTable(ipo: Ipo): LotRow[] {
  const price = upperPrice(ipo);
  if (!price || !ipo.lotSize) return [];
  const lotValue = price * ipo.lotSize;
  const row = (category: string, lots: number) => ({ category, lots, shares: lots * ipo.lotSize!, amount: lots * lotValue });
  if (ipo.board === "sme") return [row("Minimum application", 1)];
  const retailMax = Math.max(Math.floor(200000 / lotValue), 1);
  const shniMax = Math.max(Math.floor(1000000 / lotValue), retailMax + 1);
  return [row("Retail (min)", 1), row("Retail (max)", retailMax), row("S-HNI (min)", retailMax + 1), row("S-HNI (max)", shniMax), row("B-HNI (min)", shniMax + 1)];
}

export function statusOrder(s: IpoStatus) {
  return { open: 0, upcoming: 1, closed: 2, allotted: 3, listed: 4 }[s];
}
