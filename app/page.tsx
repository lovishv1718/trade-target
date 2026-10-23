import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { IpoBoard } from "@/components/home/ipo-board";
import { LearnAccordion, type LearnGroup } from "@/components/home/learn-accordion";
import { Icon, type IconName } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
import { Photo } from "@/components/photo";
import { getArticleBySlug, getArticlesBySection, getAuthor, getCompany, getEditorial, getPhoto, toCard, type ArticleCard } from "@/lib/content";
import { formatDate, formatDayMonth, formatNumber } from "@/lib/format";
import { getIpos, istToday } from "@/lib/ipo";

const card = (slug: string) => toCard(getArticleBySlug(slug)!);

/** Date and read time, in the mono voice */
function Meta({ story, className = "" }: { story: ArticleCard; className?: string }) {
  return (
    <p className={`pm-meta ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time> · {story.readTime} min read
    </p>
  );
}

/** The underlined call to action: mono capitals, the arrow set apart */
function Cta({ href, children, className = "" }: { href: string; children: string; className?: string }) {
  return (
    <Link prefetch={false} href={href} className={`hm-cta ${className}`}>
      {children} <span className="pm-arrow" aria-hidden>→</span>
    </Link>
  );
}

/** Profit a year ago against profit now, as a short rising or falling line */
function PatLine({ from, to, label }: { from: number; to: number; label: string }) {
  const lo = Math.min(from, to) * 0.85;
  const hi = Math.max(from, to);
  const y = (v: number) => 34 - ((v - lo) / (hi - lo)) * 28;
  return (
    <svg role="img" aria-label={label} width="96" height="40" viewBox="0 0 96 40" fill="none" className="shrink-0 text-up">
      <path d="M2 38h92" stroke="var(--color-rule)" />
      <path d={`M8 ${y(from)}L88 ${y(to)}`} stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy={y(from)} r="2.5" fill="currentColor" opacity="0.45" />
      <circle cx="88" cy={y(to)} r="3" fill="currentColor" />
    </svg>
  );
}

const CALCS: { slug: string; name: string; text: string; icon: IconName }[] = [
  { slug: "sip-calculator", name: "SIP Calculator", text: "What a monthly SIP could grow to.", icon: "columns" },
  { slug: "personal-loan-emi-calculator", name: "EMI Calculator", text: "Monthly instalment for any loan.", icon: "card" },
  { slug: "ppf-calculator", name: "PPF Calculator", text: "Maturity of your Public Provident Fund.", icon: "piggy" },
  { slug: "fd-calculator", name: "FD Calculator", text: "Maturity value of a fixed deposit.", icon: "coins" },
  { slug: "epf-calculator", name: "EPF Calculator", text: "Your provident fund balance at retirement.", icon: "document" },
  { slug: "retirement-calculator", name: "Retirement Calculator", text: "The corpus you need, and the SIP to get there.", icon: "pie" },
  { slug: "home-loan-emi-calculator", name: "Home Loan Calculator", text: "EMI and interest on a home loan.", icon: "home" },
  { slug: "step-up-sip-calculator", name: "Step-up SIP Calculator", text: "A SIP that rises with your income every year.", icon: "growth" },
];

const PROMISES = [
  { title: ["Every figure is sourced.", "Nothing is guessed."], text: "Price bands, dates and results come from offer documents and filings. Where we don’t have a number, we say so rather than estimate one." },
  { title: ["Explained, not hyped.", "No calls to buy or sell."], text: "Every term is defined the first time it appears, in plain language. We tell you what a company does and how it earns, not what to do with your money." },
  { title: ["Kept current,", "not left to go stale."], text: "IPO status is worked out from each issue’s own dates, and pages are updated when figures change, long after the news cycle moves on." },
];

const SERVICES = [
  { title: "Financial content writing", text: "Market news, IPO coverage, explainers and long-form guides." },
  { title: "Video script writing", text: "Scripts for explainer and market-update videos." },
  { title: "SEO-led editorial planning", text: "Topics chosen for search demand, written for readers." },
];

// The colour laid over each analysis panel's picture
const PANEL: Record<string, string> = {
  "colgate-palmolive-fundamental-analysis": "linear-gradient(100deg, rgb(104 18 14 / 0.95) 0%, rgb(150 30 22 / 0.84) 48%, rgb(196 62 38 / 0.38) 100%)",
  "godrej-consumer-products-fundamental-analysis": "linear-gradient(100deg, rgb(110 62 34 / 0.95) 0%, rgb(158 98 60 / 0.82) 48%, rgb(206 154 114 / 0.36) 100%)",
};

export default function HomePage() {
  const ed = getEditorial();
  const home = ed.home;
  const hero = getPhoto("bse-building")!;

  const feature = card(home.feature.slug);
  const featureAuthor = getAuthor(feature.author);
  const cards = home.cards.map((c) => {
    const story = card(c.slug);
    const photo = "photo" in c && c.photo ? getPhoto(c.photo) : null;
    return { ...story, image: photo ?? story.image };
  });

  const lead = card(ed.homepage.shareAnalysisLead);
  const leadCompany = getCompany(lead.slug);
  const rows = ["colgate-palmolive-fundamental-analysis", "godrej-consumer-products-fundamental-analysis"].map(card);

  const groups: LearnGroup[] = [
    { name: "Stock Market IQ", href: "/stock-market-iq/", section: "stock-market-iq", kicker: "Stock Market IQ" },
    { name: "Personal Finance", href: "/personal-finance/", section: "personal-finance", kicker: "Personal Finance" },
    { name: "Blog Junction", href: "/blog-junction/", section: "blog-junction", kicker: "Blog Junction" },
  ].map((g) => {
    const items = getArticlesBySection(g.section).map(toCard).slice(0, 3);
    const f = items[0];
    const summaries = home.learnSummaries as Record<string, string>;
    return {
      name: g.name,
      href: g.href,
      items: items.map((s) => ({ title: s.title, path: s.path, readTime: s.readTime })),
      feature: { title: f.title, path: f.path, readTime: f.readTime, kicker: g.kicker, summary: summaries[f.slug] ?? f.standfirst, date: f.date, dateLabel: formatDate(f.date), image: f.image },
    };
  });

  return (
    <>
      {/* Hero: the promise over the exchange, the photograph fading into the page on the left ---- */}
      <section className="hm-hero" aria-labelledby="hero-title">
        <div className="hm-hero-photo lg:left-[38%]">
          <Image src={hero.src} alt="" fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover object-[50%_70%] lg:object-[45%_30%]" />
          <p className="absolute bottom-3 right-4 text-[0.625rem] text-white/85">Photo: {hero.credit}</p>
        </div>
        <div className="wrap flex min-h-[860px] flex-col justify-start pb-[340px] pt-16 sm:min-h-[900px] lg:min-h-[min(86vh,800px)] lg:justify-center lg:py-24">
          <div className="max-w-[44rem] lg:pl-[4.5rem]">
            <h1 id="hero-title" className="hm-display">
              <span className="block">Indian</span>
              <span className="block">markets,</span>
              <em className="block">made clear.</em>
            </h1>
            <p className="hm-hero-lede mt-9 max-w-[33rem] text-lg leading-relaxed text-muted md:max-w-none md:text-[1.3125rem] md:leading-[1.55]">
              <span className="md:block">IPOs, results, company analysis and personal finance,</span> <strong className="md:block">written by people who follow India’s markets every day.</strong>{" "}
              <span className="md:block">No jargon, no tips, every figure sourced.</span>
            </p>
            <Cta href="/ipo/" className="mt-12">
              Explore the IPO desk
            </Cta>
          </div>
        </div>
      </section>

      {/* The dark statement ---------------------------------------------------------------- */}
      <section className="hm-dark surface-ink py-24 md:py-32" aria-labelledby="stmt-title">
        <div className="wrap">
          <h2 id="stmt-title" className="hm-mid max-w-[57rem] text-white">
            You want to understand the market. <span className="soft">But most of what you read is tips, noise and jargon.</span>
          </h2>
          <div className="mt-10 max-w-[52rem] space-y-5 text-lg leading-relaxed text-white/75">
            <p>You know the market rewards people who understand what they own.</p>
            <p>But headlines chase prices, forums chase tips, and most explainers assume you already know the words. Every read ends with more questions than answers.</p>
          </div>
          <div className="mt-16 grid border border-[#2f2d2a] md:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.text} className="hm-promise px-7 py-9 md:px-10 md:py-11">
                <h3 className="font-serif text-[1.75rem] leading-[1.18] tracking-[-0.015em] text-white md:text-[2rem]">
                  {p.title[0]}
                  <br />
                  {p.title[1]}
                </h3>
                <p className="mt-6 leading-relaxed text-white/70">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today on TradeTarget -------------------------------------------------------------- */}
      <section className="wrap py-20 md:py-28" aria-labelledby="news-title">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="eyebrow">Today on TradeTarget</p>
            <h2 id="news-title" className="hm-title mt-5">
              <span className="block">What moved,</span>
              <span className="block">
                <span className="soft">and</span> <em>why it matters.</em>
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-8 lg:mb-3 lg:gap-10">
            <p className="hm-dek max-w-[19rem]">In-depth analysis, sharp insights and market news — all in one place, so you can stay ahead.</p>
            <span aria-hidden className="hidden h-14 w-px bg-ink/40 sm:block" />
            <Cta href="/news/">All news</Cta>
          </div>
        </div>

        <article className="group mt-12 grid gap-8 md:mt-14 lg:grid-cols-[minmax(0,1.42fr)_minmax(0,1fr)] lg:gap-10">
          <Link prefetch={false} href={feature.path} tabIndex={-1} aria-hidden className="block">
            <Photo image={feature.image} sizes="(min-width: 1024px) 760px, 100vw" crop="panorama" />
          </Link>
          <div className="flex flex-col justify-center">
            <p className="hm-label">{home.feature.kicker}</p>
            <h3 className="mt-4 font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] text-ink md:text-[2.375rem]">
              <Link prefetch={false} href={feature.path} className="group-hover:text-accent">
                {feature.title}
              </Link>
            </h3>
            <p className="hm-quote mt-6">{home.feature.summary}</p>
            <p className="mt-6 text-sm font-medium text-ink">{featureAuthor.name}</p>
            <Meta story={feature} className="mt-1.5" />
            <div className="mt-6 flex flex-wrap items-end justify-between gap-8 border-t border-rule pt-6">
              <dl className="flex gap-12">
                {home.feature.stats.map((s) => (
                  <div key={s.label} className="flex flex-col [&>dt]:order-2">
                    <dt className="pm-meta mt-2 max-w-[10rem] leading-relaxed">{s.label}</dt>
                    <dd className="hm-stat">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <Cta href={feature.path}>Read the story</Cta>
            </div>
          </div>
        </article>

        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {cards.map((s, i) => (
            <article key={s.slug} className={`group ${i ? "lg:border-l lg:border-rule lg:pl-9" : ""} ${i < 3 ? "lg:pr-9" : ""}`}>
              <Link prefetch={false} href={s.path} className="block">
                <Photo image={s.image} sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw" crop="band" />
                <p className="hm-label mt-5">{s.section === "ipo" ? "IPO" : "News"}</p>
                <h3 className="mt-2.5 font-serif text-[1.375rem] leading-[1.2] tracking-[-0.01em] text-ink group-hover:text-accent">{s.title}</h3>
                <Meta story={s} className="mt-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* IPO desk --------------------------------------------------------------------------- */}
      <section className="hm-window py-20 md:py-28" aria-labelledby="ipo-title">
        <div className="wrap">
          <IpoBoard
            ipos={getIpos()}
            buildDate={istToday()}
            intro={
              <div>
                <p className="eyebrow">IPO desk</p>
                <h2 id="ipo-title" className="hm-title mt-5">
                  <span className="block">Every issue,</span>
                  <em className="block">always current.</em>
                </h2>
                <p className="hm-dek mt-6 max-w-[37rem] text-lg">Open, upcoming, in allotment or listed: worked out from each issue’s own dates, so nothing here goes stale.</p>
              </div>
            }
            aside={
              <section aria-labelledby="results-heading" className="self-start border border-rule bg-white px-6 pb-2 pt-6 md:px-9">
                <div className="flex items-center justify-between gap-4 border-b border-rule pb-5">
                  <h3 id="results-heading" className="hm-label font-medium text-ink">
                    Results this week
                  </h3>
                  <Link prefetch={false} href="/news/?topic=Results" className="hm-label hover:text-accent">
                    News <span aria-hidden>→</span>
                  </Link>
                </div>
                <ul>
                  {home.results.map((r) => (
                    <li key={r.slug} className="border-b border-rule last:border-b-0">
                      <Link prefetch={false} href={getArticleBySlug(r.slug)!.path} className="group flex items-center gap-4 py-6">
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-[1.375rem] leading-snug text-ink group-hover:text-accent">{r.name}</span>
                          <span className="mt-1 block text-[0.9375rem] text-muted">{r.line}</span>
                        </span>
                        <PatLine from={r.pat[0]} to={r.pat[1]} label={`Profit after tax ₹${formatNumber(r.pat[0])} crore a year ago, ₹${formatNumber(r.pat[1])} crore this quarter`} />
                        <span className="w-24 text-right">
                          <span className="block text-[2rem] font-semibold leading-none text-up">+{r.change}%</span>
                          <span className="pm-meta mt-2 block">Profit, YoY</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            }
          />
        </div>
      </section>

      {/* Share analysis ---------------------------------------------------------------------- */}
      <section className="wrap py-20 md:py-28" aria-labelledby="analysis-title">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="eyebrow">Share analysis</p>
            <h2 id="analysis-title" className="hm-title mt-5">
              <span className="block">Companies,</span>
              <span className="block">
                <span className="soft">read as</span> <em>businesses.</em>
              </span>
            </h2>
            <p className="hm-dek mt-5 max-w-[30rem] text-lg">Business model, financials, valuation and the questions worth asking before you buy.</p>
          </div>
          <div className="flex items-center gap-10">
            <span aria-hidden className="hidden h-14 w-px bg-ink/40 sm:block" />
            <Cta href="/share-analysis/">All analyses</Cta>
          </div>
        </div>

        <article className="group mt-12 grid border border-rule bg-white lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
          <Link prefetch={false} href={lead.path} tabIndex={-1} aria-hidden className="relative block">
            <Photo image={lead.image} sizes="(min-width: 1024px) 620px, 100vw" crop="standard" className="lg:absolute lg:inset-0 lg:[&_.photo-frame]:h-full lg:[&_.photo-frame]:aspect-auto" />
            <span className="absolute bottom-6 right-6 inline-flex min-h-11 items-center gap-3 border border-white/85 px-5 font-mono text-xs uppercase tracking-[0.14em] text-white">
              Read <span aria-hidden>→</span>
            </span>
          </Link>
          <div className="flex flex-col justify-center px-6 py-9 md:px-11">
            <p className="hm-label">Fundamental analysis</p>
            <h3 className="mt-4 font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] text-ink md:text-[2.375rem]">
              <Link prefetch={false} href={lead.path} className="group-hover:text-accent">
                {lead.title}
              </Link>
            </h3>
            <p className="hm-quote mt-6">{leadCompany?.summary ?? lead.standfirst}</p>
            <p className="mt-6 text-sm font-medium text-ink">{getAuthor(lead.author).name}</p>
            <Meta story={lead} className="mt-1.5" />
            <dl className="mt-6 grid grid-cols-2 gap-6 border-t border-rule pt-6">
              <div className="flex flex-col [&>dt]:order-2">
                <dt className="pm-meta mt-2">Reading time</dt>
                <dd className="hm-stat font-sans font-medium">{lead.readTime} min</dd>
              </div>
              {leadCompany ? (
                <div className="flex flex-col [&>dt]:order-2">
                  <dt className="pm-meta mt-2 leading-relaxed">
                    Key areas
                    <span className="mt-1 block text-[0.625rem] text-faint">{leadCompany.covers.join(", ")}</span>
                  </dt>
                  <dd className="hm-stat font-sans font-medium">{String(leadCompany.covers.length).padStart(2, "0")}</dd>
                </div>
              ) : null}
            </dl>
            <Cta href={lead.path} className="mt-7 self-start">
              Read the analysis
            </Cta>
          </div>
        </article>

        <div className="mt-6 grid gap-6">
          {rows.map((s) => {
            const c = getCompany(s.slug);
            return (
              <article key={s.slug} className="group grid border border-rule bg-white lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1fr)]">
                <div className="flex flex-col justify-center px-6 py-9 md:px-11">
                  <span aria-hidden className="block h-0.5 w-10 bg-accent-bright" />
                  <h3 className="mt-6 font-serif text-[2rem] leading-tight tracking-[-0.02em] text-ink md:text-[2.25rem]">{c?.name.replace(" (India)", "") ?? s.title}</h3>
                  <p className="mt-3 max-w-[26rem] text-[1.0625rem] leading-relaxed text-muted">How the business makes money, what the numbers say, and the questions worth asking before you buy the shares.</p>
                  <Cta href={s.path} className="mt-6 self-start">
                    Read the analysis
                  </Cta>
                </div>
                <Link prefetch={false} href={s.path} className="hm-panel flex min-h-[15rem] flex-col justify-between px-7 py-9 md:px-12" style={{ "--panel": PANEL[s.slug] } as CSSProperties}>
                  <Photo image={s.image} sizes="(min-width: 1024px) 640px, 100vw" crop="wide" className="absolute inset-0 -z-[2] [&_.photo-frame]:h-full [&_.photo-frame]:aspect-auto" />
                  <h4 className="max-w-[20rem] font-serif text-[1.75rem] leading-[1.12] tracking-[-0.015em] md:text-[2rem]">{s.title}</h4>
                  <dl className="mt-8 grid max-w-[26rem] grid-cols-2 gap-6 border-t border-white/40 pt-6">
                    <div className="flex flex-col [&>dt]:order-2">
                      <dt className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white/85">Reading time</dt>
                      <dd className="text-[1.75rem] font-medium leading-none">{s.readTime} min</dd>
                    </div>
                    <div className="flex flex-col [&>dt]:order-2">
                      <dt className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white/85">Published {s.date.slice(0, 4)}</dt>
                      <dd className="text-[1.75rem] font-medium leading-none">{formatDayMonth(s.date)}</dd>
                    </div>
                  </dl>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Calculators --------------------------------------------------------------------------- */}
      <section className="relative overflow-hidden py-20 md:py-28" aria-labelledby="calc-title">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-[30rem] w-[34rem] lg:block">
          <div className="hm-halo absolute -left-10 top-16 h-[26rem] w-[26rem]" />
          <div className="absolute inset-y-0 right-0 w-[24rem] [mask-image:linear-gradient(to_left,black_55%,transparent),linear-gradient(to_top,transparent,black_20%)] [mask-composite:intersect]">
            <Image src={hero.src} alt="" fill sizes="384px" className="object-cover object-[55%_15%] [filter:sepia(0.3)_saturate(1.2)_brightness(1.05)]" />
          </div>
        </div>
        <div className="wrap relative">
          <p className="eyebrow">Calculators</p>
          <h2 id="calc-title" className="hm-title mt-5">
            <span className="block">Plan with numbers.</span>
            <span className="block">
              <span className="soft">Sixteen</span> <em>calculators.</em>
            </span>
          </h2>
          <p className="hm-dek mt-6 max-w-[38rem] text-lg">SIP, PPF, EPF, FD, retirement and every kind of loan EMI, each showing how the answer was worked out.</p>
          <Cta href="/calculators/" className="mt-8">
            All calculators
          </Cta>
          <ul className="hm-grid mt-12 grid border-l border-t border-rule bg-white/40 sm:grid-cols-2 lg:grid-cols-4">
            {CALCS.map((c) => (
              <li key={c.slug}>
                <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex h-full flex-col px-7 py-8 transition-colors hover:bg-white">
                  <Icon name={c.icon} size={32} className="hm-icon" />
                  <span className="mt-5 block font-serif text-[1.625rem] leading-tight tracking-[-0.015em] text-ink group-hover:text-accent">{c.name}</span>
                  <span className="mb-6 mt-2 block text-[0.9375rem] leading-snug text-muted">{c.text}</span>
                  <span className="hm-cta mt-auto min-h-0 gap-5 self-start pt-6 text-xs">
                    Open <span className="pm-arrow" aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Learn ---------------------------------------------------------------------------------- */}
      <section className="wrap py-20 md:py-28" aria-labelledby="learn-title">
        <LearnAccordion
          groups={groups}
          intro={
            <div className="lg:px-5">
              <p className="eyebrow">Learn</p>
              <h2 id="learn-title" className="hm-title mt-5">
                <span className="block">Learn to think</span>
                <span className="block">
                  like an <em>investor.</em>
                </span>
              </h2>
              <p className="hm-dek mt-6 max-w-[31rem] text-lg">Market concepts from first principles, from dividend reinvestment to commodity exchanges.</p>
            </div>
          }
        />
      </section>

      {/* Content services and the morning brief, in one frame ---------------------------------- */}
      <section className="wrap pb-20 md:pb-28" aria-labelledby="services-title">
        <div className="border border-rule">
          <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
            <div className="px-6 py-12 md:px-16 md:py-16">
              <p className="eyebrow">TradeTarget content services</p>
              <h2 id="services-title" className="hm-mid mt-6">
                <span className="block">Every article here</span>
                <span className="block">
                  is a <em>writing sample.</em>
                </span>
              </h2>
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">
                The team that writes TradeTarget writes for brokers, fintechs, AMCs and finance brands. If you like how this reads, we can write like this for you.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link prefetch={false} href="/hire-writers/" className="btn min-h-14 px-8">
                  See our services <span aria-hidden>→</span>
                </Link>
                <Link prefetch={false} href="/hire-writers/#brief" className="btn btn-secondary min-h-14 px-8">
                  Request a sample <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
            <div className="hm-orange px-6 py-12 text-ink md:px-12 md:py-14">
              <Image src={getPhoto("writer-laptop")!.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              <ol>
                {SERVICES.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 border-b border-white/35 py-6 first:pt-0">
                    <span className="pt-1 font-mono text-sm text-white">{String(i + 1).padStart(2, "0")}</span>
                    <span className="hm-rule-v pl-6">
                      <span className="block font-serif text-[1.625rem] leading-tight tracking-[-0.015em]">{s.title}</span>
                      <span className="mt-2 block text-[0.9375rem] text-ink/75">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <dl className="mt-8 grid grid-cols-2">
                <div className="flex flex-col [&>dt]:order-2">
                  <dt className="mt-2 font-mono text-xs uppercase tracking-[0.14em]">Articles published</dt>
                  <dd className="font-serif text-[3.25rem] leading-none">279</dd>
                </div>
                <div className="flex flex-col [&>dt]:order-2 border-l border-ink/30 pl-10">
                  <dt className="mt-2 font-mono text-xs uppercase tracking-[0.14em]">IPO deep-dives</dt>
                  <dd className="font-serif text-[3.25rem] leading-none">88</dd>
                </div>
              </dl>
            </div>
          </div>
          <div id="newsletter" className="hm-brief scroll-mt-28 border-t border-rule px-6 py-14 text-center md:py-16">
            <p className="eyebrow">The TradeTarget brief</p>
            <h2 className="hm-mid mx-auto mt-5 max-w-[72rem] text-[clamp(2rem,3.5vw,3.5rem)]">
              Five minutes that <em>make sense</em> of the market.
            </h2>
            <p className="mt-4 text-lg text-muted">IPO dates, results and one clear explainer, every weekday morning. No tips, no noise.</p>
            <div className="mx-auto mt-8 max-w-[41rem] text-left">
              <NewsletterForm id="home-brief" inline cta="Subscribe" />
            </div>
            <p className="pm-meta mt-4">Free · Unsubscribe whenever you like</p>
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
