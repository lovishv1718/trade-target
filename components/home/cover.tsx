"use client";

import Link from "next/link";
import { ipoStatus, type Ipo } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const COUNT = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

/** "Friday, 23 October 2026" from an IST date, spelled out by hand so server and browser agree */
function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[day]}, ${d} ${MONTHS[m - 1]} ${y}`;
}

type Index = { name: string; changePct: number };

/** The masthead line over the cover: the day, the city, the beat */
export function CoverDateline({ buildDate }: { buildDate: string }) {
  const today = useIstToday(buildDate);
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-y border-ink py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-ink-2">
      <time dateTime={today}>{longDate(today)}</time>
      <span className="hidden sm:inline">Mumbai</span>
      <span className="hidden md:inline">Markets · IPOs · Personal finance</span>
    </div>
  );
}

/**
 * Today in one sentence: where the index closed, how many IPOs are open, and the day's lead story.
 * Each clause links to the page that tells the rest. The IPO count is worked out from the issue
 * dates in the reader's browser, so the static page never goes stale.
 */
export function CoverSentence({ index, ipos, buildDate, brief }: { index: Index; ipos: Ipo[]; buildDate: string; brief: { text: string; href: string } }) {
  const today = useIstToday(buildDate);
  const open = ipos.filter((i) => ipoStatus(i, today) === "open").length;
  const up = index.changePct >= 0;
  const ipoClause = open === 0 ? "No IPOs open today" : `${COUNT[open] ?? open} IPO${open === 1 ? "" : "s"} open`;
  return (
    <p className="sg-cover">
      <Link prefetch={false} href="/news/">
        {index.name}
      </Link>{" "}
      <em className={up ? undefined : "!text-down"}>
        {up ? "up" : "down"} {Math.abs(index.changePct).toFixed(2)}%
      </em>
      .{" "}
      <Link prefetch={false} href="/ipo/">
        {ipoClause}
      </Link>
      .{" "}
      <Link prefetch={false} href={brief.href}>
        {brief.text}
      </Link>
    </p>
  );
}
