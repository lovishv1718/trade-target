import Image from "next/image";
import Link from "next/link";
import hire from "@/content/hire.json";
import { IpoPreviewTable, IpoThisWeek } from "@/components/home/ipo-week";
import { MarketsBoard } from "@/components/home/markets-board";
import { MiniSip } from "@/components/home/mini-sip";
import { JsonLd } from "@/components/json-ld";
import { Kicker } from "@/components/kicker";
import { NewsletterBand } from "@/components/newsletter-band";
import { Photo } from "@/components/photo";
import { Scroller } from "@/components/scroller";
import { SectionEnd, SectionHeader } from "@/components/section-header";
import { LeadStory, StoryLink, StoryMeta, StoryRow, StoryTile } from "@/components/story";
import { getArticleBySlug, getArticleCards, getArticlesBySection, getCalculators, getEditorial, getSubsections, toCard, type ArticleCard } from "@/lib/content";
import { getIpos, istToday } from "@/lib/ipo";

/**
 * Second-rank front-page story. Phones: a compact row, headline beside a small thumbnail.
 * Tablet and wide desktop: a column beside the lead, the first with its photo on top.
 * 1024 to 1279: three across under the lead.
 */
function SecondaryStory({ story, first }: { story: ArticleCard; first: boolean }) {
  return (
    <article className="py-4 last:pb-0 md:py-5 md:first:pt-0 lg:px-5 lg:py-0 lg:first:pl-0 lg:last:pr-0 xl:px-0 xl:py-5">
      <Link prefetch={false} href={story.path} className={`group flex items-start gap-4 ${first ? "md:flex-col md:items-stretch md:gap-3" : ""}`}>
        <div className="min-w-0 flex-1">
          <Kicker label={story.kicker} />
          <h2 className={`headline mt-1 break-words text-lg ${first ? "md:text-xl" : ""}`}>{story.title}</h2>
          {first ? <p className="mt-2 line-clamp-3 text-md text-ink-2">{story.standfirst}</p> : null}
          <StoryMeta story={story} className="mt-1.5" showRead={false} />
        </div>
        <Photo
          image={story.image}
          sizes={first ? "(min-width: 1280px) 290px, (min-width: 1024px) 200px, (min-width: 768px) 260px, 128px" : "128px"}
          className={`w-24 shrink-0 sm:w-32 ${first ? "md:order-first md:w-full" : "md:hidden"}`}
        />
      </Link>
    </article>
  );
}

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

  return (
    <>
      <h1 className="sr-only">TradeTarget: stock market, IPO and personal finance news</h1>

      {/* Front page: lead, secondaries, and the market terminal on the right ----------- */}
      <div className="wrap pt-5 md:pt-6">
        <div className="grid gap-y-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-x-10">
          <div className="grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
            <div className="md:pr-6 lg:pr-0 xl:pr-7">
              <LeadStory story={lead} priority sizes="(min-width: 1280px) 540px, (min-width: 1024px) 660px, (min-width: 768px) 440px, 100vw" />
            </div>
            <div className="mt-6 border-t border-rule md:mt-0 md:border-l md:border-t-0 md:pl-6 lg:mt-8 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-5 xl:mt-0 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
              <div className="divide-y divide-rule lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:block xl:divide-x-0 xl:divide-y">
                {secondary.map((s, i) => (
                  <SecondaryStory key={s.slug} story={s} first={i === 0} />
                ))}
              </div>
            </div>
          </div>
          <div className="surface-ink grid gap-px self-start bg-rule md:grid-cols-2 lg:grid-cols-1">
            <MarketsBoard />
            <IpoThisWeek ipos={ipos} buildDate={buildDate} />
          </div>
        </div>
      </div>

      {/* Latest news list ------------------------------------------------------- */}
      <div className="wrap mt-10 md:mt-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-x-10">
          <section aria-label="Latest news">
            <SectionHeader title="Latest news" href="/news/" accent="ink" more={false} />
            <div className="divide-y divide-rule">
              {latest.map((s) => (
                <StoryRow key={s.slug} story={s} standfirst />
              ))}
            </div>
            <SectionEnd href="/news/" label="All news" accent="ink" note={`${latest.length} of ${newsCount} stories from the newsroom`} />
          </section>
          <aside className="space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:space-y-0 lg:block lg:space-y-10">
            <section aria-label="Most read">
              <SectionHeader title="Most read" accent="ink" />
              <ol className="mt-1 divide-y divide-rule">
                {[getArticleBySlug("employees-provident-fund-epf"), getArticleBySlug("ppf-interest-rate"), getArticleBySlug("section-80c"), getArticleBySlug("what-is-an-ipo"), getArticleBySlug("parag-parikh-flexi-cap-fund-vs-hdfc-flexi-cap-fund")]
                  .filter((a) => a !== null)
                  .map((a, i) => (
                    <li key={a.slug}>
                      <StoryLink story={toCard(a)} index={i + 1} />
                    </li>
                  ))}
              </ol>
            </section>
            <section aria-label="Hire our writers" className="surface-ink self-start p-5">
              <p className="kicker text-company">For brokers, AMCs and fintechs</p>
              <p className="headline mt-2 text-xl">The writers behind these stories can write for you</p>
              <Link prefetch={false} href="/hire-writers/" className="btn mt-5">
                Hire our writers <span aria-hidden>→</span>
              </Link>
            </section>
          </aside>
        </div>
      </div>

      {/* IPO dashboard preview -------------------------------------------------- */}
      <section className="mt-16 border-y border-rule bg-white py-10 md:mt-20 md:py-12" aria-label="IPO dashboard">
        <div className="wrap">
          <SectionHeader title="IPO dashboard" href="/ipo/" accent="ipo" more={false}>
            <span className="text-sm text-muted">Mainboard issues, status from today’s date</span>
          </SectionHeader>
          <div className="mt-4">
            <IpoPreviewTable ipos={ipos} buildDate={buildDate} />
          </div>
          <p className="mt-3 text-xs text-muted">Bonfiglioli, Jio Platforms, Paras Healthcare, Zetwerk and Tonbo use sample figures. GMP is unofficial.</p>
          <SectionEnd href="/ipo/" label="Open the IPO dashboard" accent="ipo" note={`${mainboard} mainboard and ${ipos.length - mainboard} SME issues tracked, with dates, GMP and subscription`} />
        </div>
      </section>

      {/* Share Analysis: lead + list ---------------------------------------------- */}
      <section className="wrap mt-12 md:mt-16" aria-label="Share Analysis">
        <SectionHeader title="Share Analysis" href="/share-analysis/" accent="company" more={false} />
        <div className="mt-5 grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <article className="pb-2 lg:border-r lg:border-rule lg:pb-0 lg:pr-8">
            <Link prefetch={false} href={shareLead.path} className="group grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-1 lg:gap-4">
              <Photo image={shareLead.image} sizes="(min-width: 1024px) 640px, (min-width: 768px) 360px, 100vw" aspect="aspect-[3/2] lg:aspect-[16/9]" />
              <div>
                <span className="kicker text-company">Fundamental analysis</span>
                <h3 className="headline mt-1.5 text-balance break-words text-2xl md:text-3xl">{shareLead.title}</h3>
                <p className="mt-2 text-md text-ink-2 md:text-base md:leading-normal">{shareLead.standfirst}</p>
                <StoryMeta story={shareLead} className="mt-3" />
              </div>
            </Link>
          </article>
          <div className="mt-4 divide-y divide-rule border-t border-rule lg:-mt-5 lg:border-t-0 lg:pl-8">
            {shareRest.map((s) => (
              <StoryRow key={s.slug} story={s} />
            ))}
          </div>
        </div>
        <SectionEnd href="/share-analysis/" label="All share analysis" accent="company" note={`${count("share-analysis")} companies analysed: financials, ratios and shareholding`} />
      </section>

      {/* Stock Market IQ: horizontal scroller; the next card always peeks in ------------- */}
      <section className="wrap mt-10 md:mt-12" aria-label="Stock Market IQ">
        <SectionHeader title="Stock Market IQ" href="/stock-market-iq/" accent="learn" more={false}>
          <span className="hidden text-sm text-muted sm:inline">Explainers in plain language</span>
        </SectionHeader>
        <Scroller label="Stock Market IQ explainers" className="mt-4">
          {smiq.map((s) => (
            <div key={s.slug} className="w-[72%] sm:w-[42%] md:w-[30%] lg:w-[21%]">
              <StoryTile story={s} sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 72vw" />
            </div>
          ))}
        </Scroller>
        <SectionEnd href="/stock-market-iq/" label="All explainers" accent="learn" note={smiq.length < count("stock-market-iq") ? `${smiq.length} of ${count("stock-market-iq")} explainers in this row` : `All ${smiq.length} explainers are in this row`} />
      </section>

      {/* Personal Finance: lead + four ------------------------------------------------- */}
      <section className="wrap mt-16 md:mt-24" aria-label="Personal Finance">
        <SectionHeader title="Personal Finance" href="/personal-finance/" accent="money" more={false} />
        <ul aria-label="Personal Finance topics" className="flex flex-wrap gap-x-5 border-b border-rule">
          {subs.map((s) => (
            <li key={s.slug}>
              <Link prefetch={false} href={s.path} className="inline-flex min-h-11 items-center text-sm font-semibold text-money decoration-1 underline-offset-4 hover:underline">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-y-8 lg:grid-cols-2">
          <article className="lg:border-r lg:border-rule lg:pr-8">
            <Link prefetch={false} href={pfLead.path} className="group block">
              <Photo image={pfLead.image} sizes="(min-width: 1024px) 590px, 100vw" aspect="aspect-[3/2] md:aspect-[2/1] lg:aspect-[3/2]" />
              <Kicker label={pfLead.kicker} className="mt-4 block" />
              <h3 className="headline mt-1.5 text-balance break-words text-2xl md:text-3xl">{pfLead.title}</h3>
              <p className="mt-2 text-md text-ink-2 md:text-base md:leading-normal">{pfLead.standfirst}</p>
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
      </section>

      {/* Calculators -------------------------------------------------------------- */}
      <section className="wrap mt-10 md:mt-12" aria-label="Calculators">
        <SectionHeader title="Calculators" href="/calculators/" accent="learn" more={false} />
        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <p className="mb-3 text-md font-semibold text-ink-2">Try it: what could a monthly SIP grow to?</p>
            <MiniSip />
          </div>
          <ul className="grid grid-cols-2 gap-x-6 self-start border-t border-rule lg:mt-9">
            {calcs
              .filter((c) => c.slug !== "sip-calculator")
              .slice(0, 12)
              .map((c) => (
                <li key={c.slug} className="border-b border-rule">
                  <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex min-h-11 items-center justify-between gap-2 py-2 text-md font-semibold leading-snug text-ink decoration-1 underline-offset-4 hover:underline">
                    {c.name.replace(" Calculator", "")}
                    <span aria-hidden className="text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <SectionEnd href="/calculators/" label={`All ${calcs.length} calculators`} accent="learn" note={`Investing, savings, retirement, loans and tax`} />
      </section>

      {/* Funds and long reads -------------------------------------------------------- */}
      <section className="wrap mt-14 md:mt-16" aria-label="Blog Junction">
        <SectionHeader title="Blog Junction" href="/blog-junction/" accent="money" more={false}>
          <span className="hidden text-sm text-muted sm:inline">Fund comparisons and longer reads</span>
        </SectionHeader>
        {/* A reading list rather than a row of cards: image beside the text, two columns from tablet up */}
        <div className="mt-2 grid md:grid-cols-2 md:gap-x-10">
          {funds.map((s) => (
            <article key={s.slug} className="border-b border-rule py-5 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0">
              <Link prefetch={false} href={s.path} className="group grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-4 sm:gap-5">
                <Photo image={s.image} sizes="(min-width: 1024px) 220px, (min-width: 768px) 180px, 40vw" aspect="aspect-[4/3]" />
                <div className="min-w-0">
                  <Kicker label={s.kicker} />
                  <h3 className="headline mt-1 break-words text-lg md:text-xl">{s.title}</h3>
                  <p className="mt-1.5 hidden text-md text-ink-2 sm:line-clamp-2">{s.standfirst}</p>
                  <StoryMeta story={s} className="mt-2" />
                </div>
              </Link>
            </article>
          ))}
        </div>
        <SectionEnd href="/blog-junction/" label="All of Blog Junction" accent="money" note={`${funds.length} of ${count("blog-junction")} reads shown`} />
      </section>

      {/* Hire writers band ---------------------------------------------------------- */}
      <section className="surface-ink mt-16 md:mt-24" aria-labelledby="hire-band">
        <div className="wrap grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-x-16">
          <div>
            <p className="kicker text-company">TradeTarget content services</p>
            <h2 id="hire-band" className="headline mt-3 text-balance text-3xl md:text-4xl">
              Finance writing for brokers, AMCs and fintechs
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-2">{hire.intro}</p>
            <Link prefetch={false} href="/hire-writers/" className="btn btn-lg mt-7">
              Send us a brief
            </Link>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Teams we have written for</p>
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
