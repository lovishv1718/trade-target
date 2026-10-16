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
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="Board of Directors" />
      <header className="mt-4 max-w-3xl">
        <h1 className="headline text-[2.2rem] leading-tight md:text-[2.7rem]">Board of Directors</h1>
        <p className="mt-2 text-[1.08rem] text-[#3a4453]">Leadership that combines financial expertise with a content-first approach.</p>
      </header>
      <div className="mt-8 space-y-10">
        {team.map((a) => (
          <article key={a.slug} id={a.slug} className="grid gap-6 border-t-[3px] border-navy pt-6 md:grid-cols-[200px_1fr]">
            <div>
              <AuthorAvatar author={a} size={160} />
            </div>
            <div>
              <h2 className="headline text-[1.8rem]">{a.name}</h2>
              <p className="font-semibold text-accent-ink">{a.role}</p>
              <div className="mt-3 space-y-3 text-[1.03rem] leading-relaxed text-[#2f3947]">
                {a.bio.map((p) => (
                  <p key={p.slice(0, 20)}>{p}</p>
                ))}
              </div>
              <h3 className="mt-5 font-semibold">Professional competencies</h3>
              <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[0.97rem] text-[#3a4453] md:grid-cols-2">
                {a.competencies.map((c) => (
                  <li key={c} className="border-l-2 border-gold pl-3">
                    {c}
                  </li>
                ))}
              </ul>
              <Link href={`/author/${a.slug}/`} className="mt-4 inline-block text-sm font-semibold text-accent-ink hover:underline">
                Stories and profile →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
