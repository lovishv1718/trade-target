// Build-time access to everything under /content. Kept behind small functions so the
// source can later be swapped for Payload CMS queries without touching the pages.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import authorsJson from "@/content/authors.json";
import sectionsJson from "@/content/sections.json";
import editorialJson from "@/content/editorial.json";
import photoCreditsJson from "@/content/photo-credits.json";
import calculatorsJson from "@/content/calculators.json";
import companiesJson from "@/content/companies.json";

export type ArticleImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string | null;
  credit?: string | null;
};

export type Faq = { q: string; a: string };

export type Article = {
  title: string;
  slug: string;
  path: string;
  section: string;
  subsection: string | null;
  date: string;
  modified: string;
  author: string;
  standfirst: string;
  summary: string | null;
  tags: string[];
  readTime: number;
  image: ArticleImage | null;
  faqs: Faq[];
  source: string;
  kicker: string;
  body: string;
};

export type ArticleCard = Omit<Article, "body" | "faqs">;

export type Author = (typeof authorsJson)[number];
export type Section = (typeof sectionsJson)[number];
export type PhotoCredit = (typeof photoCreditsJson)[number];
export type CalculatorMeta = (typeof calculatorsJson)[number];

const ARTICLE_DIR = path.join(process.cwd(), "content", "articles");
const kickers = editorialJson.kickers as Record<string, string>;

let cache: Article[] | null = null;

function load(): Article[] {
  if (cache) return cache;
  const files = fs.readdirSync(ARTICLE_DIR).filter((f) => f.endsWith(".mdx"));
  cache = files
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(ARTICLE_DIR, file), "utf8"));
      const section = sectionsJson.find((s) => s.slug === data.section);
      return {
        title: data.title,
        slug: data.slug,
        path: data.path,
        section: data.section,
        subsection: data.subsection ?? null,
        date: data.date,
        modified: data.modified,
        author: data.author,
        standfirst: data.standfirst ?? "",
        summary: data.summary ?? null,
        tags: data.tags ?? [],
        readTime: data.readTime ?? 3,
        image: data.image ?? null,
        faqs: data.faqs ?? [],
        source: data.source,
        kicker: kickers[data.slug] ?? (data.section === "ipo" ? "IPO" : section?.name ?? "News"),
        body: content,
      } satisfies Article;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return cache;
}

export const toCard = ({ body: _body, faqs: _faqs, ...card }: Article): ArticleCard => card;

export function getAllArticles(): Article[] {
  return load();
}

export function getArticleCards(): ArticleCard[] {
  return load().map(toCard);
}

export function getArticleBySlug(slug: string) {
  return load().find((a) => a.slug === slug) ?? null;
}

export function getArticleByPath(p: string) {
  const norm = p.endsWith("/") ? p : `${p}/`;
  return load().find((a) => a.path === norm) ?? null;
}

/** Articles whose permalink starts with the given prefix and has exactly `extraSegments` more parts. */
export function getArticlePaths(prefix: string, extraSegments = 1) {
  const depth = prefix.split("/").filter(Boolean).length + extraSegments;
  return load()
    .filter((a) => a.path.startsWith(prefix) && a.path.split("/").filter(Boolean).length === depth)
    .map((a) => a.path.split("/").filter(Boolean));
}

export function getArticlesBySection(section: string, subsection?: string) {
  return load().filter((a) => a.section === section && (!subsection || a.subsection === subsection));
}

export function getArticlesBySlugs(slugs: string[]) {
  return slugs.map((s) => getArticleBySlug(s)).filter((a): a is Article => Boolean(a));
}

export function getRelated(article: Article, count = 4): Article[] {
  const others = load().filter((a) => a.slug !== article.slug);
  const score = (a: Article) =>
    (a.subsection && a.subsection === article.subsection ? 4 : 0) +
    (a.section === article.section ? 3 : 0) +
    (a.kicker === article.kicker ? 2 : 0) +
    a.tags.filter((t) => article.tags.includes(t)).length;
  return others
    .map((a) => ({ a, s: score(a) }))
    .sort((x, y) => y.s - x.s || (x.a.date < y.a.date ? 1 : -1))
    .slice(0, count)
    .map((x) => x.a);
}

export type Heading = { id: string; text: string; level: 2 | 3 };

/** Headings for the table of contents, with the same ids rehype-slug assigns. */
export function getHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^(#{2,4}) (.+)$/);
    if (!m) continue;
    const text = m[2].replace(/\\([\\`*_{}[\]()#+\-.!|])/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    const id = slugger.slug(text);
    if (m[1].length <= 3) out.push({ id, text, level: m[1].length as 2 | 3 });
  }
  const h2 = out.filter((h) => h.level === 2);
  return h2.length >= 3 ? h2 : out;
}

// Authors, sections, photos ------------------------------------------------------

export function getAuthors() {
  return authorsJson;
}

export function getAuthor(slug: string): Author {
  return authorsJson.find((a) => a.slug === slug) ?? authorsJson[0];
}

export function getSections() {
  return sectionsJson;
}

export function getSection(slug: string) {
  return sectionsJson.find((s) => s.slug === slug) ?? null;
}

export function getSubsections() {
  return sectionsJson.find((s) => s.slug === "personal-finance")?.subsections ?? [];
}

export function getPhotoCredits(): PhotoCredit[] {
  return photoCreditsJson;
}

export function getPhoto(id: string | null | undefined): ArticleImage | null {
  if (!id) return null;
  const p = photoCreditsJson.find((x) => x.id === id);
  if (!p) return null;
  return { src: p.src, width: p.width, height: p.height, alt: p.subject, caption: p.subject, credit: `${p.author} / ${p.source}, ${p.license}` };
}

export function getEditorial() {
  return editorialJson;
}

export function getCalculators(): CalculatorMeta[] {
  return calculatorsJson;
}

export function getCalculator(slug: string) {
  return calculatorsJson.find((c) => c.slug === slug) ?? null;
}

export type Company = { name: string; ticker: string; mark: string; sector: string; covers: string[]; summary?: string };

/** The company behind a share-analysis story: name, NSE symbol, sector and what the analysis covers. */
export function getCompany(slug: string): Company | null {
  return (companiesJson as Record<string, Company>)[slug] ?? null;
}

/** Breadcrumb trail for an article permalink. */
export function getArticleCrumbs(article: Article) {
  const section = getSection(article.section);
  const crumbs = [{ label: "Home", href: "/" }];
  if (section) crumbs.push({ label: section.name, href: section.path });
  if (article.section === "personal-finance" && article.subsection) {
    const sub = getSubsections().find((s) => s.slug === article.subsection);
    if (sub) crumbs.push({ label: sub.name, href: sub.path });
  }
  return crumbs;
}
