import Image from "next/image";
import Link from "next/link";
import { CompanyCard } from "@/components/company-card";
import { IpoDesk } from "@/components/home/ipo-desk";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Kicker } from "@/components/kicker";
import { NewsletterForm } from "@/components/newsletter-form";
import { Photo } from "@/components/photo";
import { getArticleBySlug, getArticleCards, getArticlesBySection, getCalculators, getEditorial, getPhoto, toCard, type ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getIpos, istToday } from "@/lib/ipo";

/** Date and read time */
function Meta({ story, className = "" }: { story: ArticleCard; className?: string }) {
  return (
    <p className={`pm-meta ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time> · {story.readTime} min read
    </p>
  );
}

/** A section's opening: the number in the light orange serif, the label, the title and a link to the rest */
function SectionIntro({ num, label, title, em, dek, href, linkLabel, id }: { num: string; label: string; title: string; em?: string; dek?: string; href?: string; linkLabel?: string; id: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
      <div className="flex items-start gap-5 md:gap-7">
        <span className="tt-num" aria-hidden>
          {num}
        </span>
        <div className="max-w-2xl">
          <p className="tt-label">{label}</p>
          <h2 id={id} className="tt-title mt-2.5">
            {title}
            {em ? (
              <>
                {" "}
                <em>{em}</em>
              </>
            ) : null}
          </h2>
          {dek ? <p className="mt-3 max-w-xl text-md leading-relaxed text-muted">{dek}</p> : null}
        </div>
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
  const hero = getPhoto("bse-building")!;
  // The editors' picks first, then the newest news; a story whose picture is the hero's own waits its turn
  const picks = [ed.homepage.lead, ...ed.homepage.secondary].map((s) => toCard(getArticleBySlug(s)!));
  const newsroom = getArticleCards().filter((a) => a.section === "news" || a.section === "ipo" || ed.newsTopics.includes(a.kicker));
  const latest = [...picks, ...newsroom].filter((s, i, all) => s.image?.src !== hero.src && all.findIndex((x) => x.slug === s.slug) === i).slice(0, 3);
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

  return (
    <>
      {/* Hero: one promise, two ways in, and the exchange itself -------------------------------- */}
      <section className="tt-hero overflow-hidden" aria-labelledby="hero-title">
        <div className="wrap grid items-center gap-10 pb-12 pt-10 md:pb-14 lg:min-h-[580px] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-6 lg:py-0">
          <div className="lg:py-16">
            <p className="eyebrow">India&apos;s markets, explained</p>
            <h1 id="hero-title" className="tt-hero-title mt-6 md:mt-8">
              Clear insights for better <em>investment decisions.</em>
            </h1>
            <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-muted md:mt-8 md:text-xl md:leading-relaxed">
              News, IPOs, company analysis and personal finance, explained in simple language by people who follow India&apos;s markets every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 md:mt-10">
              <Link prefetch={false} href="/news/" className="btn btn-lg">
                Explore latest news <span className="pm-arrow" aria-hidden>→</span>
              </Link>
              <Link prefetch={false} href="/ipo/" className="btn btn-secondary btn-lg">
                Track IPOs
              </Link>
            </div>
          </div>
          <figure className="relative -mx-4 h-[320px] sm:mx-0 sm:h-[420px] lg:-mr-8 lg:h-[580px]">
            <div className="tt-frame absolute inset-0">
              <Image src={hero.src} alt="The BSE building on Dalal Street, Mumbai" fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover object-[50%_30%]" />
            </div>
            {/* A fine orange rule running parallel to the slanted edge */}
            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block">
              <line x1="24" y1="0" x2="-6" y2="100" stroke="var(--color-accent-bright)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <figcaption className="absolute bottom-3 right-[16%] text-[0.625rem] text-white/85 lg:right-[32%]">Photo: {hero.credit}</figcaption>
          </figure>
        </div>
      </section>

      {/* Latest market news: three stories, straight under the hero ---------------------------- */}
      <section className="wrap pb-16 pt-12 md:pb-24 md:pt-16" aria-labelledby="latest-title">
        <div className="flex items-end justify-between gap-6 border-b border-rule pb-5">
          <div>
            <p className="eyebrow">Latest market news</p>
            <h2 id="latest-title" className="tt-title mt-3">
              Today on TradeTarget
            </h2>
          </div>
          <Link prefetch={false} href="/news/" className="link-more whitespace-nowrap">
            View all <span className="pm-arrow" aria-hidden>→</span>
          </Link>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {latest.map((s) => (
            <article key={s.slug} className="group">
              <Link prefetch={false} href={s.path} className="block">
                <Photo image={s.image} sizes="(min-width: 768px) 400px, 100vw" crop="standard" />
                <Kicker label={s.kicker} className="mt-5 block" />
                <h3 className="mt-2 font-serif text-xl font-bold leading-snug tracking-[-0.01em] text-ink group-hover:underline group-hover:decoration-accent-bright group-hover:decoration-2 group-hover:underline-offset-4">
                  {s.title}
                </h3>
                <Meta story={s} className="mt-3" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* 01 IPO desk ------------------------------------------------------------------------- */}
      <section className="pm-section surface-paper-2" aria-labelledby="ipo-title">
        <div className="wrap">
          <SectionIntro id="ipo-title" num="01" label="IPO desk" title="Every issue," em="in one place." dek="Dates, price bands and status for every mainboard issue, worked out from each issue's own calendar." href="/ipo/" linkLabel="IPO dashboard" />
          <IpoDesk ipos={ipos} buildDate={istToday()} />
        </div>
      </section>

      {/* 02 Company analysis ----------------------------------------------------------------- */}
      <section className="pm-section wrap" aria-labelledby="analysis-title">
        <SectionIntro id="analysis-title" num="02" label="Share analysis" title="Companies," em="read as businesses." dek="Model, financials, valuation and risks, one company at a time." href="/share-analysis/" linkLabel="All analysis" />
        {/* A swipeable row on phones, three across from 768px */}
        <ul className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {analysis.map((s) => (
            <li key={s.slug} className="w-[84%] shrink-0 snap-start md:w-auto">
              <CompanyCard story={s} />
            </li>
          ))}
        </ul>
      </section>

      {/* 03 Calculators ---------------------------------------------------------------------- */}
      <section className="pm-section surface-paper-2" aria-labelledby="calc-title">
        <div className="wrap">
          <SectionIntro id="calc-title" num="03" label="Calculators" title="Plan with" em="numbers." dek={`${calcs.length} calculators that show their working, year by year.`} href="/calculators/" linkLabel="All calculators" />
          <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {featuredCalcs.map((c) => (
              <li key={c.slug}>
                <Link prefetch={false} href={`/calculators/${c.slug}/`} className="pm-card pm-lift group flex h-full flex-col justify-between gap-6 p-4 sm:p-6 md:gap-10 md:p-7">
                  <span>
                    <span className="mb-5 inline-grid size-12 place-items-center rounded-full bg-accent-tint text-accent-deep transition-colors group-hover:bg-accent-bright group-hover:text-white md:mb-7">
                      <Icon name={c.icon} size={22} />
                    </span>
                    <span className="block font-serif text-xl font-bold tracking-[-0.01em] text-ink md:text-2xl">{c.name.replace(" Calculator", "")}</span>
                    <span className="mt-1.5 block text-sm leading-snug text-muted">{c.short}</span>
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-accent">
                    Open <span className="pm-arrow" aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 04 Learn ------------------------------------------------------------------------------ */}
      <section className="pm-section wrap" aria-labelledby="learn-title">
        <SectionIntro id="learn-title" num="04" label="Learn" title="Learn to think" em="like an investor." dek="Explainers and money guides in plain language." />
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {[
            { name: "Stock Market IQ", href: "/stock-market-iq/", items: learn },
            { name: "Personal Finance", href: "/personal-finance/", items: money },
          ].map((col) => (
            <div key={col.href}>
              <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
                <h3 className="font-serif text-2xl font-bold tracking-[-0.015em] text-ink">{col.name}</h3>
                <Link prefetch={false} href={col.href} className="link-more">
                  All <span className="pm-arrow" aria-hidden>→</span>
                </Link>
              </div>
              <ol>
                {col.items.map((s, i) => (
                  <li key={s.slug} className="border-b border-rule">
                    <Link prefetch={false} href={s.path} className="group grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-4">
                      <span className="font-serif text-lg font-light text-accent-bright">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium leading-snug text-ink group-hover:underline group-hover:decoration-accent-bright group-hover:decoration-2 group-hover:underline-offset-4">{s.title}</span>
                      <span className="pm-meta whitespace-nowrap">{s.readTime} min</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* The morning brief --------------------------------------------------------------------- */}
      <section id="newsletter" className="surface-ink band-closing scroll-mt-20" aria-labelledby="brief-title">
        <div className="wrap grid gap-10 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:gap-16 md:py-24">
          <div>
            <p className="eyebrow">The morning brief</p>
            <h2 id="brief-title" className="tt-title mt-5 text-white">
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
