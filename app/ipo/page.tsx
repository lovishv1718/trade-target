import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { IpoDashboard } from "@/components/ipo/ipo-dashboard";
import { SectionHeader } from "@/components/section-header";
import { LeadStory, StoryRow } from "@/components/story";
import { getArticlesBySection, toCard } from "@/lib/content";
import { getIpos, IPO_NOTE, istToday } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "IPO Dashboard: Upcoming, Open and Listed IPOs, GMP and Subscription",
  description: "Track mainboard and SME IPOs: dates, price band, lot size, GMP, subscription status, listing gains and brokerage views.",
  alternates: { canonical: "/ipo/" },
};

export default function IpoPage() {
  const ipos = getIpos();
  const stories = getArticlesBySection("ipo").map(toCard);
  const [lead, ...rest] = stories;
  return (
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="IPO" />
      <div className="mt-4 border-t-3 border-ipo pt-3">
        <p className="kicker text-ipo">IPO</p>
        <h1 className="headline mt-1 text-4xl md:text-5xl">IPO Dashboard</h1>
        <p className="mt-2 max-w-2xl text-lg leading-normal text-ink-2">Dates, price bands, GMP and subscription for mainboard and SME issues, with status worked out from the issue calendar.</p>
      </div>
      <p className="mt-5 max-w-3xl border-l-3 border-company-mark bg-white px-4 py-2.5 text-sm leading-normal text-ink-2">{IPO_NOTE}</p>

      <div className="mt-6">
        <Suspense fallback={<div aria-hidden className="h-96 border-y border-rule bg-paper-2" />}>
          <IpoDashboard ipos={ipos} buildDate={istToday()} />
        </Suspense>
      </div>

      <section className="mt-14" aria-label="IPO news">
        <SectionHeader title="IPO news and allotment" accent="ipo" />
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {lead ? <LeadStory story={lead} /> : null}
          <div className="divide-y divide-rule border-t border-rule lg:border-t-0">
            {rest.slice(0, 6).map((s) => (
              <StoryRow key={s.slug} story={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 border-t border-ink pt-6 md:grid-cols-3" aria-label="IPO guides">
        <div>
          <p className="kicker text-muted">New to IPOs?</p>
          <Link href="/stock-market-iq/what-is-an-ipo/" className="headline mt-1 block text-xl hover:underline">
            What is an IPO: meaning, types, process and eligibility
          </Link>
        </div>
        <div>
          <p className="kicker text-muted">Allotment</p>
          <Link href="/ipo/nse-ipo-allotment-status/" className="headline mt-1 block text-xl hover:underline">
            How to check IPO allotment status on BSE and the registrar’s site
          </Link>
        </div>
        <div>
          <p className="kicker text-muted">Before you apply</p>
          <Link href="/stock-market-iq/how-to-select-best-stocks/" className="headline mt-1 block text-xl hover:underline">
            How to judge a company before you invest
          </Link>
        </div>
      </section>
    </div>
  );
}
