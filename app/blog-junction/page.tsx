import type { Metadata } from "next";
import { PaginatedStories } from "@/components/listing/paginated-stories";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { SectionHeader } from "@/components/section-header";
import { StoryLink, StoryTile } from "@/components/story";
import { getArticleCards, getArticlesBySection, getSection, toCard } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog Junction: Fund Comparisons, Brand Stories and Long Reads",
  description: "Mutual fund comparisons, new AMCs, credit cards, commodities and the business stories behind Indian brands.",
  alternates: { canonical: "/blog-junction/" },
};

export default function BlogJunctionPage() {
  const section = getSection("blog-junction")!;
  const stories = getArticlesBySection("blog-junction").map(toCard);
  const [first, second, ...rest] = stories;
  const funds = getArticleCards().filter((a) => a.kicker === "Funds" && a.section !== "blog-junction");
  return (
    <>
      <SectionMasthead title={section.name} description={section.description} accent="money" crumbs={[{ label: "Home", href: "/" }]} count={stories.length} />
      <div className="wrap mt-6">
        <div className="grid gap-8 md:grid-cols-2">
          <StoryTile story={first} standfirst crop="wide" headingSize="text-2xl" sizes="(min-width: 768px) 600px, 100vw" />
          <StoryTile story={second} standfirst crop="wide" headingSize="text-2xl" sizes="(min-width: 768px) 600px, 100vw" />
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-label="More from Blog Junction">
            <SectionHeader title="More reads" accent="money" />
            <PaginatedStories stories={rest} perPage={6} />
          </section>
          <aside>
            <SectionHeader title="Funds desk" accent="money" pin={false} />
            <div className="divide-y divide-rule">
              {funds.map((s) => (
                <StoryLink key={s.slug} story={s} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
