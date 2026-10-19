"use client";

import Link from "next/link";
import { istDateLong } from "@/lib/market";
import { useNow } from "@/lib/use-now";
import { MarketStatus } from "../home/market-status-badge";

// The ::after stretches each link's hit area to 44px without growing the bar.
const link = "link-soft relative items-center px-3 focus-visible:-outline-offset-2 after:absolute after:inset-x-0 after:-inset-y-1";

/** A navy tab hanging from the top edge: today's date, the session, and the three standing links. */
export function UtilityBar() {
  const now = useNow();
  return (
    <div className="wrap">
      <div className="hdr-utility surface-ink glass-navy flex h-11 items-stretch justify-between gap-4 rounded-t-none px-4 text-sm md:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <span className="truncate font-semibold text-ink" suppressHydrationWarning>
            {now ? istDateLong(now) : " "}
          </span>
          <span className="hidden shrink-0 sm:inline-flex">
            <MarketStatus />
          </span>
        </div>
        <nav aria-label="Utility" className="-mr-3 flex shrink-0 items-stretch">
          <Link href="/ipo/" className={`hidden font-semibold text-ink md:flex ${link}`}>
            IPO dashboard
          </Link>
          <span aria-hidden className="my-3.5 hidden w-px bg-rule-strong md:block" />
          <Link href="/calculators/" className={`hidden font-semibold text-ink md:flex ${link}`}>
            Calculators
          </Link>
          <span aria-hidden className="my-3.5 hidden w-px bg-rule-strong md:block" />
          <Link href="/hire-writers/" className={`flex font-semibold text-ink ${link}`}>
            Hire our writers
          </Link>
        </nav>
      </div>
    </div>
  );
}
