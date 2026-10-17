import type { Metadata } from "next";
import Link from "next/link";
import { AuthorAvatar } from "@/components/article/article-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getAuthors } from "@/lib/content";

export const metadata: Metadata = {
  title: "Board of Directors",
  description: "The leadership of TradeTarget: Hemant Bisht, Founder; Ramesh Bisht, Co-Founder; Kashish Sharma, Co-Founder.",
  alternates: { canonical: "/board-of-directors/" },
};

export default function BoardPage() {
  const team = getAuthors();
  return (
    <div className="wrap pb-16 pt-5 md:pb-20 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="Board of Directors" />
      <header className="mt-6 grid gap-6 border-b border-ink pb-7 md:mt-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:gap-16">
        <div className="max-w-3xl">
          <h1 className="headline text-3xl md:text-4xl lg:text-5xl">Board of Directors</h1>
          <p className="mt-3 text-lg leading-normal text-ink-2">Leadership that combines financial expertise with a content-first approach.</p>
        </div>
        {/* Directory: the board at a glance, each name jumps to the full profile */}
        <nav aria-label="Directors">
          <ol className="divide-y divide-rule border-y border-rule text-sm">
            {team.map((a, i) => (
              <li key={a.slug}>
                <a href={`#${a.slug}`} className="flex min-h-11 items-baseline gap-3 py-2 hover:underline hover:underline-offset-2">
                  <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold text-ink">{a.name}</span>
                  <span className="ml-auto text-muted">{a.role}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <div>
        {team.map((a) => (
          <article
            key={a.slug}
            id={a.slug}
            aria-labelledby={`${a.slug}-name`}
            className="grid scroll-mt-24 gap-x-10 gap-y-5 border-b border-rule py-8 md:grid-cols-[10rem_minmax(0,1fr)] md:py-10 lg:grid-cols-[10rem_minmax(0,1fr)_18rem] lg:gap-x-14"
          >
            <div>
              <AuthorAvatar author={a} size={160} />
            </div>
            <div className="max-w-[66ch]">
              <h2 id={`${a.slug}-name`} className="headline text-2xl md:text-3xl">
                {a.name}
              </h2>
              <p className="mt-1 text-md font-semibold text-ink">{a.role}</p>
              <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-2 md:text-lg md:leading-relaxed">
                {a.bio.map((p) => (
                  <p key={p.slice(0, 20)}>{p}</p>
                ))}
              </div>
              <Link href={`/author/${a.slug}/`} className="link-more mt-3">
                Stories and profile <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
            <div className="md:col-start-2 lg:col-start-3">
              <h3 className="kicker border-b border-ink pb-2 text-ink">Professional competencies</h3>
              <ul className="divide-y divide-rule text-md leading-snug text-ink-2">
                {a.competencies.map((c) => (
                  <li key={c} className="py-2.5">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
