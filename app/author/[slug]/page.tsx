import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorAvatar } from "@/components/article/article-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { PaginatedStories } from "@/components/listing/paginated-stories";
import { SectionHeader } from "@/components/section-header";
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
  const first = author.name.split(" ")[0];
  return (
    <div className="wrap pb-16 pt-5 md:pb-20 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Board of Directors", href: "/board-of-directors/" }]} current={author.name} />

      <header className="mt-6 grid gap-5 border-b border-ink pb-7 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-7 md:mt-8 md:pb-9">
        <AuthorAvatar author={author} size={120} />
        <div className="max-w-[66ch]">
          <h1 className="headline text-3xl md:text-4xl">{author.name}</h1>
          <p className="mt-1.5 text-md font-semibold text-ink">{author.role}, TradeTarget</p>
          <p className="mt-3 text-lg leading-normal text-ink-2">{author.shortBio}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Expertise">
            {author.expertise.map((e) => (
              <li key={e} className="tag">
                {e}
              </li>
            ))}
          </ul>
          <dl className="mt-6 grid grid-cols-2 border-y border-rule text-sm sm:flex sm:flex-wrap sm:divide-x sm:divide-rule">
            <div className="py-2.5 pr-5">
              <dt className="text-xs text-muted">Stories</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-ink">{stories.length}</dd>
            </div>
            <div className="py-2.5 sm:px-5">
              <dt className="text-xs text-muted">Profile</dt>
              <dd className="mt-0.5">
                <Link href={`/board-of-directors/#${author.slug}`} className="link font-semibold">
                  Board of Directors
                </Link>
              </dd>
            </div>
            {author.linkedin && (
              <div className="col-span-2 border-t border-rule py-2.5 sm:border-t-0 sm:px-5">
                <dt className="text-xs text-muted">Follow</dt>
                <dd className="mt-0.5">
                  <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="link font-semibold">
                    LinkedIn
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <section className="mt-9 max-w-4xl md:mt-12" aria-label="Stories">
        <SectionHeader title={stories.length ? `Stories by ${first}` : "Stories"} />
        {stories.length ? (
          <PaginatedStories stories={stories} perPage={8} />
        ) : (
          <div className="mt-4 border-l-2 border-rule-strong py-1 pl-5">
            <p className="text-lg font-semibold text-ink">No stories from {author.name} yet</p>
            <p className="mt-1.5 max-w-[60ch] text-md text-ink-2">
              {first} leads TradeTarget’s research desk. Read the latest{" "}
              <Link href="/share-analysis/" className="link">
                Share Analysis
              </Link>
              .
            </p>
            <Link href="/news/" className="link-more mt-2">
              Latest news <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
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
