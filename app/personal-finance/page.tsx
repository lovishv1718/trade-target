import type { Metadata } from "next";
import Link from "next/link";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { SubsectionTabs } from "@/components/listing/subsection-tabs";
import { Photo } from "@/components/photo";
import { StoryLink, StoryMeta, StoryRow } from "@/components/story";
import { getArticleBySlug, getArticlesBySection, getEditorial, getSection, getSubsections, toCard } from "@/lib/content";

export const metadata: Metadata = {
  title: "Personal Finance: Retirement, Tax, Loans, Insurance and Savings",
  description: "Guides to EPF, PPF, income tax, loans, insurance, fixed deposits, government schemes and documents like Aadhaar.",
  alternates: { canonical: "/personal-finance/" },
};

export default function PersonalFinancePage() {
  const section = getSection("personal-finance")!;
  const all = getArticlesBySection("personal-finance").map(toCard);
  const lead = toCard(getArticleBySlug(getEditorial().homepage.personalFinanceLead)!);
  const subs = getSubsections();
  return (
    <>
      <SectionMasthead title={section.name} description={section.description} accent="money" crumbs={[{ label: "Home", href: "/" }]} count={all.length}>
        <SubsectionTabs />
      </SectionMasthead>

      <div className="wrap mt-6">
        <article className="story group grid gap-6 border-b border-rule pb-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <Link prefetch={false} href={lead.path} tabIndex={-1} aria-hidden className="block">
            <Photo image={lead.image} sizes="(min-width: 768px) 720px, 100vw" crop="wide" priority />
          </Link>
          <div>
            <span className="kicker kicker-rule text-money">Retirement</span>
            <Link prefetch={false} href={lead.path}>
              <h2 className="headline mt-2 text-balance text-3xl md:text-4xl">{lead.title}</h2>
            </Link>
            <p className="deck mt-3 text-lg leading-normal md:text-xl">{lead.standfirst}</p>
            <StoryMeta story={lead} className="mt-3" />
          </div>
        </article>

        <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {subs.map((sub) => {
            const items = all.filter((a) => a.subsection === sub.slug && a.slug !== lead.slug);
            if (!items.length) return null;
            const [first, ...others] = items;
            return (
              <section key={sub.slug} aria-labelledby={`sub-${sub.slug}`} className="border-t-3 border-money pt-2.5">
                <div className="flex items-center justify-between gap-4">
                  <h2 id={`sub-${sub.slug}`} className="section-title">
                    <Link prefetch={false} href={sub.path}>
                      {sub.name}
                    </Link>
                  </h2>
                  <Link prefetch={false} href={sub.path} className="link-more shrink-0 text-money">
                    More<span className="sr-only"> in {sub.name}</span> <span className="arrow" aria-hidden>→</span>
                  </Link>
                </div>
                <p className="text-sm leading-normal text-muted">{sub.description}</p>
                <StoryRow story={first} />
                <div className="divide-y divide-rule border-t border-rule">
                  {others.slice(0, 2).map((s) => (
                    <StoryLink key={s.slug} story={s} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
