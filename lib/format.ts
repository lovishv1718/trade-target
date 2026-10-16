// Indian number formatting: ₹ with lakh/crore grouping, amounts in words, dates in IST.

const grouping = new Map<number, Intl.NumberFormat>();
function nf(decimals: number) {
  let f = grouping.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    grouping.set(decimals, f);
  }
  return f;
}

/** 1234567.8 -> "12,34,568" */
export function formatNumber(n: number, decimals = 0) {
  if (!Number.isFinite(n)) return "–";
  return nf(decimals).format(decimals === 0 ? Math.round(n) : n);
}

/** 1234567 -> "₹12,34,567"; negatives as "−₹1,200" */
export function formatINR(n: number, decimals = 0) {
  if (!Number.isFinite(n)) return "–";
  const s = formatNumber(Math.abs(n), decimals);
  return `${n < 0 ? "−" : ""}₹${s}`;
}

/** Fixed decimals without trailing zeros: 1.50 -> "1.5", 10.00 -> "10", 500 -> "500" */
const trim = (n: number, max = 2) => {
  const fixed = n.toFixed(max);
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
};

/** 500000 -> "5 lakh", 12500000 -> "1.25 crore", 45000 -> "45 thousand", 950 -> "950" */
export function amountInWords(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "minus " : "";
  if (a >= 1e7) return `${sign}${trim(a / 1e7)} crore`;
  if (a >= 1e5) return `${sign}${trim(a / 1e5)} lakh`;
  if (a >= 1e3) return `${sign}${trim(a / 1e3)} thousand`;
  return `${sign}${trim(a, 0)}`;
}

/** 12345678 -> "₹1.23 crore", 525000 -> "₹5.25 lakh", 45000 -> "₹45,000" */
export function formatINRCompact(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e7) return `${sign}₹${trim(a / 1e7)} crore`;
  if (a >= 1e5) return `${sign}₹${trim(a / 1e5)} lakh`;
  return formatINR(n);
}

/** Short axis labels: 2.5Cr, 40L, 75K */
export function formatAxisINR(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e7) return `${sign}₹${trim(a / 1e7, 1)}Cr`;
  if (a >= 1e5) return `${sign}₹${trim(a / 1e5, 1)}L`;
  if (a >= 1e3) return `${sign}₹${trim(a / 1e3, 0)}K`;
  return `${sign}₹${trim(a, 0)}`;
}

export function formatPct(n: number, decimals = 2, signed = false) {
  if (!Number.isFinite(n)) return "–";
  const s = n.toFixed(decimals);
  return `${signed && n > 0 ? "+" : ""}${s}%`;
}

const IST = "Asia/Kolkata";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function istParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: Number(get("day")),
    month: MONTHS[Number(get("month")) - 1],
    year: get("year"),
    time: `${get("hour")}:${get("minute")} ${get("dayPeriod").toLowerCase()}`,
  };
}

/** "22 Sep 2026" */
export function formatDate(iso: string) {
  const p = istParts(parseDate(iso));
  return `${p.day} ${p.month} ${p.year}`;
}

/** "22 Sep" */
export function formatDayMonth(iso: string) {
  const p = istParts(parseDate(iso));
  return `${p.day} ${p.month}`;
}

/** "22 Sep 2026, 10:44 am IST" */
export function formatDateTime(iso: string) {
  const p = istParts(parseDate(iso));
  return `${p.day} ${p.month} ${p.year}, ${p.time} IST`;
}

/** WordPress dates have no zone; they are site-local (IST). */
export function parseDate(iso: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(`${iso}T00:00:00+05:30`);
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(iso)) return new Date(iso);
  return new Date(`${iso}+05:30`);
}
