import type { Metadata } from "next";
import Link from "next/link";
import { AuthorAvatar } from "@/components/article/article-parts";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { getAuthors } from "@/lib/content";

export const metadata: Metadata = {
  title: "Board of Directors",
  description: "The leadership of TradeTarget: Hemant Bisht, Founder; Ramesh Bisht, Co-Founder; Kashish Sharma, Co-Founder.",
  alternates: { canonical: "/board-of-directors/" },
};

export default function BoardPage() {
  const team = getAuthors();
  return (
    <>
      <SectionMasthead
        title="Board of Directors"
        crumbs={[{ label: "Home", href: "/" }]}
        description="Leadership that combines financial expertise with a content-first approach."
        aside={
          /* Directory: the board at a glance, each name jumps to the full profile */
          <nav aria-label="Directors" className="shrink-0 md:w-80">
            <ol className="divide-y divide-rule border-y border-rule-strong text-sm">
              {team.map((a, i) => (
                <li key={a.slug}>
                  <a href={`#${a.slug}`} className="link-row gap-3 py-2 font-normal">
                    <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="link-row-label font-semibold text-ink">{a.name}</span>
                    <span className="ml-auto text-muted">{a.role}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        }
      />
    <div className="wrap">

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
              <Link href={`/author/${a.slug}/`} className="btn btn-secondary btn-sm mt-4">
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
    </>
  );
}
