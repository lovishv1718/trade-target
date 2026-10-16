import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllArticles,
  getArticleByPath,
  getArticleCrumbs,
  getAuthor,
  getCalculator,
  getHeadings,
  getRelated,
  toCard,
  type Article,
} from "@/lib/content";
import { formatDateTime } from "@/lib/format";
import { Breadcrumbs } from "../breadcrumbs";
import { JsonLd } from "../json-ld";
import { Kicker } from "../kicker";
import { NewsletterBand } from "../newsletter-band";
import { SectionHeader } from "../section-header";
import { StoryLink, StoryTile } from "../story";
import { ArticleBody } from "./article-body";
import { AuthorAvatar, AuthorBox, DisclaimerBox, FaqSection, KeyTakeaways } from "./article-parts";
import { ReadingProgress } from "./reading-progress";
import { ShareButtons } from "./share-buttons";
import { TableOfContents } from "./toc";

const CALCS_FOR: Record<string, string[]> = {
  retirement: ["epf-calculator", "ppf-calculator", "nps-calculator"],
  taxation: ["income-tax-calculator", "hra-calculator"],
  loan: ["personal-loan-emi-calculator", "home-loan-emi-calculator"],
  "banking-and-fixed-deposit": ["fd-calculator", "rd-calculator"],
  "government-scheme": ["ppf-calculator", "nps-calculator"],
  insurance: ["retirement-calculator", "sip-calculator"],
  "document-guides": ["income-tax-calculator", "sip-calculator"],
  ipo: ["lumpsum-calculator", "cagr-calculator"],
  "share-analysis": ["cagr-calculator", "lumpsum-calculator"],
  "blog-junction": ["sip-calculator", "step-up-sip-calculator"],
  "stock-market-iq": ["sip-calculator", "cagr-calculator"],
  news: ["sip-calculator", "lumpsum-calculator"],
};

export function articleFor(path: string): Article {
  const article = getArticleByPath(path);
  if (!article) notFound();
  return article;
}

export function articleMetadata(path: string): Metadata {
  const a = getArticleByPath(path);
  if (!a) return {};
  return {
    title: a.title,
    description: a.standfirst,
    alternates: { canonical: a.path },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.standfirst,
      url: a.path,
      publishedTime: a.date,
      modifiedTime: a.modified,
      images: a.image ? [{ url: a.image.src, width: 1200, alt: a.image.alt }] : undefined,
    },
    keywords: a.tags,
  };
}

