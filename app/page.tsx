import Image from "next/image";
import Link from "next/link";
import { CompanyCard } from "@/components/company-card";
import { IpoDesk } from "@/components/home/ipo-desk";
import { JsonLd } from "@/components/json-ld";
import { Kicker } from "@/components/kicker";
import { NewsletterForm } from "@/components/newsletter-form";
import { Photo } from "@/components/photo";
import { getArticleBySlug, getArticleCards, getArticlesBySection, getCalculators, getEditorial, getPhoto, toCard, type ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getIpos, istToday } from "@/lib/ipo";

const pad = (n: number) => String(n).padStart(2, "0");

/** Date and read time, in small capitals */
function Meta({ story, className = "" }: { story: ArticleCard; className?: string }) {
  return (
    <p className={`pm-meta ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time> · {story.readTime} min read
    </p>
  );
}

/** A section's opening, as on the house's pages: a black rule, the bracketed number and label, a Didone title */
function SectionIntro({ num, label, title, em, href, linkLabel, id }: { num: string; label: string; title: string; em?: string; href?: string; linkLabel?: string; id: string }) {
  return (
    <div className="mb-12 grid gap-6 border-t border-ink pt-5 md:mb-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <p className="tt-label">
          <b>[{num}]</b> {label}
        </p>
        <h2 id={id} className="tt-title mt-8 md:mt-10">
          {title}
          {em ? (
            <>
              {" "}
              <em>{em}</em>
            </>
          ) : null}
        </h2>
      </div>
      {href ? (
        <Link prefetch={false} href={href} className="tt-cta justify-self-start">
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
  // Four of the most used; the rest are a click away
  const featuredCalcs = ["sip-calculator", "income-tax-calculator", "home-loan-emi-calculator", "ppf-calculator"].flatMap((slug) => calcs.filter((c) => c.slug === slug));
  const ipos = getIpos();

  return (
    <>
      {/* Hero: the promise in the Didone, the exchange running off the right edge ---------------- */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="tt-hero-photo absolute inset-y-0 right-0 hidden w-[60%] lg:block">
          <Image src={hero.src} alt="The BSE building on Dalal Street, Mumbai" fill priority sizes="60vw" className="object-cover object-[50%_25%]" />
          <p className="absolute bottom-3 right-5 z-[2] text-[0.625rem] text-white/85">Photo: {hero.credit}</p>
        </div>
        <div className="wrap relative grid content-center py-14 md:py-20 lg:min-h-[min(76vh,720px)]">
          <div className="max-w-[44rem]">
            <p className="tt-label">Markets · IPOs · Personal finance</p>
            <h1 id="hero-title" className="tt-hero-title mt-8 md:mt-10">
              Indian markets, <em>made clear.</em>
            </h1>
            <p className="mt-8 max-w-[30rem] text-lg leading-relaxed text-ink-2 md:mt-10">
              IPOs, results, company analysis and personal finance, written by people who follow India&apos;s markets every day. No jargon, no tips, every figure sourced.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-3">
              <Link prefetch={false} href="/ipo/" className="tt-cta">
                Explore the IPO desk <span className="pm-arrow" aria-hidden>→</span>
              </Link>
              <Link prefetch={false} href="/news/" className="tt-cta">
                Read today&apos;s news <span className="pm-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
        {/* Phones and tablets: the picture follows the words, edge to edge */}
        <figure className="tt-hero-photo relative h-[340px] sm:h-[440px] lg:hidden">
          <Image src={hero.src} alt="" fill sizes="100vw" className="object-cover object-[50%_30%]" />
          <figcaption className="absolute bottom-3 right-4 z-[2] text-[0.625rem] text-white/85">Photo: {hero.credit}</figcaption>
        </figure>
      </section>

      {/* [01] Latest news, straight under the hero --------------------------------------------- */}
      <section className="wrap pb-20 pt-14 md:pb-28 md:pt-20" aria-labelledby="latest-title">
        <SectionIntro id="latest-title" num="01" label="Latest market news" title="Today on" em="TradeTarget." href="/news/" linkLabel="View all news" />
        <div className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-10">
          {latest.map((s) => (
            <article key={s.slug} className="group">
              <Link prefetch={false} href={s.path} className="block">
                <Photo image={s.image} sizes="(min-width: 768px) 420px, 100vw" crop="compact" />
                <Kicker label={s.kicker} className="mt-5 block" />
                <h3 className="mt-3 font-serif text-2xl font-medium leading-[1.12] tracking-[-0.015em] text-ink group-hover:underline group-hover:decoration-accent-bright group-hover:decoration-1 group-hover:underline-offset-4">
                  {s.title}
                </h3>
                <Meta story={s} className="mt-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* [02] IPO desk ---------------------------------------------------------------------- */}
      <section className="pm-section wrap pt-0 md:pt-0" aria-labelledby="ipo-title">
        <SectionIntro id="ipo-title" num="02" label="IPO desk" title="Every issue," em="in one place." href="/ipo/" linkLabel="Open the IPO dashboard" />
        <IpoDesk ipos={ipos} buildDate={istToday()} />
      </section>

      {/* [03] Company analysis -------------------------------------------------------------- */}
      <section className="pm-section wrap pt-0 md:pt-0" aria-labelledby="analysis-title">
        <SectionIntro id="analysis-title" num="03" label="Share analysis" title="Companies," em="read as businesses." href="/share-analysis/" linkLabel="All analysis" />
        {/* A swipeable row on phones, three across from 768px */}
        <ul className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-10 md:overflow-visible md:px-0 md:pb-0">
          {analysis.map((s) => (
            <li key={s.slug} className="w-[84%] shrink-0 snap-start md:w-auto">
              <CompanyCard story={s} />
            </li>
          ))}
        </ul>
      </section>

      {/* [04] Calculators ------------------------------------------------------------------- */}
      <section className="pm-section wrap pt-0 md:pt-0" aria-labelledby="calc-title">
        <SectionIntro id="calc-title" num="04" label="Calculators" title="Plan with" em="numbers." href="/calculators/" linkLabel={`All ${calcs.length} calculators`} />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-x-10">
          {featuredCalcs.map((c, i) => (
            <li key={c.slug}>
              <Link prefetch={false} href={`/calculators/${c.slug}/`} className="pm-card pm-lift group flex h-full flex-col justify-between gap-8 pt-5">
                <span>
                  <span className="tt-label">
                    <b>[{pad(i + 1)}]</b>
                  </span>
                  <span className="mt-6 block font-serif text-3xl font-normal leading-none tracking-[-0.02em] text-ink md:text-4xl">{c.name.replace(" Calculator", "")}</span>
                  <span className="mt-3 block text-sm leading-snug text-muted">{c.short}</span>
                </span>
                <span className="tt-label flex items-center gap-3 group-hover:text-accent">
                  Open <span className="pm-arrow text-accent-bright" aria-hidden>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* [05] Learn ------------------------------------------------------------------------- */}
      <section className="pm-section wrap pt-0 md:pt-0" aria-labelledby="learn-title">
        <SectionIntro id="learn-title" num="05" label="Learn" title="Learn to think" em="like an investor." />
        <div className="grid gap-14 md:grid-cols-2 md:gap-16">
          {[
            { name: "Stock Market IQ", href: "/stock-market-iq/", items: learn },
            { name: "Personal Finance", href: "/personal-finance/", items: money },
          ].map((col) => (
            <div key={col.href}>
              <div className="flex items-baseline justify-between border-b border-ink pb-3">
                <h3 className="font-serif text-3xl font-normal tracking-[-0.015em] text-ink">{col.name}</h3>
                <Link prefetch={false} href={col.href} className="tt-label hover:text-accent">
                  All <span className="text-accent-bright" aria-hidden>→</span>
                </Link>
              </div>
              <ol>
                {col.items.map((s, i) => (
                  <li key={s.slug} className="border-b border-rule">
                    <Link prefetch={false} href={s.path} className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-4">
                      <span className="tt-label">
                        <b>[{pad(i + 1)}]</b>
                      </span>
                      <span className="font-medium leading-snug text-ink group-hover:underline group-hover:decoration-accent-bright group-hover:underline-offset-4">{s.title}</span>
                      <span className="pm-meta whitespace-nowrap">{s.readTime} min</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* The morning brief ---------------------------------------------------------------------- */}
      <section id="newsletter" className="surface-paper-2 band-closing scroll-mt-20" aria-labelledby="brief-title">
        <div className="wrap grid gap-12 py-20 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end md:gap-20 md:py-28">
          <div>
            <p className="tt-label">
              <b>[06]</b> The morning brief
            </p>
            <h2 id="brief-title" className="tt-title mt-8 md:mt-10">
              The market, <em>before 8 am.</em>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2">One email on trading days: IPOs opening that week, results due, and one clear explainer. No tips, no noise.</p>
          </div>
          <div>
            <NewsletterForm id="home-brief" />
            <p className="pm-meta mt-4">Free. Unsubscribe whenever you like.</p>
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
