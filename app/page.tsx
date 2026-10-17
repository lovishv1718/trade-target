import Image from "next/image";
import Link from "next/link";
import hire from "@/content/hire.json";
import { FrontHero } from "@/components/home/front-hero";
import { IpoPreviewTable, IpoThisWeek } from "@/components/home/ipo-week";
import { MarketsBoard } from "@/components/home/markets-board";
import { MiniSip } from "@/components/home/mini-sip";
import { JsonLd } from "@/components/json-ld";
import { Kicker } from "@/components/kicker";
import { NewsletterBand } from "@/components/newsletter-band";
import { Photo } from "@/components/photo";
import { Seen, Stagger } from "@/components/listing/stagger";
import { Scroller } from "@/components/scroller";
import { SectionEnd, SectionHeader } from "@/components/section-header";
import { StoryLink, StoryMeta, StoryRow, StoryTile } from "@/components/story";
import { getArticleBySlug, getArticleCards, getArticlesBySection, getCalculators, getEditorial, getSubsections, toCard } from "@/lib/content";
import { getIpos, istToday } from "@/lib/ipo";

export default function HomePage() {
  const ed = getEditorial().homepage;
  const all = getArticleCards();
  const lead = toCard(getArticleBySlug(ed.lead)!);
  const secondary = ed.secondary.map((s) => toCard(getArticleBySlug(s)!));
  const used = new Set([lead.slug, ...secondary.map((s) => s.slug)]);
  const latest = all.filter((a) => !used.has(a.slug) && (a.section === "news" || a.section === "ipo" || a.section === "blog-junction")).slice(0, 7);
  latest.forEach((a) => used.add(a.slug));

  const shareLead = toCard(getArticleBySlug(ed.shareAnalysisLead)!);
  const shareRest = getArticlesBySection("share-analysis").filter((a) => a.slug !== shareLead.slug).map(toCard).slice(0, 4);
  const smiq = getArticlesBySection("stock-market-iq").map(toCard).slice(0, 7);
  const pfLead = toCard(getArticleBySlug(ed.personalFinanceLead)!);
  const pfRest = getArticlesBySection("personal-finance").filter((a) => a.slug !== pfLead.slug).map(toCard).slice(0, 6);
  const funds = getArticlesBySection("blog-junction").filter((a) => !used.has(a.slug)).map(toCard).slice(0, 4);
  const subs = getSubsections();
  const calcs = getCalculators();
  const ipos = getIpos();
  const buildDate = istToday();
  // What each section ending reports is left to read
  const topics = getEditorial().newsTopics;
  const newsCount = all.filter((a) => a.section === "news" || a.section === "ipo" || topics.includes(a.kicker)).length;
  const count = (section: string) => getArticlesBySection(section).length;
  const mainboard = ipos.filter((i) => i.board === "mainboard").length;

  // The page runs in a repeating beat: a text section on paper, a data or visual section on
  // paper-2, then a tool or commercial block on ink. Each band type carries its own spacing.
  return (
    <>
      <h1 className="sr-only">TradeTarget: stock market, IPO and personal finance news</h1>

      {/* Front page: the hero (folio line, switchable lead, numbered index) and the market terminal ---- */}
      <div className="wrap pt-4 md:pt-5">
        <div className="grid gap-y-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-x-10">
          <FrontHero stories={[lead, ...secondary]} ipos={ipos} buildDate={buildDate} />
          <div className="surface-ink -mx-4 grid gap-px self-start bg-rule sm:mx-0 md:grid-cols-2 lg:grid-cols-1">
            <MarketsBoard />
            <IpoThisWeek ipos={ipos} buildDate={buildDate} />
          </div>
        </div>
      </div>

      {/* Text: latest news and most read ----------------------------------------------- */}
      <div className="band band-text">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-x-10">
          <section aria-label="Latest news">
            <SectionHeader title="Latest news" href="/news/" accent="ink" more={false} />
            <Stagger className="divide-y divide-rule">
              {latest.map((s) => (
                <StoryRow key={s.slug} story={s} standfirst />
              ))}
            </Stagger>
            <SectionEnd
              href="/news/"
              label="All news"
              accent="ink"
              note={
                <>
                  <b className="stat">{latest.length}</b> of <b className="stat">{newsCount}</b> stories from the newsroom
                </>
              }
            />
          </section>
          <aside className="space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:space-y-0 lg:block lg:space-y-10">
            <section aria-label="Most read">
              <SectionHeader title="Most read" accent="ink" pin={false} />
              <ol className="divide-y divide-rule">
                {[getArticleBySlug("employees-provident-fund-epf"), getArticleBySlug("ppf-interest-rate"), getArticleBySlug("section-80c"), getArticleBySlug("what-is-an-ipo"), getArticleBySlug("parag-parikh-flexi-cap-fund-vs-hdfc-flexi-cap-fund")]
                  .filter((a) => a !== null)
                  .map((a, i) => (
                    <li key={a.slug}>
                      <StoryLink story={toCard(a)} index={i + 1} />
                    </li>
                  ))}
              </ol>
            </section>
            <section aria-label="Hire our writers" className="surface-ink self-start border-t-3 border-company-mark p-5">
              <p className="kicker text-company">For brokers, AMCs and fintechs</p>
              <p className="headline mt-2 text-xl">The writers behind these stories can write for you</p>
              <Link prefetch={false} href="/hire-writers/" className="btn mt-5">
                Hire our writers <span className="arrow" aria-hidden>→</span>
              </Link>
            </section>
          </aside>
        </div>
      </div>

      {/* Data: the IPO dashboard ----------------------------------------------------- */}
      <section className="surface-paper-2 band band-data border-y border-rule" aria-label="IPO dashboard">
        <div className="wrap">
          <SectionHeader title="IPO dashboard" href="/ipo/" accent="ipo" more={false} dek="Mainboard issues, status from today’s date" />
          <div className="mt-5">
            <IpoPreviewTable ipos={ipos} buildDate={buildDate} />
          </div>
          <p className="mt-3 text-xs text-muted">Bonfiglioli, Jio Platforms, Paras Healthcare, Zetwerk and Tonbo use sample figures. GMP is unofficial.</p>
          <SectionEnd href="/ipo/" label="Open the IPO dashboard" accent="ipo" weight="strong" note={`${mainboard} mainboard and ${ipos.length - mainboard} SME issues tracked, with dates, GMP and subscription`} />
        </div>
      </section>

      {/* Tool: calculators ------------------------------------------------------------ */}
      <section className="surface-ink band band-tool" aria-label="Calculators">
        <div className="wrap">
          <SectionHeader title="Calculators" href="/calculators/" accent="learn" more={false} />
          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
            <MiniSip prompt="Try it: what could a monthly SIP grow to?" />
            <ul className="grid grid-cols-1 gap-x-6 self-start border-t border-rule sm:grid-cols-2">
              {calcs
                .filter((c) => c.slug !== "sip-calculator")
                .slice(0, 12)
                .map((c) => (
                  <li key={c.slug} className="border-b border-rule">
                    <Link prefetch={false} href={`/calculators/${c.slug}/`} className="link-row text-md">
                      <span className="link-row-label">{c.name.replace(" Calculator", "")}</span>
                      <span aria-hidden className="arrow">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <SectionEnd href="/calculators/" label={`All ${calcs.length} calculators`} accent="learn" weight="strong" note="Investing, savings, retirement, loans and tax" />
        </div>
      </section>

      {/* Text: Share Analysis, a lead and a list ------------------------------------------- */}
      <section className="band band-text" aria-label="Share Analysis">
        <div className="wrap">
          <SectionHeader title="Share Analysis" href="/share-analysis/" accent="company" more={false} />
          <div className="mt-5 grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <article className="story group pb-2 lg:border-r lg:border-rule lg:pb-0 lg:pr-8">
              <Link prefetch={false} href={shareLead.path} className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-1 lg:gap-4">
                <Photo image={shareLead.image} sizes="(min-width: 1024px) 640px, (min-width: 768px) 360px, 100vw" crop={{ base: "standard", lg: "wide" }} />
                <div>
                  <span className="kicker text-company">Fundamental analysis</span>
                  <h3 className="headline mt-1.5 text-balance text-2xl md:text-3xl">{shareLead.title}</h3>
                  <p className="deck mt-2 text-lg leading-normal">{shareLead.standfirst}</p>
                  <StoryMeta story={shareLead} className="mt-3" />
                </div>
              </Link>
            </article>
            <Stagger className="mt-4 divide-y divide-rule border-t border-rule lg:-mt-5 lg:border-t-0 lg:pl-8">
              {shareRest.map((s) => (
                <StoryRow key={s.slug} story={s} />
              ))}
            </Stagger>
          </div>
          <SectionEnd
            href="/share-analysis/"
            label="All share analysis"
            accent="company"
            note={
              <>
                <b className="stat">{count("share-analysis")}</b> companies analysed: financials, ratios and shareholding
              </>
            }
          />
        </div>
      </section>

      {/* Visual: Stock Market IQ, a row that scrolls; the next card always peeks in ---------- */}
      <section className="surface-paper-2 band band-data border-y border-rule" aria-label="Stock Market IQ">
        <div className="wrap">
          <SectionHeader title="Stock Market IQ" href="/stock-market-iq/" accent="learn" more={false} dek="Explainers in plain language" />
          <Scroller label="Stock Market IQ explainers" className="mt-5">
            {smiq.map((s) => (
              <div key={s.slug} className="w-[72%] sm:w-[42%] md:w-[30%] lg:w-[21%]">
                <StoryTile story={s} sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 72vw" />
              </div>
            ))}
          </Scroller>
          <SectionEnd
            href="/stock-market-iq/"
            label="All explainers"
            accent="learn"
            weight="quiet"
            note={smiq.length < count("stock-market-iq") ? `${smiq.length} of ${count("stock-market-iq")} explainers in this row` : `All ${smiq.length} explainers are in this row`}
          />
        </div>
      </section>

      {/* Commercial: content services ------------------------------------------------- */}
      <section className="surface-ink band band-tool" aria-labelledby="hire-band">
        <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-x-16">
          {/* Arrives once: the amber rule draws across, then the pitch rises into place under it */}
          <Seen className="hire-reveal">
            <p className="kicker text-company">TradeTarget content services</p>
            <h2 id="hire-band" className="headline mt-3 text-balance text-3xl md:text-4xl">
              Finance writing for brokers, AMCs and fintechs
            </h2>
            <p className="deck mt-4 max-w-lg text-lg leading-relaxed">{hire.intro}</p>
            <Link prefetch={false} href="/hire-writers/" className="btn mt-7">
              Send us a brief <span className="arrow" aria-hidden>→</span>
            </Link>
          </Seen>
          <div>
            <p className="kicker text-muted">Teams we have written for</p>
            <ul className="mt-3 grid grid-cols-3 border-l border-t border-rule">
              {hire.clients.map((c) => (
                <li key={c.name} className="flex min-h-28 flex-col items-center justify-center gap-2 border-b border-r border-rule p-3 text-center">
                  <span className="block size-12 bg-white p-1">
                    <Image src={c.logo} alt="" width={56} height={56} className="img-fade size-full object-contain" />
                  </span>
                  <span className="text-xs leading-snug text-ink-2">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Text: Personal Finance, a lead and four -------------------------------------- */}
      <section className="band band-text" aria-label="Personal Finance">
        <div className="wrap">
          <SectionHeader title="Personal Finance" href="/personal-finance/" accent="money" more={false} />
          <ul aria-label="Personal Finance topics" className="flex flex-wrap gap-x-5 border-b border-rule">
            {subs.map((s) => (
              <li key={s.slug}>
                <Link prefetch={false} href={s.path} className="link-quiet inline-flex min-h-11 items-center text-sm font-semibold text-money">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-y-8 lg:grid-cols-2">
            <article className="story group lg:border-r lg:border-rule lg:pr-8">
              <Link prefetch={false} href={pfLead.path} className="block">
                <Photo image={pfLead.image} sizes="(min-width: 1024px) 590px, 100vw" crop={{ base: "standard", md: "panorama", lg: "standard" }} />
                <Kicker label={pfLead.kicker} className="mt-4 block" />
                <h3 className="headline mt-1.5 text-balance text-2xl md:text-3xl">{pfLead.title}</h3>
                <p className="deck mt-2 text-lg leading-normal">{pfLead.standfirst}</p>
              </Link>
              <StoryMeta story={pfLead} className="mt-3" />
            </article>
            <div className="grid grid-cols-2 content-start gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-2 lg:pl-8">
              {pfRest.slice(0, 4).map((s) => (
                <StoryTile key={s.slug} story={s} headingSize="text-md leading-snug sm:text-lg" sizes="(min-width: 1024px) 280px, 50vw" />
              ))}
            </div>
          </div>
          <SectionEnd href="/personal-finance/" label="All personal finance" accent="money" note={`${count("personal-finance")} guides across ${subs.length} topics`} />
        </div>
      </section>

      {/* Visual: Blog Junction, a reading list with pictures ---------------------------- */}
      <section className="surface-paper-2 band band-data border-t border-rule" aria-label="Blog Junction">
        <div className="wrap">
          <SectionHeader title="Blog Junction" href="/blog-junction/" accent="money" more={false} dek="Fund comparisons and longer reads" />
          {/* A reading list rather than a row of cards: image beside the text, two columns from tablet up */}
          <div className="mt-2 grid md:grid-cols-2 md:gap-x-10">
            {funds.map((s) => (
              <article key={s.slug} className="story group border-b border-rule py-5 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0">
                <Link prefetch={false} href={s.path} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-4 sm:gap-5">
                  <Photo image={s.image} sizes="(min-width: 1024px) 220px, (min-width: 768px) 180px, 40vw" crop="compact" />
                  <div className="min-w-0">
                    <Kicker label={s.kicker} />
                    <h3 className="headline mt-1 text-lg md:text-xl">{s.title}</h3>
                    <p className="mt-1.5 hidden text-md text-ink-2 sm:line-clamp-2">{s.standfirst}</p>
                    <StoryMeta story={s} className="mt-2" />
                  </div>
                </Link>
              </article>
            ))}
          </div>
          <SectionEnd href="/blog-junction/" label="All of Blog Junction" accent="money" weight="quiet" note={`${funds.length} of ${count("blog-junction")} reads shown`} />
        </div>
      </section>

      {/* Tool: the morning brief, closing onto the footer ---------------------------------- */}
      <NewsletterBand />

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
