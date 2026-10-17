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
        <p className="kicker text-learn">{calc.category} calculator</p>
        <h1 className="headline mt-1.5 text-3xl md:text-4xl">{calc.name}</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-2">{calc.description}</p>
      </header>

      <div className="mt-6 md:mt-8">
        <Widget />
      </div>

      <div className="mt-4 max-w-3xl">
        <FaqSection faqs={calc.faqs} />
      </div>

      <p className="mt-8 max-w-3xl border-l-2 border-rule-strong pl-4 text-sm leading-normal text-muted">
        Results are estimates based on the figures you enter and the assumptions stated above. They are not a promise of returns or a quote from any lender, and
        not investment or tax advice.
      </p>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <section aria-label="Related calculators">
          <SectionHeader title="Related calculators" href="/calculators/" linkLabel="All" accent="learn" />
          <ul className="mt-3 divide-y divide-rule">
            {related.map((c) => (
              <li key={c.slug}>
                <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex min-h-11 items-center justify-between gap-4 py-3.5">
                  <span>
                    <span className="headline block text-lg">{c.name}</span>
                    <span className="mt-0.5 block text-sm leading-normal text-muted">{c.short}</span>
                  </span>
                  <span aria-hidden className="shrink-0 text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-ink">
                    →
                  </span>
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
