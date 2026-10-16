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
import { SectionHeader } from "@/components/section-header";
import { LeadStory, StoryLink, StoryMeta, StoryRow, StoryTile } from "@/components/story";
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

  return (
    <>
      <h1 className="sr-only">TradeTarget: stock market, IPO and personal finance news</h1>

      {/* Top stories ----------------------------------------------------------- */}
      <div className="wrap pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <LeadStory story={lead} priority />
            <div className="flex flex-col divide-y divide-rule border-t border-rule md:border-t-0">
              {secondary.map((s, i) => (
                <article key={s.slug} className={i === 0 ? "pb-5" : "py-5"}>
                  <Link prefetch={false} href={s.path} className="group block">
                    {i === 0 ? <Photo image={s.image} sizes="(min-width: 1024px) 300px, 100vw" className="mb-3" /> : null}
                    <Kicker label={s.kicker} />
                    <h2 className={`headline mt-1 leading-snug ${i === 0 ? "text-[1.3rem]" : "text-[1.12rem]"}`}>{s.title}</h2>
                  </Link>
                  {i === 0 ? <p className="mt-2 line-clamp-3 text-[0.95rem] text-muted">{s.standfirst}</p> : null}
                  <StoryMeta story={s} className="mt-1.5" showRead={false} />
                </article>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <MarketsBoard />
            <IpoThisWeek ipos={ipos} buildDate={buildDate} />
          </div>
        </div>
      </div>

      {/* Latest news list ------------------------------------------------------- */}
      <div className="wrap mt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-label="Latest news">
            <SectionHeader title="Latest news" href="/news/" accent="accent" linkLabel="All news" />
            <div className="divide-y divide-rule">
              {latest.map((s) => (
                <StoryRow key={s.slug} story={s} standfirst />
              ))}
            </div>
          </section>
          <aside className="space-y-8">
            <section aria-label="Most read">
              <SectionHeader title="Most read" />
              <div className="divide-y divide-rule">
                {[getArticleBySlug("employees-provident-fund-epf"), getArticleBySlug("ppf-interest-rate"), getArticleBySlug("section-80c"), getArticleBySlug("what-is-an-ipo"), getArticleBySlug("parag-parikh-flexi-cap-fund-vs-hdfc-flexi-cap-fund")]
                  .filter((a) => a !== null)
                  .map((a, i) => (
                    <StoryLink key={a.slug} story={toCard(a)} index={i + 1} />
                  ))}
              </div>
            </section>
            <section aria-label="Hire our writers" className="bg-navy-900 p-5 text-white">
              <p className="kicker text-gold">For brokers, AMCs and fintechs</p>
              <p className="headline mt-1 text-xl text-white">The writers behind these stories can write for you</p>
              <Link prefetch={false} href="/hire-writers/" className="mt-4 inline-block bg-accent-ink px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700">
                Hire our writers →
              </Link>
            </section>
          </aside>
        </div>
      </div>

      {/* IPO dashboard preview -------------------------------------------------- */}
      <section className="mt-14 border-y border-rule bg-white py-10" aria-label="IPO dashboard">
        <div className="wrap">
          <SectionHeader title="IPO dashboard" href="/ipo/" accent="ipo" linkLabel="Full dashboard">
            <span className="text-sm text-muted">Mainboard issues, status from today’s date</span>
          </SectionHeader>
          <div className="mt-5">
            <IpoPreviewTable ipos={ipos} buildDate={buildDate} />
          </div>
          <p className="mt-2 text-xs text-muted">Bonfiglioli, Jio Platforms, Paras Healthcare, Zetwerk and Tonbo use sample figures. GMP is unofficial.</p>
        </div>
      </section>

      {/* Share Analysis: lead + list ---------------------------------------------- */}
      <section className="wrap mt-14" aria-label="Share Analysis">
        <SectionHeader title="Share Analysis" href="/share-analysis/" />
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <article>
            <Link prefetch={false} href={shareLead.path} className="group grid gap-5 md:grid-cols-[1.1fr_1fr]">
              <Photo image={shareLead.image} sizes="(min-width: 1024px) 420px, 100vw" aspect="aspect-[4/3]" />
              <div>
                <Kicker label="Fundamental analysis" />
                <h3 className="headline mt-1 text-[1.6rem] leading-tight">{shareLead.title}</h3>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-muted">{shareLead.standfirst}</p>
                <StoryMeta story={shareLead} className="mt-2" />
              </div>
            </Link>
          </article>
          <div className="divide-y divide-rule">
            {shareRest.map((s) => (
              <StoryRow key={s.slug} story={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Stock Market IQ: horizontal scroller ------------------------------------- */}
      <section className="mt-14" aria-label="Stock Market IQ">
        <div className="wrap">
          <SectionHeader title="Stock Market IQ" href="/stock-market-iq/" accent="accent">
            <span className="hidden text-sm text-muted sm:inline">Explainers in plain language</span>
          </SectionHeader>
        </div>
        <div className="wrap mt-5">
          <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {smiq.map((s) => (
              <div key={s.slug} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[23%]">
                <StoryTile story={s} sizes="(min-width: 1024px) 280px, 70vw" headingSize="text-[1.05rem]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Finance: photo grid ---------------------------------------------- */}
      <section className="wrap mt-14" aria-label="Personal Finance">
        <SectionHeader title="Personal Finance" href="/personal-finance/" accent="funds" />
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {subs.map((s) => (
            <li key={s.slug}>
              <Link prefetch={false} href={s.path} className="font-semibold text-funds-ink hover:underline">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <article className="md:col-span-2 md:row-span-2">
            <Link prefetch={false} href={pfLead.path} className="group relative block">
              <Photo image={pfLead.image} sizes="(min-width: 1024px) 620px, 100vw" aspect="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[420px]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 via-navy-950/60 to-transparent p-5 pt-16 text-white">
                <span className="kicker text-gold">{pfLead.kicker}</span>
                <h3 className="headline mt-1 text-[1.5rem] leading-tight text-white md:text-[1.8rem]">{pfLead.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/80">{pfLead.standfirst}</p>
              </div>
            </Link>
          </article>
          {pfRest.slice(0, 4).map((s) => (
            <StoryTile key={s.slug} story={s} headingSize="text-[1.02rem]" />
          ))}
        </div>
      </section>

      {/* Calculators -------------------------------------------------------------- */}
      <section className="wrap mt-14" aria-label="Calculators">
        <SectionHeader title="Calculators" href="/calculators/" accent="accent" linkLabel={`All ${calcs.length}`} />
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <p className="mb-3 text-sm font-semibold text-muted">Try it: what could a monthly SIP grow to?</p>
            <MiniSip />
          </div>
          <ul className="grid grid-cols-2 gap-x-6 self-start">
            {calcs
              .filter((c) => c.slug !== "sip-calculator")
              .slice(0, 12)
              .map((c) => (
                <li key={c.slug} className="border-b border-rule">
                  <Link prefetch={false} href={`/calculators/${c.slug}/`} className="flex items-center justify-between py-2.5 text-[0.95rem] font-semibold hover:text-accent-ink">
                    {c.name.replace(" Calculator", "")}
                    <span aria-hidden className="text-accent-ink">→</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* Funds and long reads -------------------------------------------------------- */}
      <section className="wrap mt-14" aria-label="Blog Junction">
        <SectionHeader title="Blog Junction" href="/blog-junction/" accent="funds">
          <span className="hidden text-sm text-muted sm:inline">Fund comparisons and longer reads</span>
        </SectionHeader>
        <div className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {funds.map((s) => (
            <StoryTile key={s.slug} story={s} standfirst />
          ))}
        </div>
      </section>

      {/* Hire writers band ---------------------------------------------------------- */}
      <section className="mt-16 bg-navy-900 text-white" aria-labelledby="hire-band">
        <div className="wrap grid gap-8 py-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="kicker text-gold">TradeTarget content services</p>
            <h2 id="hire-band" className="headline mt-2 text-[1.9rem] leading-tight text-white md:text-[2.3rem]">
              Finance writing for brokers, AMCs and fintechs
            </h2>
            <p className="mt-3 max-w-lg text-white/75">{hire.intro}</p>
            <Link prefetch={false} href="/hire-writers/" className="mt-6 inline-block bg-accent-ink px-5 py-3 font-semibold text-white hover:bg-accent-700">
              Send us a brief
            </Link>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60">Teams we have written for</p>
            <ul className="mt-3 grid grid-cols-3 gap-px bg-white/10 sm:grid-cols-5">
              {hire.clients.map((c) => (
                <li key={c.name} className="flex flex-col items-center justify-center gap-2 bg-navy-900 p-3 text-center">
                  <Image src={c.logo} alt="" width={56} height={56} className="h-12 w-12 bg-white object-contain p-1" />
                  <span className="text-[0.72rem] leading-tight text-white/75">{c.name}</span>
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
