import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { SubsectionTabs } from "@/components/listing/subsection-tabs";
import { SectionHeader } from "@/components/section-header";
import { StoryRow, StoryTile } from "@/components/story";
import { getArticlesBySection, getCalculator, getSubsections, toCard } from "@/lib/content";

// Personal Finance sub-category pages keep their old top-level URLs (/retirement/, /taxation/ ...).
type Params = { params: Promise<{ subcategory: string }> };

const CALCS: Record<string, string[]> = {
  retirement: ["epf-calculator", "ppf-calculator", "nps-calculator", "retirement-calculator"],
  taxation: ["income-tax-calculator", "hra-calculator"],
  loan: ["home-loan-emi-calculator", "car-loan-emi-calculator", "personal-loan-emi-calculator"],
  insurance: ["retirement-calculator", "sip-calculator"],
  "banking-and-fixed-deposit": ["fd-calculator", "rd-calculator"],
  "government-scheme": ["ppf-calculator", "nps-calculator"],
  "document-guides": ["income-tax-calculator", "hra-calculator"],
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSubsections().map((s) => ({ subcategory: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subcategory } = await params;
  const sub = getSubsections().find((s) => s.slug === subcategory);
  if (!sub) return {};
  return { title: `${sub.name}: Personal Finance Guides`, description: sub.description, alternates: { canonical: sub.path } };
}

export default async function SubcategoryPage({ params }: Params) {
  const { subcategory } = await params;
  const sub = getSubsections().find((s) => s.slug === subcategory);
  if (!sub) notFound();
  const all = getArticlesBySection("personal-finance").map(toCard);
  const stories = all.filter((a) => a.subsection === sub.slug);
  const more = all.filter((a) => a.subsection !== sub.slug).slice(0, 4);
  const calcs = (CALCS[sub.slug] ?? []).map((s) => getCalculator(s)).filter((c) => c !== null);
  return (
    <>
      <SectionMasthead
        title={sub.name}
        description={sub.description}
        accent="money"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Personal Finance", href: "/personal-finance/" },
        ]}
        count={stories.length}
      >
        <SubsectionTabs active={sub.slug} />
      </SectionMasthead>
      <div className="wrap mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {stories.length ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
              {stories.map((s, i) => (
                <div key={s.slug} className={i === 0 ? "sm:col-span-2" : ""}>
                  <StoryTile story={s} standfirst aspect={i === 0 ? "aspect-[2/1]" : "aspect-[3/2]"} headingSize={i === 0 ? "text-2xl md:text-3xl" : "text-lg"} sizes={i === 0 ? "(min-width: 1024px) 860px, 100vw" : "(min-width: 640px) 420px, 100vw"} />
                </div>
              ))}
            </div>
          ) : (
            <div role="status" className="border-b border-rule pb-10 pt-4">
              <p className="headline text-xl">No stories in this topic yet.</p>
              <p className="mt-1.5 text-md text-ink-2">Every Personal Finance guide is listed on the section page.</p>
              <Link prefetch={false} href="/personal-finance/" className="link-more mt-2">
                All of Personal Finance <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          )}
          <section className="mt-14" aria-label="More personal finance">
            <SectionHeader title="More in Personal Finance" href="/personal-finance/" accent="money" />
            <div className="divide-y divide-rule">
              {more.map((s) => (
                <StoryRow key={s.slug} story={s} />
              ))}
            </div>
          </section>
        </div>
        <aside>
          {calcs.length ? (
            <section aria-label="Calculators" className="border-t-[3px] border-learn pt-3">
              <p className="kicker text-learn">Calculators</p>
              <ul className="mt-2 divide-y divide-rule">
                {calcs.map((c) => (
                  <li key={c.slug}>
                    <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group block py-3">
                      <span className="block font-semibold underline-offset-2 group-hover:underline">{c.name}</span>
                      <span className="mt-0.5 block text-sm leading-normal text-muted">{c.short}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </>
  );
}
