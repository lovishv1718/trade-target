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
      <SectionMasthead title={section.name} description={section.description} accent="accent" crumbs={[{ label: "Home", href: "/" }]} count={stories.length} />
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
          <section aria-label="Start here" className="bg-white p-5">
            <p className="kicker text-accent-ink">Start here</p>
            <ol className="mt-2 space-y-3">
              {stories.slice(0, 5).map((s, i) => (
                <li key={s.slug} className="flex gap-3">
                  <span className="headline text-xl text-accent/80">{i + 1}</span>
                  <Link href={s.path} className="font-semibold leading-snug hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
          <section aria-label="Calculators">
            <SectionHeader title="Put it to work" accent="accent" />
            <ul className="mt-2 divide-y divide-rule">
              {tools.map((c) => (
                <li key={c.slug}>
                  <Link href={`/calculators/${c.slug}/`} className="flex justify-between py-2.5 font-semibold hover:text-accent-ink">
                    {c.name} <span aria-hidden className="text-accent-ink">→</span>
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
