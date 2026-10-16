import type { Metadata } from "next";
import Link from "next/link";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { Kicker } from "@/components/kicker";
import { Photo } from "@/components/photo";
import { SectionHeader } from "@/components/section-header";
import { StoryMeta, StoryTile } from "@/components/story";
import { getArticlesBySection, getSection, toCard } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Share Analysis: Fundamental Analysis of Indian Stocks",
  description: "Fundamental analysis of listed Indian companies: financials, key ratios, shareholding pattern, peers and business overview.",
  alternates: { canonical: "/share-analysis/" },
};

const company = (title: string) => title.replace(/\s*[–-]\s*SAIL/, "").replace(/\s*Fundamental Analysis\s*$/i, "").trim();

export default function ShareAnalysisPage() {
  const section = getSection("share-analysis")!;
  const stories = getArticlesBySection("share-analysis").map(toCard);
  const [lead, ...rest] = stories;
  return (
    <>
      <SectionMasthead title={section.name} description={section.description} accent="company" crumbs={[{ label: "Home", href: "/" }]} count={stories.length} />
      <div className="wrap mt-6">
        <article className="border-b border-rule pb-8">
          <Link prefetch={false} href={lead.path} className="group grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
            <Photo image={lead.image} sizes="(min-width: 768px) 700px, 100vw" aspect="aspect-[16/9]" priority />
            <div>
              <Kicker label="Fundamental analysis" />
              <h2 className="headline mt-1.5 text-3xl md:text-4xl">{lead.title}</h2>
              <p className="mt-3 text-md leading-relaxed text-ink-2 md:text-lg md:leading-relaxed">{lead.standfirst}</p>
              <StoryMeta story={lead} className="mt-3" />
            </div>
          </Link>
        </article>

        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((s) => (
            <StoryTile key={s.slug} story={{ ...s, kicker: "Share Analysis" }} standfirst />
          ))}
        </div>

        <section className="mt-14" aria-label="Companies covered">
          <SectionHeader title="Companies covered" accent="company" />
          <div className="table-wrap mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Published</th>
                  <th className="text-right">Read time</th>
                </tr>
              </thead>
              <tbody>
                {[...stories]
                  .sort((a, b) => company(a.title).localeCompare(company(b.title)))
                  .map((s) => (
                    <tr key={s.slug}>
                      <td>
                        <Link prefetch={false} href={s.path} className="font-semibold underline-offset-2 hover:underline">
                          {company(s.title)}
                        </Link>
                      </td>
                      <td className="tabular">{formatDate(s.date)}</td>
                      <td className="tabular text-right">{s.readTime} min</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
