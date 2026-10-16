"use client";

import Link from "next/link";
import { istDateLong, marketSession } from "@/lib/market";
import { useNow } from "@/lib/use-now";

export function UtilityBar() {
  const now = useNow();
  const session = now ? marketSession(now) : null;
  return (
    <div className="border-b border-white/10 bg-navy-950 text-[0.78rem] text-white/80">
      <div className="wrap flex h-8 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate" suppressHydrationWarning>
            {now ? istDateLong(now) : " "}
          </span>
          {session ? (
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${session.open ? "bg-up" : "bg-white/40"}`} />
              {session.label}
            </span>
          ) : null}
        </div>
        <nav aria-label="Utility" className="flex shrink-0 items-center gap-4">
          <Link href="/ipo/" className="hidden hover:text-white md:inline">IPO dashboard</Link>
          <Link href="/calculators/" className="hidden hover:text-white md:inline">Calculators</Link>
          <Link href="/hire-writers/" className="font-semibold text-gold hover:text-white">Hire our writers</Link>
        </nav>
      </div>
    </div>
  );
}
