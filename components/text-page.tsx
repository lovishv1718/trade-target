import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { SmartLink } from "./article/mdx-parts";
import { Breadcrumbs } from "./breadcrumbs";
import { formatDate } from "@/lib/format";

function load(slug: string) {
  const file = path.join(process.cwd(), "content", "pages", `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { title: data.title as string, description: data.description as string, updated: data.updated as string, body: content };
}

export function textPageMetadata(slug: string): Metadata {
  const p = load(slug);
  return { title: p.title, description: p.description, alternates: { canonical: `/${slug}/` } };
}

/** Plain text pages (legal, policies) stored as MDX in /content/pages. */
export function TextPage({ slug }: { slug: string }) {
  const p = load(slug);
  return (
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current={p.title} />
      <article className="mx-auto mt-6 max-w-[720px]">
        <h1 className="headline text-[2.2rem] leading-tight md:text-[2.6rem]">{p.title}</h1>
        <p className="mt-2 text-[1.05rem] text-[#3a4453]">{p.description}</p>
        <p className="mt-3 border-b border-rule pb-4 text-sm text-muted">Last updated {formatDate(p.updated)}</p>
        <div className="article-body mt-6">
          <MDXRemote source={p.body} components={{ a: SmartLink }} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
      </article>
    </div>
  );
}
