import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqSection } from "@/components/article/article-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CALCULATORS } from "@/components/calculators/registry";
import { JsonLd } from "@/components/json-ld";
import { SectionHeader } from "@/components/section-header";
import { StoryRow } from "@/components/story";
import { getArticlesBySlugs, getCalculator, getCalculators, toCard } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCalculators().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalculator(slug);
  if (!c) return {};
  return {
    title: `${c.name}: ${c.short}`,
    description: c.description,
    alternates: { canonical: `/calculators/${c.slug}/` },
  };
}

export default async function CalculatorPage({ params }: Params) {
  const { slug } = await params;
  const calc = getCalculator(slug);
  const Widget = CALCULATORS[slug];
  if (!calc || !Widget) notFound();
  const related = calc.related.map((s) => getCalculator(s)).filter((c) => c !== null);
  const articles = getArticlesBySlugs(calc.articles).map(toCard);

  return (
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculators/" }]} current={calc.name} />
      <header className="mt-4 max-w-3xl">
        <p className="kicker text-accent-ink">{calc.category} calculator</p>
        <h1 className="headline mt-1 text-[2.1rem] leading-tight md:text-[2.6rem]">{calc.name}</h1>
        <p className="mt-2 text-[1.08rem] leading-relaxed text-[#3a4453]">{calc.description}</p>
      </header>

      <div className="mt-7">
        <Widget />
      </div>

      <div className="mt-4 max-w-3xl">
        <FaqSection faqs={calc.faqs} />
      </div>

      <p className="mt-8 max-w-3xl border-l-4 border-rule pl-4 text-sm text-muted">
        Results are estimates based on the figures you enter and the assumptions stated above. They are not a promise of returns or a quote from any lender, and
        not investment or tax advice.
      </p>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <section aria-label="Related calculators">
          <SectionHeader title="Related calculators" href="/calculators/" linkLabel="All" accent="accent" />
          <ul className="mt-3 divide-y divide-rule">
            {related.map((c) => (
              <li key={c.slug}>
                <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex items-center justify-between gap-4 py-3.5">
                  <span>
                    <span className="headline block text-[1.1rem] group-hover:underline">{c.name}</span>
                    <span className="text-sm text-muted">{c.short}</span>
                  </span>
                  <span aria-hidden className="text-accent-ink">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {articles.length ? (
          <section aria-label="Related articles">
            <SectionHeader title="Read more" />
            <div className="divide-y divide-rule">
              {articles.slice(0, 4).map((a) => (
                <StoryRow key={a.slug} story={a} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `TradeTarget ${calc.name}`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          url: `https://tradetarget.in/calculators/${calc.slug}/`,
          description: calc.description,
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }}
      />
    </div>
  );
}
