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

/**
 * An illustrative intraday path for the sample board: a seeded random walk that starts at the
 * previous close and ends exactly on the latest value, so every sparkline agrees with its figures.
 * Deterministic per seed, so server and client draw the same line. A live feed's series replaces it.
 */
export function sampleSeries(seed: string, prev: number, last: number, points = 36): number[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10_000) / 10_000;
  };
  const walk = [0];
  for (let i = 1; i < points; i++) walk.push(walk[i - 1] + (rand() - 0.5));
  const end = walk[points - 1];
  // Wiggle about a tenth of a percent of the level, or the size of the move if that is larger
  const span = Math.max(Math.abs(last - prev), prev * 0.0012);
  return walk.map((w, i) => {
    const t = i / (points - 1);
    return prev + (last - prev) * t + (w - end * t) * span * 0.32;
  });
}
