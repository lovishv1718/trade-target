import Link from "next/link";
import { CompanyCard } from "@/components/company-card";
import { IpoDesk } from "@/components/home/ipo-desk";
import { Icon, type IconName } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Kicker } from "@/components/kicker";
import { NewsletterForm } from "@/components/newsletter-form";
import { Photo } from "@/components/photo";
import { getArticleBySlug, getArticleCards, getArticlesBySection, getCalculators, getEditorial, toCard, type ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getIpos, istToday } from "@/lib/ipo";

/** Date and read time, set in the mono label voice */
function Meta({ story, className = "" }: { story: ArticleCard; className?: string }) {
  return (
    <p className={`pm-meta ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time> · {story.readTime} min read
    </p>
  );
}

/** A section's opening: the bracketed eyebrow, a two-tone title and an optional link to the whole section */
function SectionIntro({ eyebrow, title, soft, href, linkLabel }: { eyebrow: string; title: string; soft: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="pm-title mt-4">
          {title} <span className="soft">{soft}</span>
        </h2>
      </div>
      {href ? (
        <Link prefetch={false} href={href} className="link-more text-ink">
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

  const topics: { label: string; note: string; href: string; icon: IconName }[] = [
    { label: "IPOs and GMP", note: `${ipos.length} issues tracked`, href: "/ipo/", icon: "bell" },
    { label: "Quarterly results", note: `${all.filter((a) => a.kicker === "Results").length} results covered`, href: "/news/?topic=Results", icon: "bars" },
    { label: "Company analysis", note: `${getArticlesBySection("share-analysis").length} companies`, href: "/share-analysis/", icon: "building" },
    { label: "Personal finance", note: `${getArticlesBySection("personal-finance").length} guides`, href: "/personal-finance/", icon: "wallet" },
    { label: "Calculators", note: `${calcs.length} tools`, href: "/calculators/", icon: "calculator" },
  ];

  return (
    <>
      <h1 className="sr-only">TradeTarget: Indian stock market, IPO and personal finance news</h1>

      {/* Hero: the promise on the warm gradient, today's three stories beside it ---------------- */}
      <section className="wrap pt-6 md:pt-8" aria-label="Introduction">
        <div className="pm-grad grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 lg:p-14">
            <p className="font-mono text-[0.71875rem] font-medium uppercase tracking-[0.12em] text-white/80">Indian markets · IPOs · Personal finance</p>
            <div>
              <p className="pm-hero-title max-w-[15ch]">Understand the market before you invest.</p>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/90">
                Results, IPOs, company analysis and personal finance, explained in plain language by people who follow India&apos;s markets every day.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link prefetch={false} href="/ipo/" className="btn btn-on-grad">
                Explore the IPO desk
              </Link>
              <Link prefetch={false} href="/news/" className="btn btn-on-grad-2">
                Read today&apos;s news <span className="pm-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="m-3 bg-white p-6 text-ink sm:m-4 sm:p-8 lg:my-5 lg:ml-0 lg:mr-5">
            <p className="eyebrow">Today on TradeTarget</p>
            <ol className="mt-5">
              {today.map((s) => (
                <li key={s.slug} className="border-t border-rule first:border-t-0">
                  <Link prefetch={false} href={s.path} className="group block py-5">
                    <Kicker label={s.kicker} />
                    <span className="mt-2 block font-serif text-xl font-bold leading-snug tracking-tight text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{s.title}</span>
                    <Meta story={s} className="mt-3" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* What we cover: the five doors into the site. A list until there is room for all five in a row */}
        <ul aria-label="What we cover" className="mt-6 grid border-l border-t border-rule lg:grid-cols-5">
          {topics.map((t) => (
            <li key={t.href} className="border-b border-r border-rule">
              <Link prefetch={false} href={t.href} className="group flex h-full items-center justify-between gap-3 px-5 py-4 hover:bg-paper-2 lg:py-5">
                <span className="flex items-center gap-4 lg:gap-3.5">
                  <Icon name={t.icon} size={22} className="shrink-0 text-ink-2 group-hover:text-accent" />
                  <span>
                    <span className="block font-serif text-base font-bold tracking-tight text-ink">{t.label}</span>
                    <span className="pm-meta mt-1 block">{t.note}</span>
                  </span>
                </span>
                <span className="pm-arrow text-faint group-hover:text-ink lg:hidden" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Latest news: one lead, two after it --------------------------------------------------- */}
      <section className="pm-section wrap" aria-labelledby="news-title">
        <div id="news-title">
          <SectionIntro eyebrow="Latest news" title="What moved today." soft="Results, IPOs and the market, explained." href="/news/" linkLabel="All news" />
        </div>
        <article className="pm-lift group grid gap-6 border border-rule bg-white md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-0">
          <Link prefetch={false} href={lead.path} tabIndex={-1} aria-hidden className="block">
            <Photo image={lead.image} sizes="(min-width: 1024px) 640px, 100vw" crop="standard" />
          </Link>
          <div className="flex flex-col justify-between gap-6 px-6 pb-6 md:p-10">
            <div>
              <Kicker label={lead.kicker} />
              <Link prefetch={false} href={lead.path} className="block">
                <h3 className="mt-3 font-serif text-2xl font-bold leading-tight tracking-tight text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4 md:text-3xl">{lead.title}</h3>
              </Link>
              <p className="mt-4 text-md leading-relaxed text-ink-2">{lead.standfirst}</p>
            </div>
            <Meta story={lead} />
          </div>
        </article>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {latest.map((s) => (
            <article key={s.slug} className="pm-lift group border border-rule bg-white">
              <Link prefetch={false} href={s.path} className="grid h-full grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-stretch">
                <Photo image={s.image} sizes="(min-width: 768px) 260px, 40vw" crop="standard" />
                <div className="flex flex-col justify-between gap-4 p-5">
                  <div>
                    <Kicker label={s.kicker} />
                    <h3 className="mt-2 font-serif text-lg font-bold leading-snug tracking-tight text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{s.title}</h3>
                  </div>
                  <Meta story={s} />
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* IPO desk ------------------------------------------------------------------------------- */}
      <section className="pm-section bg-paper-2" aria-labelledby="ipo-title">
        <div className="wrap">
          <div id="ipo-title">
            <SectionIntro eyebrow="IPO desk" title="Every issue in one place." soft="Status worked out from each issue's own dates." />
          </div>
          <IpoDesk ipos={ipos} buildDate={istToday()} />
        </div>
      </section>

      {/* Company analysis --------------------------------------------------------------------- */}
      <section className="pm-section wrap" aria-labelledby="analysis-title">
        <div id="analysis-title">
          <SectionIntro eyebrow="Share analysis" title="Companies, read as businesses." soft="Model, financials, valuation and risks." href="/share-analysis/" linkLabel="All analysis" />
        </div>
        {/* A swipeable row on phones, three across from 768px */}
        <ul className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {analysis.map((s) => (
            <li key={s.slug} className="w-[84%] shrink-0 snap-start md:w-auto">
              <CompanyCard story={s} />
            </li>
          ))}
        </ul>
      </section>

      {/* Calculators ------------------------------------------------------------------------------ */}
      <section className="pm-section bg-paper-2" aria-labelledby="calc-title">
        <div className="wrap">
          <div id="calc-title">
            <SectionIntro eyebrow="Calculators" title="Plan with numbers." soft={`${calcs.length} calculators that show their working.`} href="/calculators/" linkLabel="All calculators" />
          </div>
          <ul className="grid grid-cols-2 border-l border-t border-rule bg-white lg:grid-cols-4">
            {featuredCalcs.map((c) => (
              <li key={c.slug} className="border-b border-r border-rule">
                <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex h-full flex-col justify-between gap-6 p-4 hover:bg-paper-2 sm:p-6 md:gap-8 md:p-7">
                  <span>
                    <Icon name={c.icon} size={28} className="mb-4 text-ink group-hover:text-accent md:mb-6" />
                    <span className="block font-serif text-lg font-bold tracking-tight text-ink">{c.name.replace(" Calculator", "")}</span>
                    <span className="mt-1.5 block text-sm leading-snug text-muted">{c.short}</span>
                  </span>
                  <span className="pm-meta flex items-center gap-2 text-ink">
                    Open <span className="pm-arrow" aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Learn ---------------------------------------------------------------------------------------- */}
      <section className="pm-section wrap" aria-labelledby="learn-title">
        <div id="learn-title">
          <SectionIntro eyebrow="Learn" title="Learn to think like an investor." soft="Explainers and money guides in plain language." />
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {[
            { name: "Stock Market IQ", href: "/stock-market-iq/", items: learn },
            { name: "Personal Finance", href: "/personal-finance/", items: money },
          ].map((col) => (
            <div key={col.href}>
              <div className="flex items-baseline justify-between border-b border-ink pb-3">
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink">{col.name}</h3>
                <Link prefetch={false} href={col.href} className="link-more text-ink">
                  All <span className="pm-arrow" aria-hidden>→</span>
                </Link>
              </div>
              <ul>
                {col.items.map((s) => (
                  <li key={s.slug} className="border-b border-rule">
                    <Link prefetch={false} href={s.path} className="group flex items-baseline justify-between gap-6 py-4">
                      <span className="font-medium leading-snug text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{s.title}</span>
                      <span className="pm-meta shrink-0">{s.readTime} min</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* The morning brief ------------------------------------------------------------------------ */}
      <section id="newsletter" className="surface-ink band-closing scroll-mt-20" aria-labelledby="brief-title">
        <div className="wrap grid gap-10 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:gap-16 md:py-24">
          <div>
            <p className="eyebrow">The morning brief</p>
            <h2 id="brief-title" className="pm-title mt-4 text-white">
              The market, before 8 am. <span className="text-white/50">No tips, no noise.</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">One email on trading days: IPOs opening that week, results due, and one clear explainer.</p>
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
