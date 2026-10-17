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
    <>
    <div className="surface-paper-2 border-b border-rule">
      <div className="wrap pb-8 pt-4 md:pb-10 md:pt-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Board of Directors", href: "/board-of-directors/" }]} current={author.name} />

      <header className="mt-3 grid gap-5 border-t-3 border-ink pt-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-7">
        <AuthorAvatar author={author} size={120} />
        <div className="max-w-[66ch]">
          <h1 className="headline text-4xl md:text-5xl">{author.name}</h1>
          <p className="mt-1.5 text-md font-semibold text-ink">{author.role}, TradeTarget</p>
          <p className="deck mt-3 text-lg leading-normal md:text-xl">{author.shortBio}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Expertise">
            {author.expertise.map((e) => (
              <li key={e} className="tag">
                {e}
              </li>
            ))}
          </ul>
          <dl className="dateline mt-6 border-b border-rule">
            <div>
              <dt>Stories</dt>
              <dd>{stories.length}</dd>
            </div>
            <div>
              <dt>Profile</dt>
              <dd>
                <Link href={`/board-of-directors/#${author.slug}`} className="link">
                  Board of Directors
                </Link>
              </dd>
            </div>
            {author.linkedin && (
              <div>
                <dt>Follow</dt>
                <dd>
                  <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="link">
                    LinkedIn
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>
      </div>
    </div>
    <div className="wrap">

      <section className="mt-10 max-w-4xl md:mt-12" aria-label="Stories">
        <SectionHeader title={stories.length ? `Stories by ${first}` : "Stories"} />
        {stories.length ? (
          <PaginatedStories stories={stories} perPage={8} />
        ) : (
          <div role="status" className="empty mt-4">
            <p className="empty-title">No stories from {author.name} yet</p>
            <p className="empty-text">
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
    </>
  );
}
