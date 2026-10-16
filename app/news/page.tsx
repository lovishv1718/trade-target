import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { IpoThisWeek } from "@/components/home/ipo-week";
import { MarketsBoard } from "@/components/home/markets-board";
import { NewsListing } from "@/components/listing/news-listing";
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
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="News" />
      <header className="mt-4 border-b border-rule pb-5">
        <p className="kicker text-accent-ink">News</p>
        <h1 className="headline mt-1 text-[2.2rem] leading-tight md:text-[2.7rem]">Markets and business news</h1>
        <p className="mt-2 max-w-2xl text-[1.05rem] text-[#3a4453]">Quarterly results, IPOs, commodities, mutual funds and the moves that matter to Indian investors.</p>
      </header>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <LeadStory story={lead} priority />
        <div className="grid gap-6">
          <StoryTile story={second} standfirst />
          <StoryTile story={third} />
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="All stories">
          <h2 className="headline section-rule pt-2.5 text-[1.5rem]">All stories</h2>
          <div className="mt-4">
            <Suspense fallback={null}>
              <NewsListing stories={stories} topics={topics} />
            </Suspense>
          </div>
        </section>
        <aside className="space-y-6">
          <MarketsBoard />
          <IpoThisWeek ipos={getIpos()} buildDate={istToday()} />
        </aside>
      </div>
    </div>
  );
}
