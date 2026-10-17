import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IpoDashboard } from "@/components/ipo/ipo-dashboard";
import { SectionMasthead } from "@/components/listing/section-masthead";
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
    <>
      <SectionMasthead
        title="IPO Dashboard"
        crumb="IPO"
        kicker="IPO"
        accent="ipo"
        description="Dates, price bands, GMP and subscription for mainboard and SME issues, with status worked out from the issue calendar."
        crumbs={[{ label: "Home", href: "/" }]}
      >
        <p className="note note-sample max-w-3xl">{IPO_NOTE}</p>
      </SectionMasthead>
    <div className="wrap pt-6">
      <div>
        <Suspense fallback={<div aria-hidden className="lazy-slot h-96" data-label="IPO dashboard" />}>
          <IpoDashboard ipos={ipos} buildDate={istToday()} />
        </Suspense>
      </div>

      <section className="mt-16" aria-label="IPO news">
        <SectionHeader title="IPO news and allotment" accent="ipo" />
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-0">
          {lead ? (
            <div className="lg:border-r lg:border-rule lg:pr-8">
              <LeadStory story={lead} />
            </div>
          ) : null}
          <div className="divide-y divide-rule border-t border-rule lg:-mt-5 lg:border-t-0 lg:pl-8">
            {rest.slice(0, 6).map((s) => (
              <StoryRow key={s.slug} story={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="surface-ink -mx-4 mt-14 grid gap-px bg-rule sm:mx-0 md:grid-cols-3" aria-label="IPO guides">
        <div className="story bg-black px-5 py-5">
          <p className="kicker text-ipo">New to IPOs?</p>
          <Link href="/stock-market-iq/what-is-an-ipo/" className="headline mt-1.5 block text-xl">
            What is an IPO: meaning, types, process and eligibility
          </Link>
        </div>
        <div className="story bg-black px-5 py-5">
          <p className="kicker text-ipo">Allotment</p>
          <Link href="/ipo/nse-ipo-allotment-status/" className="headline mt-1.5 block text-xl">
            How to check IPO allotment status on BSE and the registrar’s site
          </Link>
        </div>
        <div className="story bg-black px-5 py-5">
          <p className="kicker text-ipo">Before you apply</p>
          <Link href="/stock-market-iq/how-to-select-best-stocks/" className="headline mt-1.5 block text-xl">
            How to judge a company before you invest
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
