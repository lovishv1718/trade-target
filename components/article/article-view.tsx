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

  return (
    <>
      <div className="wrap pt-5 md:pt-7">
        <Breadcrumbs items={getArticleCrumbs(article)} current={article.title} />

        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-14">
          <article className="min-w-0 max-w-[760px]">
            <Kicker label={article.kicker} />
            <h1 className="headline mt-2 text-[2rem] leading-[1.12] md:text-[2.7rem]">{article.title}</h1>
            <p className="mt-4 text-[1.15rem] leading-relaxed text-[#3a4453] md:text-[1.25rem]">{article.standfirst}</p>

            <div className="mt-5 flex flex-col gap-4 border-y border-rule py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <AuthorAvatar author={author} size={46} />
                <div className="text-sm leading-snug">
                  <p>
                    By{" "}
                    <Link prefetch={false} href={`/author/${author.slug}/`} className="font-semibold text-ink hover:underline">
                      {author.name}
                    </Link>
                    <span className="text-muted">, {author.role}</span>
                  </p>
                  <p className="text-muted">
                    {updated ? "Updated " : "Published "}
                    <time dateTime={updated ? article.modified : article.date}>{formatDateTime(updated ? article.modified : article.date)}</time>
                    <span> · {article.readTime} min read</span>
                  </p>
                </div>
              </div>
              <ShareButtons title={article.title} path={article.path} compact />
            </div>

            {article.image ? (
              <figure className="mt-6">
                <div className="relative aspect-[16/9] overflow-hidden bg-paper-2">
                  <Image src={article.image.src} alt={article.image.alt} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-2 text-[0.85rem] leading-snug text-muted">
                  {article.image.caption && article.image.caption !== article.title ? <span className="text-ink/80">{article.image.caption}. </span> : null}
                  <span>{credit}</span>
                </figcaption>
              </figure>
            ) : null}

            <div className="mt-6 space-y-4">
              <TableOfContents headings={headings} variant="inline" />
              {article.summary ? <KeyTakeaways text={article.summary} /> : null}
            </div>

            <div className="mt-7">
              <ArticleBody source={article.body} />
            </div>

            <FaqSection faqs={article.faqs} />

            {article.tags.length ? (
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-muted">Topics</span>
                {article.tags.map((t) => (
                  <span key={t} className="border border-rule bg-white px-2.5 py-1 text-sm text-[#3a4453]">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 border-t border-rule pt-5">
              <ShareButtons title={article.title} path={article.path} />
            </div>

            <div className="mt-8 space-y-6">
              <DisclaimerBox />
              <AuthorBox author={author} />
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-16 space-y-8 pt-1">
              <TableOfContents headings={headings} variant="rail" />
              {calcs.length ? (
                <div className="border-t-[3px] border-accent bg-white p-4">
                  <p className="kicker text-accent-ink">Work it out</p>
                  <ul className="mt-2 divide-y divide-rule">
                    {calcs.map((c) => (
                      <li key={c.slug}>
                        <Link prefetch={false} href={`/calculators/${c.slug}/`} className="flex items-center justify-between py-2.5 text-[0.95rem] font-semibold hover:text-accent-ink">
                          {c.name}
                          <span aria-hidden className="text-accent-ink">→</span>
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

      <div className="mt-14">
        <NewsletterBand id="article-newsletter" />
      </div>

      <section className="wrap mt-12" aria-label="Related stories">
        <SectionHeader title="Related stories" accent="accent" />
        <div className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((r) => (
            <StoryTile key={r.slug} story={r} />
          ))}
        </div>
      </section>

      <section className="wrap mt-12" aria-label="Latest">
        <SectionHeader title="Latest from TradeTarget" href="/news/" />
        <div className="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {latest.slice(0, 3).map((s) => (
            <StoryLink key={s.slug} story={s} />
          ))}
        </div>
      </section>

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
