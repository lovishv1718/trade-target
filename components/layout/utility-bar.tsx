"use client";

import Link from "next/link";
import { istDateLong, marketSession } from "@/lib/market";
import { useNow } from "@/lib/use-now";

// The bar stays 32px; the ::after stretches each link's hit area to 44px without growing the band.
const link =
  "relative items-center px-2 underline-offset-4 hover:text-white hover:underline focus-visible:-outline-offset-2 after:absolute after:inset-x-0 after:-inset-y-1.5";

export function UtilityBar() {
  const now = useNow();
  const session = now ? marketSession(now) : null;
  return (
    <div className="surface-ink text-xs">
      <div className="wrap flex h-8 items-stretch justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-ink-2" suppressHydrationWarning>
            {now ? istDateLong(now) : " "}
          </span>
          {session ? (
            <span className="hidden shrink-0 items-center gap-1.5 border-l border-rule pl-3 sm:inline-flex">
              <span aria-hidden className={`inline-block size-1.5 rounded-full ${session.open ? "bg-up" : "bg-muted"}`} />
              <span className={session.open ? "font-semibold text-ink" : "text-muted"}>{session.label}</span>
            </span>
          ) : null}
        </div>
        <nav aria-label="Utility" className="-mr-2 flex shrink-0 items-stretch">
          <Link href="/ipo/" className={`hidden text-white/80 md:flex ${link}`}>
            IPO dashboard
          </Link>
          <Link href="/calculators/" className={`hidden text-white/80 md:flex ${link}`}>
            Calculators
          </Link>
          <Link href="/hire-writers/" className={`flex font-semibold text-white ${link}`}>
            Hire our writers
          </Link>
        </nav>
      </div>
    </div>
  );
}