export function ArticleView({ article }: { article: Article }) {
  const author = getAuthor(article.author);
  const headings = getHeadings(article.body);
  const related = getRelated(article, 4).map(toCard);
  const latest = getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 5)
    .map(toCard);
  const calcs = (CALCS_FOR[article.subsection ?? ""] ?? CALCS_FOR[article.section] ?? []).map((s) => getCalculator(s)).filter((c) => c !== null);
  const updated = new Date(article.modified).getTime() - new Date(article.date).getTime() > 3600_000;
  const credit = article.image?.credit && article.image.credit !== "TradeTarget" ? `Photo: ${article.image.credit}` : "Image: TradeTarget";

  const stamp = (iso: string) => <time dateTime={iso}>{formatDateTime(iso)}</time>;

  return (
    <>
      <ReadingProgress targetId="article-main" />
      <div className="wrap pt-5 md:pt-7">
        <Breadcrumbs items={getArticleCrumbs(article)} current={article.title} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-14">
          <article id="article-main" className="min-w-0 max-w-[760px]">
            <header>
              <Kicker label={article.kicker} />
              <h1 className="headline mt-3 max-w-[22ch] text-balance text-3xl md:text-4xl xl:text-5xl">{article.title}</h1>
              <p className="mt-4 max-w-[60ch] text-lg leading-normal text-ink-2 md:mt-5 md:text-xl">{article.standfirst}</p>

              <div className="mt-6 flex flex-col gap-4 border-y border-rule py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="flex min-w-0 items-center gap-3">
                  <AuthorAvatar author={author} size={44} />
                  <div className="min-w-0">
                    <p className="text-md leading-snug text-ink-2">
                      By{" "}
                      <Link prefetch={false} href={`/author/${author.slug}/`} className="font-semibold text-ink decoration-1 underline-offset-4 hover:underline">
                        {author.name}
                      </Link>
                      <span className="text-muted">, {author.role}</span>
                    </p>
                    <p className="tabular mt-1 flex flex-wrap gap-x-2 text-sm leading-snug text-muted">
                      <span>Published {stamp(article.date)}</span>
                      {updated ? (
                        <>
                          <span aria-hidden>·</span>
                          <span>Updated {stamp(article.modified)}</span>
                        </>
                      ) : null}
                      <span aria-hidden>·</span>
                      <span>{article.readTime} min read</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <ShareButtons title={article.title} path={article.path} compact />
                </div>
              </div>
            </header>

            {article.image ? (
              <figure className="mt-6">
                <div className="relative aspect-[16/9] overflow-hidden bg-paper-2">
                  <Image
                    src={article.image.src}
                    alt={article.image.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 760px, 100vw"
                    className="img-fade object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-sm leading-normal text-ink-2">
                  {article.image.caption && article.image.caption !== article.title ? <span>{article.image.caption}. </span> : null}
                  <span className="text-xs text-muted">{credit}</span>
                </figcaption>
              </figure>
            ) : null}

            {/* Reading column: one measure (66ch of body type) for everything the reader reads */}
            <div className="mt-8 max-w-[66ch] text-lg">
              {article.summary || headings.length > 1 ? (
                <div className="mb-8 space-y-6">
                  {article.summary ? <KeyTakeaways text={article.summary} /> : null}
                  <TableOfContents headings={headings} variant="inline" />
                </div>
              ) : null}

              <ArticleBody source={article.body} />

              <FaqSection faqs={article.faqs} />

              <div className="mt-12 space-y-5 border-t border-rule pt-5">
                {article.tags.length ? (
                  <div>
                    <p className="kicker text-muted">Topics</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {article.tags.map((t) => (
                        <li key={t} className="tag">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <ShareButtons title={article.title} path={article.path} />
              </div>

              <div className="mt-10 space-y-10">
                <DisclaimerBox />
                <AuthorBox author={author} />
              </div>
            </div>
          </article>

          <aside className="hidden lg:block" aria-label="Article tools">
            <div className="sticky top-20 space-y-10 pt-1">
              <TableOfContents headings={headings} variant="rail" />
              {calcs.length ? (
                <div className="border-t-2 border-ink pt-3">
                  <p className="kicker text-ink">Work it out</p>
                  <ul className="mt-2 divide-y divide-rule border-b border-rule">
                    {calcs.map((c) => (
                      <li key={c.slug}>
                        <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex min-h-11 items-center justify-between gap-3 py-2 text-md font-semibold text-ink">
                          <span className="decoration-1 underline-offset-4 group-hover:underline">{c.name}</span>
                          <span aria-hidden className="text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {/* End of article: what to read next, on the same grid as the article and its rail */}
      <div className="wrap mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:gap-14">
        {related.length ? (
          <section aria-label="Related stories" className="min-w-0">
            <SectionHeader title="Related stories" accent="var(--color-ink)" />
            <div className="mt-5 grid gap-x-6 gap-y-10 sm:grid-cols-2">
              {related.map((r) => (
                <StoryTile key={r.slug} story={r} headingSize="text-lg" />
              ))}
            </div>
          </section>
        ) : null}

        <section aria-label="Latest" className="min-w-0">
          <SectionHeader title="Latest from TradeTarget" href="/news/" accent="var(--color-ink)" />
          <ul className="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-1">
            {latest.map((s) => (
              <li key={s.slug} className="border-b border-rule last:border-b-0">
                <StoryLink story={s} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-16">
        <NewsletterBand id="article-newsletter" />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": article.section === "news" || article.section === "ipo" ? "NewsArticle" : "Article",
          headline: article.title,
          description: article.standfirst,
          image: article.image ? [`https://tradetarget.in${article.image.src}`] : undefined,
          datePublished: `${article.date}+05:30`,
          dateModified: `${article.modified}+05:30`,
          author: { "@type": "Person", name: author.name, jobTitle: author.role, url: `https://tradetarget.in/author/${author.slug}/` },
          publisher: { "@type": "Organization", name: "TradeTarget", url: "https://tradetarget.in" },
          mainEntityOfPage: `https://tradetarget.in${article.path}`,
          articleSection: article.kicker,
          keywords: article.tags.join(", "),
        }}
      />
    </>
  );
}
