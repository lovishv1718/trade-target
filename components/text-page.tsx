import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { SmartLink } from "./article/mdx-parts";
import { Breadcrumbs } from "./breadcrumbs";
import { formatDate } from "@/lib/format";

function load(slug: string) {
  const file = path.join(process.cwd(), "content", "pages", `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { title: data.title as string, description: data.description as string, updated: data.updated as string, body: content };
}

/** "## " headings in the MDX source, slugged the same way rehype-slug slugs the rendered h2s. */
function outline(body: string) {
  const slugger = new GithubSlugger();
  const out: { id: string; text: string }[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (/^(```|~~~)/.test(line.trim())) fenced = !fenced;
    if (fenced) continue;
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    // Every heading advances the slugger so duplicate-suffixes match rehype-slug.
    const id = slugger.slug(text);
    if (m[1].length === 2) out.push({ id, text });
  }
  return out;
}

export function textPageMetadata(slug: string): Metadata {
  const p = load(slug);
  return { title: p.title, description: p.description, alternates: { canonical: `/${slug}/` } };
}

function Contents({ items, className = "border-y" }: { items: { id: string; text: string }[]; className?: string }) {
  return (
    <ol className={`divide-y divide-rule border-rule text-sm ${className}`}>
      {items.map((h, i) => (
        <li key={h.id}>
          <a href={`#${h.id}`} className="link-soft flex min-h-11 items-baseline gap-3 py-2.5 leading-snug">
            <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
            <span>{h.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Plain text pages (legal, policies) stored as MDX in /content/pages, laid out as a document:
 * a paper-2 masthead with the title, the deck and a small ledger (updated, sections, reading
 * time); then a numbered contents rail beside a numbered body, the numbers matching.
 */
export function TextPage({ slug }: { slug: string }) {
  const p = load(slug);
  const toc = outline(p.body);
  const minutes = Math.max(1, Math.round(p.body.split(/\s+/).length / 230));
  return (
    <>
      <div className="surface-paper-2 border-b border-rule">
        <div className="wrap pb-8 pt-4 md:pb-10 md:pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }]} current={p.title} />
          <header className="mt-3 grid gap-6 border-t-3 border-ink pt-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end lg:gap-14 xl:grid-cols-[minmax(0,1fr)_17rem]">
            <div>
              <h1 className="headline text-balance text-4xl md:text-5xl">{p.title}</h1>
              <p className="deck mt-3 max-w-[60ch] text-lg leading-normal md:text-xl">{p.description}</p>
            </div>
            <dl className="dateline lg:flex-col lg:border-t-0 lg:border-l lg:pl-4 [&>div]:lg:mr-0 [&>div]:lg:border-r-0 [&>div]:lg:border-b [&>div]:lg:py-2 [&>div:last-child]:lg:border-b-0">
              <div>
                <dt>Last updated</dt>
                <dd>
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </dd>
              </div>
              {toc.length > 1 ? (
                <div>
                  <dt>Sections</dt>
                  <dd>{toc.length}</dd>
                </div>
              ) : null}
              <div>
                <dt>Read</dt>
                <dd>{minutes} min</dd>
              </div>
            </dl>
          </header>
        </div>
      </div>
      <div className="wrap pt-8 md:pt-10">
        <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-14 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-x-20">
          <article className="lg:col-start-2">
            {toc.length > 1 && (
              <details className="art-disclosure group mb-8 lg:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between border-y border-ink text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  <span className="kicker">
                    On this page <span className="font-normal tabular-nums text-muted">({toc.length})</span>
                  </span>
                  <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted transition-transform duration-150 ease-out group-open:rotate-180 motion-reduce:transition-none">
                    <path d="M2.5 4.5 6 8l3.5-3.5" />
                  </svg>
                </summary>
                <div className="art-disclosure-body">
                  <Contents items={toc} className="border-b" />
                </div>
              </details>
            )}
            <div className="article-body doc-body max-w-[66ch]">
              <MDXRemote source={p.body} components={{ a: SmartLink }} options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }} />
            </div>
          </article>
          {toc.length > 1 && (
            <nav aria-labelledby="toc-heading" className="hidden lg:col-start-1 lg:row-start-1 lg:block">
              <div className="sticky top-20">
                <h2 id="toc-heading" className="kicker border-t-3 border-ink pb-2 pt-2.5 text-ink">
                  On this page
                </h2>
                <Contents items={toc} />
              </div>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
