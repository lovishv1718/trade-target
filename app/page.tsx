import Image from "next/image";
import Link from "next/link";
import { IpoBoard } from "@/components/home/ipo-board";
import { LearnAccordion, type LearnGroup } from "@/components/home/learn-accordion";
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

/** The short arrow the section designs draw after a call to action */
function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 11 6" fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M0 3h10M7.4.4 10.2 3 7.4 5.6" />
    </svg>
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

/** A profit trend as the design draws it: a line over a pale fill, a dot at the latest point */
function Spark({ id, values, label }: { id: string; values: number[]; label: string }) {
  const W = 130, H = 56, top = 1, bottom = 49, base = 55;
  const lo = Math.min(...values), hi = Math.max(...values);
  const pts = values.map((v, i) => [1 + (i * (W - 4)) / (values.length - 1), bottom - ((v - lo) / (hi - lo || 1)) * (bottom - top)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const [ex, ey] = pts[pts.length - 1];
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${W} ${H}`} className="hm-rs-spark" fill="none">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d8a57" stopOpacity="0.15" />
          <stop offset="1" stopColor="#2d8a57" stopOpacity="0.09" />
        </linearGradient>
      </defs>
      <path d={`${line}L${ex.toFixed(1)} ${base}L${pts[0][0].toFixed(1)} ${base}Z`} fill={`url(#spark-${id})`} />
      <path d={line} stroke="#2d8a57" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r="2.4" fill="#1f6f43" />
    </svg>
  );
}

// The picture each issue's row shows, where the design gives one
const IPO_THUMBS: Record<string, string> = {
  "jio-platforms-ipo": "/images/ipo/thumb-jio-platforms-ipo.webp",
  "paras-healthcare-ipo": "/images/ipo/thumb-paras-healthcare-ipo.webp",
  "bonfiglioli-transmissions-ipo": "/images/ipo/thumb-bonfiglioli-transmissions-ipo.webp",
  "zetwerk-manufacturing-ipo": "/images/ipo/thumb-zetwerk-manufacturing-ipo.webp",
};

// The eight tiles: each description split where the design breaks it, and the design's own icon
const CALCS: { slug: string; name: string; text: [string, string?]; icon: string }[] = [
  { slug: "sip-calculator", name: "SIP Calculator", text: ["What a monthly SIP could grow to."], icon: "sip" },
  { slug: "personal-loan-emi-calculator", name: "EMI Calculator", text: ["Monthly instalment for any loan."], icon: "emi" },
  { slug: "ppf-calculator", name: "PPF Calculator", text: ["Maturity of your Public Provident", "Fund."], icon: "ppf" },
  { slug: "fd-calculator", name: "FD Calculator", text: ["Maturity value of a fixed deposit."], icon: "fd" },
  { slug: "epf-calculator", name: "EPF Calculator", text: ["Your provident fund balance at", "retirement."], icon: "epf" },
  { slug: "retirement-calculator", name: "Retirement Calculator", text: ["The corpus you need, and the SIP", "to get there."], icon: "retirement" },
  { slug: "home-loan-emi-calculator", name: "Home Loan Calculator", text: ["EMI and interest on a home loan."], icon: "home-loan" },
  { slug: "step-up-sip-calculator", name: "Step-up SIP Calculator", text: ["A SIP that rises with your income", "every year."], icon: "step-up" },
];

const PROMISES = [
  { title: ["Every figure is sourced.", "Nothing is guessed."], text: "Price bands, dates and results come from offer documents and filings. Where we don’t have a number, we say so rather than estimate one." },
  { title: ["Explained, not hyped.", "No calls to buy or sell."], text: "Every term is defined the first time it appears, in plain language. We tell you what a company does and how it earns, not what to do with your money." },
  { title: ["Kept current,", "not left to go stale."], text: "IPO status is worked out from each issue’s own dates, and pages are updated when figures change, long after the news cycle moves on." },
];

// The three services, each description split where the design breaks it
const SERVICES: { title: string; text: string[] }[] = [
  { title: "Financial content writing", text: ["Market news, IPO coverage, explainers and long-form", "guides."] },
  { title: "Video script writing", text: ["Scripts for explainer and market-update videos."] },
  { title: "SEO-led editorial planning", text: ["Topics chosen for search demand, written for readers."] },
];

// Each analysis row's picture panel, from the design, with its title broken where the design breaks it
const PANELS: Record<string, { image: string; lines: string[] }> = {
  "colgate-palmolive-fundamental-analysis": { image: "/images/home/analysis-colgate.webp", lines: ["Colgate Palmolive", "Fundamental Analysis"] },
  "godrej-consumer-products-fundamental-analysis": { image: "/images/home/analysis-godrej.webp", lines: ["Godrej Consumer", "Products Fundamental", "Analysis"] },
};
const ROW_NAMES: Record<string, string> = {
  "colgate-palmolive-fundamental-analysis": "Colgate Palmolive",
  "godrej-consumer-products-fundamental-analysis": "Godrej Consumer Products",
};

export default function HomePage() {
  const ed = getEditorial();
  const home = ed.home;

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
      {/* Hero, exactly as designed: the sunset photograph from the design, the words over its sky */}
      <section className="hm-hx" data-hero aria-labelledby="hero-title">
        <div className="hm-hx-in">
          <h1 id="hero-title" className="hm-hx-h1">
            <span>Indian</span>
            <span>markets,</span>
            <em>made clear.</em>
          </h1>
          <p className="hm-hx-lede">
            <span>IPOs, results, company analysis and personal finance,</span> <strong>written by people who follow India’s markets every day.</strong>{" "}
            <span>No jargon, no tips, every figure sourced.</span>
          </p>
          <Link prefetch={false} href="/ipo/" className="hm-hx-cta">
            <span className="t">Explore the IPO desk</span>
            <span className="a" aria-hidden>
              <svg viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M0 4.8H12.8M9 0.7l4.1 4.1L9 8.9" />
              </svg>
            </span>
          </Link>
        </div>
        <div className="hm-hx-photo" role="img" aria-label="The BSE building on Dalal Street at sunset" />
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
      <section className="hm-ipo" aria-labelledby="ipo-title">
        <div aria-hidden className="hm-ipo-bg" />
        <div className="hm-ipo-c">
          <IpoBoard
            ipos={getIpos().map((i) => ({ ...i, thumb: IPO_THUMBS[i.slug] ?? null }))}
            buildDate={istToday()}
            intro={
              <div key="intro" className="hm-ipo-intro">
                <p className="eyebrow">IPO desk</p>
                <h2 id="ipo-title" className="hm-ipo-h">
                  <span>Every issue,</span>
                  <em>always current.</em>
                </h2>
                <p className="hm-ipo-dek">
                  <span>Open, upcoming, in allotment or listed: worked out from each issue’s own</span> <span>dates, so nothing here goes stale.</span>
                </p>
              </div>
            }
            aside={
              <section key="aside" aria-labelledby="results-heading" className="hm-ipo-results">
                <div className="hm-ipo-head">
                  <h3 id="results-heading" className="hm-ipo-hl">
                    Results this week
                  </h3>
                  <Link prefetch={false} href="/news/?topic=Results" className="hm-ipo-hlink">
                    News <span aria-hidden>→</span>
                  </Link>
                </div>
                <ul className="hm-rs-rows">
                  {home.results.map((r) => (
                    <li key={r.slug}>
                      <Link prefetch={false} href={getArticleBySlug(r.slug)!.path} className="hm-rs-row group">
                        <span className="hm-rs-txt">
                          <span className="hm-rs-name">{r.name}</span>
                          <span className="hm-rs-sub">{r.line}</span>
                        </span>
                        <Spark id={r.slug} values={r.sampleTrend} label={`Profit after tax ₹${formatNumber(r.pat[0])} crore a year ago, ₹${formatNumber(r.pat[1])} crore this quarter`} />
                        <span className="hm-rs-fig">
                          <span className="hm-rs-pct">+{r.change}%</span>
                          <span className="hm-rs-lab">Profit, YoY</span>
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
      <section className="hm-an" aria-labelledby="analysis-title">
        <div className="hm-an-c">
          <p className="eyebrow">Share analysis</p>
          <h2 id="analysis-title" className="hm-an-h">
            <span>Companies,</span>
            <span>
              <span className="soft">read as</span> <em>businesses.</em>
            </span>
          </h2>
          <p className="hm-an-dek">
            <span>Business model, financials, valuation and the questions</span> <span>worth asking before you buy.</span>
          </p>
          <span aria-hidden className="hm-an-rule" />
          <Link prefetch={false} href="/share-analysis/" className="hm-an-cta hm-an-all">
            All analyses <Arrow />
          </Link>

          <article className="hm-an-feature group">
            <Link prefetch={false} href={lead.path} tabIndex={-1} aria-hidden className="hm-an-photo">
              <Image src="/images/home/analysis-sail.webp" alt="" width={1138} height={1014} unoptimized />
              <span className="hm-an-read">
                Read <Arrow />
              </span>
            </Link>
            <p className="hm-an-kicker">Fundamental analysis</p>
            <h3 className="hm-an-title">
              <Link prefetch={false} href={lead.path}>
                {lead.title.split(/(?<=–) /).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </Link>
            </h3>
            <p className="hm-an-quote">
              {(leadCompany?.summary ?? lead.standfirst).split(/(?<=:) /).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </p>
            <p className="hm-an-author">{getAuthor(lead.author).name}</p>
            <Meta story={lead} className="hm-an-meta" />
            <span aria-hidden className="hm-an-line" />
            <dl className="hm-an-stats">
              <div>
                <dt>Reading time</dt>
                <dd>{lead.readTime} min</dd>
              </div>
              {leadCompany ? (
                <div>
                  <dt>
                    Key areas
                    <span className="hm-an-keys">{leadCompany.covers.join(", ")}</span>
                  </dt>
                  <dd>{String(leadCompany.covers.length).padStart(2, "0")}</dd>
                </div>
              ) : null}
            </dl>
            <Link prefetch={false} href={lead.path} className="hm-an-cta hm-an-fcta">
              Read the analysis <Arrow />
            </Link>
          </article>

          {rows.map((s) => {
            const panel = PANELS[s.slug];
            return (
              <article key={s.slug} className="hm-an-row group" data-row={s.slug.split("-")[0]}>
                <div className="hm-an-side">
                  <span aria-hidden className="hm-an-accent" />
                  <h3 className="hm-an-name">{ROW_NAMES[s.slug] ?? s.title}</h3>
                  <p className="hm-an-text">
                    <span>How the business makes money, what the</span> <span>numbers say, and the questions worth asking</span> <span>before you buy the shares.</span>
                  </p>
                  <Link prefetch={false} href={s.path} className="hm-an-cta hm-an-rcta">
                    Read the analysis <Arrow />
                  </Link>
                </div>
                <Link prefetch={false} href={s.path} className="hm-an-panel" style={{ backgroundImage: `url(${panel.image})` }}>
                  <span className="hm-an-ptitle">
                    {panel.lines.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                  <span aria-hidden className="hm-an-pline" />
                  <dl className="hm-an-pstats">
                    <div>
                      <dt>Reading time</dt>
                      <dd>{s.readTime} min</dd>
                    </div>
                    <div>
                      <dt>Published {s.date.slice(0, 4)}</dt>
                      <dd>{formatDayMonth(s.date)}</dd>
                    </div>
                  </dl>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Calculators --------------------------------------------------------------------------- */}
      <section className="hm-calc" aria-labelledby="calc-title">
        <div aria-hidden className="hm-calc-bg" />
        <div className="hm-calc-c">
          <p className="eyebrow">Calculators</p>
          <h2 id="calc-title" className="hm-calc-h">
            <span>Plan with numbers.</span>
            <span>
              <span className="soft">Sixteen</span> <em>calculators.</em>
            </span>
          </h2>
          <p className="hm-calc-dek">
            <span>SIP, PPF, EPF, FD, retirement and every kind of loan EMI,</span> <span>each showing how the answer was worked out.</span>
          </p>
          <Link prefetch={false} href="/calculators/" className="hm-calc-cta">
            All calculators <Arrow />
          </Link>
          <ul className="hm-calc-grid">
            {CALCS.map((c) => (
              <li key={c.slug} className="hm-calc-cell" data-icon={c.icon}>
                <Link prefetch={false} href={`/calculators/${c.slug}/`} className="hm-calc-link group">
                  <Image src={`/images/home/calc-${c.icon}.webp`} alt="" width={46} height={44} unoptimized className="hm-calc-icon" />
                  <span className="hm-calc-name">{c.name}</span>
                  <span className="hm-calc-text">
                    {c.text.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                  <span className="hm-calc-open">
                    Open <Arrow />
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
            <div key="intro" className="lg:px-5">
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
      <section className="hm-sv" aria-labelledby="services-title">
        <div aria-hidden className="hm-sv-bg" />
        <div className="hm-sv-c">
          <div className="hm-sv-left">
            <p className="eyebrow">TradeTarget content services</p>
            <h2 id="services-title" className="hm-sv-h">
              <span>Every article here</span>
              <span>
                is a <em>writing sample.</em>
              </span>
            </h2>
            <p className="hm-sv-dek">
              <span>The team that writes TradeTarget writes for brokers,</span> <span>fintechs, AMCs and finance brands. If you like how this</span>{" "}
              <span>reads, we can write like this for you.</span>
            </p>
            <Link prefetch={false} href="/hire-writers/" className="hm-sv-btn hm-sv-primary">
              See our services <Arrow />
            </Link>
            <Link prefetch={false} href="/hire-writers/#brief" className="hm-sv-btn hm-sv-secondary">
              Request a sample <Arrow />
            </Link>
          </div>
          <div className="hm-sv-panel">
            <ol className="hm-sv-list">
              {SERVICES.map((sv, i) => (
                <li key={sv.title} className="hm-sv-item">
                  <span className="hm-sv-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hm-sv-title">{sv.title}</span>
                  <span className="hm-sv-text">
                    {sv.text.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                </li>
              ))}
            </ol>
            <dl className="hm-sv-stats">
              <div>
                <dt>Articles published</dt>
                <dd>279</dd>
              </div>
              <div>
                <dt>IPO deep-dives</dt>
                <dd>88</dd>
              </div>
            </dl>
          </div>
          <div id="newsletter" className="hm-brief">
            <p className="eyebrow">The TradeTarget brief</p>
            <h2 className="hm-brief-h">
              Five minutes that <em>make sense</em> of the market.
            </h2>
            <p className="hm-brief-dek">IPO dates, results and one clear explainer, every weekday morning. No tips, no noise.</p>
            <div className="hm-brief-form">
              <NewsletterForm id="home-brief" inline look="brief" cta="Subscribe" />
            </div>
            <p className="hm-brief-note">Free · Unsubscribe whenever you like</p>
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
