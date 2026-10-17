"use client";

import Link from "next/link";
import { istDateLong } from "@/lib/market";
import { useNow } from "@/lib/use-now";
import { MarketStatus } from "../home/market-status-badge";

// The bar stays 32px; the ::after stretches each link's hit area to 44px without growing the band.
const link = "link-soft relative items-center px-2 focus-visible:-outline-offset-2 after:absolute after:inset-x-0 after:-inset-y-1.5";

export function UtilityBar() {
  const now = useNow();
  return (
    <div className="surface-ink text-xs">
      <div className="wrap flex h-8 items-stretch justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-ink-2" suppressHydrationWarning>
            {now ? istDateLong(now) : " "}
          </span>
          <span className="hidden shrink-0 border-l border-rule pl-3 sm:inline-flex">
            <MarketStatus />
          </span>
        </div>
        <nav aria-label="Utility" className="-mr-2 flex shrink-0 items-stretch">
          <Link href="/ipo/" className={`hidden md:flex ${link}`}>
            IPO dashboard
          </Link>
          <Link href="/calculators/" className={`hidden md:flex ${link}`}>
            Calculators
          </Link>
          <Link href="/hire-writers/" className={`flex font-semibold text-ink ${link}`}>
            Hire our writers
          </Link>
        </nav>
      </div>
    </div>
  );
}
