import type { Metadata } from "next";
import Link from "next/link";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { SectionHeader } from "@/components/section-header";
import { LeadStory, StoryTile } from "@/components/story";
import { getArticlesBySection, getCalculators, getSection, toCard } from "@/lib/content";

export const metadata: Metadata = {
  title: "Stock Market IQ: Trading and Investing Explained",
  description: "Plain-language explainers on IPOs, trading styles, candlestick patterns, dividends, commodities exchanges and investing basics.",
  alternates: { canonical: "/stock-market-iq/" },
};

export default function StockMarketIqPage() {
  const section = getSection("stock-market-iq")!;
  const stories = getArticlesBySection("stock-market-iq").map(toCard);
  const [lead, ...rest] = stories;
  const tools = getCalculators().filter((c) => ["sip-calculator", "cagr-calculator", "lumpsum-calculator", "step-up-sip-calculator"].includes(c.slug));
  return (
    <>
      <SectionMasthead title={section.name} description={section.description} accent="learn" crumbs={[{ label: "Home", href: "/" }]} count={stories.length} />
      <div className="wrap mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <LeadStory story={lead} priority />
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((s) => (
              <StoryTile key={s.slug} story={s} standfirst />
            ))}
          </div>
        </div>
        <aside className="space-y-8">
          <section aria-label="Start here" className="border-t-[3px] border-learn pt-3">
            <p className="kicker text-learn">Start here</p>
            <ol className="mt-2 divide-y divide-rule">
              {stories.slice(0, 5).map((s, i) => (
                <li key={s.slug} className="flex gap-3 py-3">
                  <span aria-hidden className="tabular w-5 shrink-0 text-xl font-semibold leading-snug text-learn">{i + 1}</span>
                  <Link href={s.path} className="text-md font-semibold leading-snug underline-offset-2 hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
          <section aria-label="Calculators">
            <SectionHeader title="Put it to work" accent="learn" />
            <ul className="mt-2 divide-y divide-rule">
              {tools.map((c) => (
                <li key={c.slug}>
                  <Link href={`/calculators/${c.slug}/`} className="group flex min-h-11 items-center justify-between gap-3 py-2 font-semibold underline-offset-2 hover:underline">
                    {c.name} <span aria-hidden className="text-learn transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
