import Link from "next/link";
import { getCompany, type ArticleCard } from "@/lib/content";

/**
 * A share-analysis story set as a company card, with no picture: the NSE symbol and sector, a
 * monogram, the company's name, the standfirst and what the analysis covers. The cover art for
 * these stories is a branded banner, so type does the work instead and every card matches.
 */
export function CompanyCard({ story, headingLevel = "h3" }: { story: ArticleCard; headingLevel?: "h2" | "h3" }) {
  const company = getCompany(story.slug);
  const Heading = headingLevel;
  const name = company?.name ?? story.title.replace(/\s*Fundamental Analysis\s*$/i, "");
  return (
    <article className="pm-card pm-lift group h-full">
      <Link prefetch={false} href={story.path} className="flex h-full flex-col p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <span aria-hidden className="pm-monogram">
            {company?.mark ?? name.slice(0, 2).toUpperCase()}
          </span>
          {company ? (
            <span className="text-right">
              <span className="pm-meta block text-ink">NSE · {company.ticker}</span>
              <span className="pm-meta mt-1 block">{company.sector}</span>
            </span>
          ) : null}
        </div>
        <Heading className="mt-8 font-serif text-2xl font-medium leading-tight tracking-tight text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{name}</Heading>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-2">{story.standfirst}</p>
        {company ? (
          <p className="mt-6 border-t border-rule pt-4 text-sm leading-relaxed text-muted">
            <span className="sr-only">Covers: </span>
            {company.covers.slice(0, 4).join(" · ")}
          </p>
        ) : null}
        <span className="mt-auto flex items-center justify-between pt-6">
          <span className="pm-meta">{story.readTime} min read</span>
          <span className="pm-arrow text-faint group-hover:text-accent" aria-hidden>
            →
          </span>
        </span>
      </Link>
    </article>
  );
}
