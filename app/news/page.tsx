import type { Metadata } from "next";
import { Suspense } from "react";
import { IpoThisWeek } from "@/components/home/ipo-week";
import { MarketsBoard } from "@/components/home/markets-board";
import { NewsListing } from "@/components/listing/news-listing";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { SectionHeader } from "@/components/section-header";
import { LeadStory, StoryTile } from "@/components/story";
import { getArticleCards, getEditorial } from "@/lib/content";
import { getIpos, istToday } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "Stock Market News: Results, IPOs, Commodities and Funds",
  description: "Latest Indian stock market news from TradeTarget: quarterly results, IPO allotment and listing, gold and silver prices, mutual funds and market moves.",
  alternates: { canonical: "/news/" },
};

export default function NewsPage() {
  const topics = getEditorial().newsTopics;
  const stories = getArticleCards().filter((a) => a.section === "news" || a.section === "ipo" || topics.includes(a.kicker));
  const [lead, second, third] = stories.filter((s) => s.section === "news");
  return (
    <>
      <SectionMasthead
        title="Markets and business news"
        crumb="News"
        kicker="News"
        description="Quarterly results, IPOs, commodities, mutual funds and the moves that matter to Indian investors."
        crumbs={[{ label: "Home", href: "/" }]}
        count={stories.length}
      />
      <div className="wrap pt-6 md:pt-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-0">
          <div className="md:border-r md:border-rule md:pr-8">
            <LeadStory story={lead} priority sizes="(min-width: 1024px) 700px, (min-width: 768px) 440px, 100vw" />
          </div>
          <div className="grid content-start gap-6 border-t border-rule md:border-t-0 md:pl-8">
            <StoryTile story={second} standfirst />
            <StoryTile story={third} />
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-labelledby="all-stories">
            <SectionHeader title="All stories" accent="ink" />
            <div className="mt-4">
              <Suspense fallback={<div aria-hidden className="lazy-slot h-96" data-label="Stories" />}>
                <NewsListing stories={stories} topics={topics} />
              </Suspense>
            </div>
          </section>
          <aside className="grid content-start gap-6 self-start">
            <MarketsBoard />
            <IpoThisWeek ipos={getIpos()} buildDate={istToday()} />
          </aside>
        </div>
      </div>
    </>
  );
}
