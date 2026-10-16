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
      <SectionMasthead title={section.name} description={section.description} accent="funds" crumbs={[{ label: "Home", href: "/" }]} count={all.length}>
        <SubsectionTabs />
      </SectionMasthead>

      <div className="wrap mt-6">
        <article className="grid gap-6 border-b border-rule pb-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <Link prefetch={false} href={lead.path} className="group block">
            <Photo image={lead.image} sizes="(min-width: 768px) 720px, 100vw" aspect="aspect-[16/9]" priority />
          </Link>
          <div>
            <span className="kicker text-funds-ink">Retirement</span>
            <Link prefetch={false} href={lead.path} className="group">
              <h2 className="headline mt-1.5 text-[1.9rem] leading-tight group-hover:underline md:text-[2.3rem]">{lead.title}</h2>
            </Link>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-[#3a4453]">{lead.standfirst}</p>
            <StoryMeta story={lead} className="mt-3" />
          </div>
        </article>

        <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {subs.map((sub) => {
            const items = all.filter((a) => a.subsection === sub.slug && a.slug !== lead.slug);
            if (!items.length) return null;
            const [first, ...others] = items;
            return (
              <section key={sub.slug} aria-labelledby={`sub-${sub.slug}`} className="border-t-[3px] border-funds pt-2.5">
                <div className="flex items-baseline justify-between">
                  <h2 id={`sub-${sub.slug}`} className="headline text-[1.35rem]">
                    <Link prefetch={false} href={sub.path} className="hover:underline">
                      {sub.name}
                    </Link>
                  </h2>
                  <Link prefetch={false} href={sub.path} className="text-sm font-semibold text-funds-ink hover:underline">
                    More →
                  </Link>
                </div>
                <p className="text-sm text-muted">{sub.description}</p>
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
