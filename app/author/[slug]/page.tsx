import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorAvatar } from "@/components/article/article-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { PaginatedStories } from "@/components/listing/paginated-stories";
import { getArticleCards, getAuthors } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAuthors().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = getAuthors().find((x) => x.slug === slug);
  if (!a) return {};
  return { title: `${a.name}, ${a.role}`, description: a.shortBio, alternates: { canonical: `/author/${a.slug}/` } };
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const author = getAuthors().find((a) => a.slug === slug);
  if (!author) notFound();
  const stories = getArticleCards().filter((s) => s.author === author.slug);
  return (
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Board of Directors", href: "/board-of-directors/" }]} current={author.name} />
      <header className="mt-6 flex flex-col gap-6 border-b border-rule pb-8 sm:flex-row sm:items-center">
        <AuthorAvatar author={author} size={120} />
        <div className="max-w-2xl">
          <h1 className="headline text-[2.2rem] leading-tight">{author.name}</h1>
          <p className="font-semibold text-accent-ink">{author.role}, TradeTarget</p>
          <p className="mt-2 text-[1.03rem] leading-relaxed text-[#3a4453]">{author.shortBio}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {author.expertise.map((e) => (
              <li key={e} className="border border-rule bg-white px-2 py-0.5 text-xs font-semibold text-muted">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </header>
      <section className="mt-8 max-w-4xl" aria-label="Stories">
        <h2 className="headline text-[1.5rem]">{stories.length ? `Stories by ${author.name.split(" ")[0]}` : "Stories"}</h2>
        {stories.length ? (
          <PaginatedStories stories={stories} perPage={8} />
        ) : (
          <p className="mt-3 text-muted">
            {author.name.split(" ")[0]} leads TradeTarget’s research desk. Read the latest{" "}
            <Link href="/share-analysis/" className="text-ipo underline">
              Share Analysis
            </Link>
            .
          </p>
        )}
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: author.name,
          jobTitle: author.role,
          worksFor: { "@type": "Organization", name: "TradeTarget" },
          url: `https://tradetarget.in/author/${author.slug}/`,
          description: author.shortBio,
        }}
      />
    </div>
  );
}
