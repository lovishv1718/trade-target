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
          <a href={`#${h.id}`} className="flex min-h-11 items-baseline gap-3 py-2.5 leading-snug text-ink-2 hover:text-ink hover:underline hover:underline-offset-2">
            <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
            <span>{h.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Plain text pages (legal, policies) stored as MDX in /content/pages. */
export function TextPage({ slug }: { slug: string }) {
  const p = load(slug);
  const toc = outline(p.body);
  return (
    <div className="wrap pb-16 pt-5 md:pb-20 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current={p.title} />
      <div className="mt-6 md:mt-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-14 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-x-20">
        <article className="lg:col-start-2">
          <header className="max-w-[66ch] border-b border-ink pb-5 md:pb-6">
            <h1 className="headline text-3xl md:text-4xl">{p.title}</h1>
            <p className="mt-3 text-lg leading-normal text-ink-2">{p.description}</p>
            <p className="mt-4 text-sm tabular-nums text-muted">
              Last updated <time dateTime={p.updated}>{formatDate(p.updated)}</time>
            </p>
          </header>
          {toc.length > 1 && (
            <details className="group mt-5 lg:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between border-y border-rule text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <span>
                  On this page <span className="font-normal tabular-nums text-muted">({toc.length})</span>
                </span>
                <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted transition-transform duration-150 ease-out group-open:rotate-180 motion-reduce:transition-none">
                  <path d="M2.5 4.5 6 8l3.5-3.5" />
                </svg>
              </summary>
              <Contents items={toc} className="border-b" />
            </details>
          )}
          <div className="article-body mt-6 max-w-[66ch] md:mt-8">
            <MDXRemote source={p.body} components={{ a: SmartLink }} options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }} />
          </div>
        </article>
        {toc.length > 1 && (
          <nav aria-labelledby="toc-heading" className="hidden lg:col-start-1 lg:row-start-1 lg:block">
            <div className="sticky top-24 pt-1.5">
              <h2 id="toc-heading" className="kicker pb-2 text-muted">
                On this page
              </h2>
              <Contents items={toc} />
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
