import Link from "next/link";
import { CompanyCard } from "@/components/company-card";
import { Facets } from "@/components/facets";
import { CoverDateline, CoverSentence } from "@/components/home/cover";
import { IpoDesk } from "@/components/home/ipo-desk";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Kicker } from "@/components/kicker";
import { NewsletterForm } from "@/components/newsletter-form";
import { Photo } from "@/components/photo";
import markets from "@/content/markets.json";
import { getArticleBySlug, getArticleCards, getArticlesBySection, getCalculators, getEditorial, toCard, type ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getIpos, istToday } from "@/lib/ipo";

const ROMAN = ["i", "ii", "iii", "iv"];

/** Date and read time */
function Meta({ story, className = "" }: { story: ArticleCard; className?: string }) {
  return (
    <p className={`pm-meta ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time> · {story.readTime} min read
    </p>
  );
}

/**
 * A section's opening, as in a magazine: a full-width rule, the section number in the serif's
 * italic beside its name, then the title with its last words in italic, and a link to the rest.
 */
function SectionIntro({ num, label, title, em, dek, href, linkLabel, id }: { num: string; label: string; title: string; em: string; dek?: string; href?: string; linkLabel?: string; id: string }) {
  return (
    <div className="mb-10 grid gap-5 border-t border-ink pt-5 md:mb-14 md:grid-cols-[9rem_minmax(0,1fr)_auto] md:items-end md:gap-10 md:pt-6">
      <p className="flex items-baseline gap-3 self-start md:flex-col md:gap-1">
        <span className="sg-num text-3xl leading-none">{num}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-2">{label}</span>
      </p>
      <div className="max-w-3xl">
        <h2 id={id} className="sg-title">
          {title} <em>{em}</em>
        </h2>
        {dek ? <p className="mt-4 max-w-xl text-md leading-relaxed text-muted">{dek}</p> : null}
      </div>
      {href ? (
        <Link prefetch={false} href={href} className="link-more whitespace-nowrap">
          {linkLabel} <span className="pm-arrow" aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const ed = getEditorial();
  const all = getArticleCards();
  const today = [ed.homepage.lead, ...ed.homepage.secondary].map((s) => toCard(getArticleBySlug(s)!)).slice(0, 3);
  const used = new Set(today.map((s) => s.slug));
  const newsroom = all.filter((a) => a.section === "news" || a.section === "ipo" || ed.newsTopics.includes(a.kicker));
  const [lead, ...rest] = newsroom.filter((a) => !used.has(a.slug));
  const latest = rest.slice(0, 2);
  const analysis = getArticlesBySection("share-analysis").map(toCard).slice(0, 3);
  const learn = getArticlesBySection("stock-market-iq").map(toCard).slice(0, 4);
  const money = getArticlesBySection("personal-finance").map(toCard).slice(0, 4);
  const calcs = getCalculators();
  // Four of the most used, each with its icon; the rest are a click away
  const featuredCalcs = (
    [
      ["sip-calculator", "growth"],
      ["income-tax-calculator", "percent"],
      ["home-loan-emi-calculator", "home"],
      ["ppf-calculator", "shield"],
    ] as const
  ).flatMap(([slug, icon]) => {
    const c = calcs.find((x) => x.slug === slug);
    return c ? [{ ...c, icon }] : [];
  });
  const ipos = getIpos();
  const buildDate = istToday();
  const sensex = markets.ticker.find((q) => q.id === "sensex")!;
  const briefStory = getArticleBySlug(ed.homepage.brief.slug)!;

  return (
    <>
      <h1 className="sr-only">TradeTarget: Indian stock market, IPO and personal finance news</h1>

      {/* The cover: the day in one sentence, the facet art behind it, three stories under it ------ */}
      <section aria-label="Today">
        <div className="wrap pt-6 md:pt-8">
          <CoverDateline buildDate={buildDate} />
          <div className="relative pb-12 pt-12 md:pb-16 md:pt-20">
            <Facets
              seed={23}
              cols={8}
              rows={6}
              width={800}
              height={600}
              fill={0.1}
              green={2}
              lineOpacity={0.14}
              className="sg-facets pointer-events-none absolute -right-8 top-0 -z-10 hidden h-full w-[52%] [mask-image:linear-gradient(to_left,black_40%,transparent),linear-gradient(to_top,transparent,black_25%)] [mask-composite:intersect] md:block"
            />
            <p className="eyebrow">Today in one sentence</p>
            <div className="relative mt-6 md:mt-8">
              <CoverSentence index={{ name: sensex.name, changePct: sensex.changePct }} ipos={ipos} buildDate={buildDate} brief={{ text: ed.homepage.brief.text, href: briefStory.path }} />
            </div>
            <p className="relative mt-8 max-w-[54ch] text-lg leading-relaxed text-ink-2 md:mt-10">
              Understand the market before you invest. Results, IPOs, company analysis and personal finance, explained in plain language by people who follow India&apos;s markets every day.
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Link prefetch={false} href="/ipo/" className="btn">
                Explore the IPO desk
              </Link>
              <Link prefetch={false} href="/news/" className="btn btn-secondary">
                Read today&apos;s news <span className="pm-arrow" aria-hidden>→</span>
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted">Market figures are indicative sample values in this preview.</p>
          </div>

          {/* In this edition: three stories, numbered, between hairlines */}
          <ol aria-label="In this edition" className="grid border-t border-ink md:grid-cols-3">
            {today.map((s, i) => (
              <li key={s.slug} className={`border-b border-rule md:border-b-0 ${i ? "md:border-l md:pl-8" : ""} ${i < 2 ? "md:pr-8" : ""}`}>
                <Link prefetch={false} href={s.path} className="group grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 py-6 md:py-8">
                  <span className="sg-num text-2xl leading-none">{ROMAN[i]}</span>
                  <span>
                    <Kicker label={s.kicker} />
                    <span className="mt-2 block font-serif text-xl font-medium leading-snug tracking-[-0.01em] text-ink group-hover:underline group-hover:decoration-accent group-hover:decoration-1 group-hover:underline-offset-4">
                      {s.title}
                    </span>
                    <Meta story={s} className="mt-3" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 01 Latest news: the lead in its photograph, two more beside nothing but type ------------- */}
      <section className="pm-section wrap" aria-labelledby="news-title">
        <SectionIntro id="news-title" num="01" label="Latest news" title="What moved" em="today." dek="Results, IPOs and the market, explained without the noise." href="/news/" linkLabel="All news" />
        <article className="group grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-12">
          <Link prefetch={false} href={lead.path} tabIndex={-1} aria-hidden className="block">
            <Photo image={lead.image} sizes="(min-width: 1024px) 680px, 100vw" crop="standard" />
          </Link>
          <div className="flex flex-col justify-center">
            <Kicker label={lead.kicker} />
            <Link prefetch={false} href={lead.path} className="block">
              <h3 className="mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-[-0.015em] text-ink group-hover:underline group-hover:decoration-accent group-hover:decoration-1 group-hover:underline-offset-4 md:text-4xl">
                {lead.title}
              </h3>
            </Link>
            <p className="mt-5 text-md leading-relaxed text-ink-2">{lead.standfirst}</p>
            <Meta story={lead} className="mt-5" />
          </div>
        </article>
        <div className="mt-12 grid gap-x-12 md:grid-cols-2">
          {latest.map((s) => (
            <article key={s.slug} className="group border-t border-rule py-6">
              <Link prefetch={false} href={s.path} className="block">
                <Kicker label={s.kicker} />
                <h3 className="mt-2 font-serif text-2xl font-medium leading-snug tracking-[-0.01em] text-ink group-hover:underline group-hover:decoration-accent group-hover:decoration-1 group-hover:underline-offset-4">{s.title}</h3>
                <p className="mt-3 line-clamp-2 text-md leading-relaxed text-ink-2">{s.standfirst}</p>
                <Meta story={s} className="mt-3" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* 02 IPO desk ------------------------------------------------------------------------- */}
      <section className="pm-section surface-paper-2" aria-labelledby="ipo-title">
        <div className="wrap">
          <SectionIntro id="ipo-title" num="02" label="IPO desk" title="Every issue," em="in one place." dek="Status is worked out from each issue's own dates, so it is never out of step." />
          <IpoDesk ipos={ipos} buildDate={buildDate} />
        </div>
      </section>

      {/* 03 Company analysis ----------------------------------------------------------------- */}
      <section className="pm-section wrap" aria-labelledby="analysis-title">
        <SectionIntro id="analysis-title" num="03" label="Share analysis" title="Companies," em="read as businesses." dek="Model, financials, valuation and risks, one company at a time." href="/share-analysis/" linkLabel="All analysis" />
        {/* A swipeable row on phones, three across from 768px */}
        <ul className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {analysis.map((s) => (
            <li key={s.slug} className="w-[84%] shrink-0 snap-start md:w-auto">
              <CompanyCard story={s} />
            </li>
          ))}
        </ul>
      </section>

      {/* 04 Calculators ---------------------------------------------------------------------- */}
      <section className="pm-section surface-paper-2" aria-labelledby="calc-title">
        <div className="wrap">
          <SectionIntro id="calc-title" num="04" label="Calculators" title="Plan with" em="numbers." dek={`${calcs.length} calculators that show their working, year by year.`} href="/calculators/" linkLabel="All calculators" />
          <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {featuredCalcs.map((c) => (
              <li key={c.slug}>
                <Link prefetch={false} href={`/calculators/${c.slug}/`} className="pm-card pm-lift group flex h-full flex-col justify-between gap-6 p-4 sm:p-6 md:gap-10 md:p-7">
                  <span>
                    <span className="mb-5 inline-grid size-12 place-items-center rounded-full border border-rule-strong text-ink transition-colors group-hover:border-emerald group-hover:bg-emerald group-hover:text-paper md:mb-7">
                      <Icon name={c.icon} size={22} />
                    </span>
                    <span className="block font-serif text-xl font-medium tracking-[-0.01em] text-ink md:text-2xl">{c.name.replace(" Calculator", "")}</span>
                    <span className="mt-1.5 block text-sm leading-snug text-muted">{c.short}</span>
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald">
                    Open <span className="pm-arrow" aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 Learn ------------------------------------------------------------------------------ */}
      <section className="pm-section wrap" aria-labelledby="learn-title">
        <SectionIntro id="learn-title" num="05" label="Learn" title="Learn to think" em="like an investor." dek="Explainers and money guides in plain language." />
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {[
            { name: "Stock Market IQ", href: "/stock-market-iq/", items: learn },
            { name: "Personal Finance", href: "/personal-finance/", items: money },
          ].map((col) => (
            <div key={col.href}>
              <div className="flex items-baseline justify-between border-b border-ink pb-3">
                <h3 className="font-serif text-2xl font-medium tracking-[-0.01em] text-ink">{col.name}</h3>
                <Link prefetch={false} href={col.href} className="link-more">
                  All <span className="pm-arrow" aria-hidden>→</span>
                </Link>
              </div>
              <ol>
                {col.items.map((s, i) => (
                  <li key={s.slug} className="border-b border-rule">
                    <Link prefetch={false} href={s.path} className="group grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-4">
                      <span className="sg-num text-lg leading-none">{i + 1}</span>
                      <span className="font-serif text-lg font-medium leading-snug text-ink group-hover:underline group-hover:decoration-accent group-hover:decoration-1 group-hover:underline-offset-4">{s.title}</span>
                      <span className="pm-meta whitespace-nowrap">{s.readTime} min</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* The morning brief, on the charcoal band with its facets -------------------------------- */}
      <section id="newsletter" className="surface-ink band-closing relative scroll-mt-20 overflow-hidden [background-image:none]" aria-labelledby="brief-title">
        <Facets seed={8} cols={8} rows={5} width={800} height={500} red={1} green={1} lineOpacity={0.26} className="pointer-events-none absolute -right-24 top-0 hidden h-full w-[55%] text-paper [mask-image:linear-gradient(to_left,black_30%,transparent)] lg:block" />
        <div className="wrap relative grid gap-10 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:gap-16 md:py-24">
          <div>
            <p className="eyebrow">The morning brief</p>
            <h2 id="brief-title" className="sg-title mt-5">
              The market, <em>before 8 am.</em>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-2">One email on trading days: IPOs opening that week, results due, and one clear explainer. No tips, no noise.</p>
          </div>
          <div>
            <NewsletterForm id="home-brief" tone="dark" />
            <p className="pm-meta mt-3">Free. Unsubscribe whenever you like.</p>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TradeTarget",
          url: "https://tradetarget.in",
          email: "business@tradetarget.in",
          address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
          sameAs: ["https://twitter.com/tradetarget3", "https://www.facebook.com/tradetarget03", "https://www.instagram.com/tradetarget/", "https://www.linkedin.com/company/trade-target/", "https://www.youtube.com/@tradetarget"],
        }}
      />
    </>
  );
}
