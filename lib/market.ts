// Market session status from the current time in IST. Exchange holidays are not modelled.

export type MarketSession = { open: boolean; label: string };

export function marketSession(now: Date = new Date()): MarketSession {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = get("weekday");
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  if (weekday === "Sat" || weekday === "Sun") return { open: false, label: "Markets closed" };
  if (minutes >= 9 * 60 && minutes < 9 * 60 + 15) return { open: false, label: "Pre-open session" };
  if (minutes >= 9 * 60 + 15 && minutes < 15 * 60 + 30) return { open: true, label: "Markets open" };
  return { open: false, label: "Markets closed" };
}

export function istDateLong(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
}
