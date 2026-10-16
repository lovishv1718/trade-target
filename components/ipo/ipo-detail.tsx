import Link from "next/link";
import { getArticlesBySection, getArticlesBySlugs, getPhoto, toCard } from "@/lib/content";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { istToday, lotTable, priceBandLabel, type Ipo } from "@/lib/ipo";
import { Breadcrumbs } from "../breadcrumbs";
import { JsonLd } from "../json-ld";
import { Photo } from "../photo";
import { SectionHeader } from "../section-header";
import { StoryTile } from "../story";
import { GmpChart, SubscriptionChart } from "./ipo-charts-lazy";
import { AtAGlance, IpoTimeline, LiveStatus } from "./ipo-live";

function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="mt-10">
      <h2 className="headline border-b border-rule pb-2 text-[1.45rem]">{title}</h2>
      <div className="mt-4">{children}</div>
      {note ? <p className="mt-2 text-xs text-muted">{note}</p> : null}
    </section>
  );
}

export function IpoDetail({ ipo }: { ipo: Ipo }) {
  const buildDate = istToday();
  const photo = getPhoto(ipo.photo);
  let related = getArticlesBySlugs(ipo.relatedArticles);
  if (related.length < 4) related = [...related, ...getArticlesBySection("ipo").filter((a) => !related.includes(a))].slice(0, 4);
  const lots = lotTable(ipo);
  const details: [string, string][] = [
    ["IPO dates", ipo.dates.open && ipo.dates.close ? `${formatDate(ipo.dates.open)} to ${formatDate(ipo.dates.close)}` : ipo.dates.close ? `Closed ${formatDate(ipo.dates.close)}` : "–"],
    ["Listing date", ipo.dates.listing ? formatDate(ipo.dates.listing) : "–"],
    ["Face value", ipo.faceValue ? `₹${ipo.faceValue} per share` : "–"],
    ["Price band", `${priceBandLabel(ipo)} per share`],
    ["Lot size", ipo.lotSize ? `${formatNumber(ipo.lotSize)} shares` : "–"],
    ["Issue size", ipo.issueSizeCr ? `₹${formatNumber(ipo.issueSizeCr, ipo.issueSizeCr % 1 ? 2 : 0)} crore` : "–"],
    ["Fresh issue", ipo.freshIssueCr !== null ? (ipo.freshIssueCr ? `₹${formatNumber(ipo.freshIssueCr, ipo.freshIssueCr % 1 ? 2 : 0)} crore` : "None") : "–"],
    ["Offer for sale", ipo.ofsCr !== null ? (ipo.ofsCr ? `₹${formatNumber(ipo.ofsCr, ipo.ofsCr % 1 ? 2 : 0)} crore` : "None") : "–"],
    ["Issue type", "Book-built issue"],
    ["Listing at", ipo.exchanges.join(", ")],
    ["Registrar", ipo.registrar],
    ["Lead managers", ipo.leadManagers.length ? ipo.leadManagers.join(", ") : "–"],
  ];
  const board = ipo.board === "sme" ? "SME IPO" : "Mainboard IPO";

  return (
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "IPO", href: "/ipo/" }]} current={`${ipo.name} IPO`} />

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker text-ipo">{board}</span>
            <LiveStatus ipo={ipo} buildDate={buildDate} />
          </div>
          <h1 className="headline mt-2 text-[2rem] leading-tight md:text-[2.6rem]">{ipo.name} IPO</h1>
          <p className="mt-3 text-[1.1rem] leading-relaxed text-[#3a4453]">
            {ipo.sector}.{" "}
            {ipo.issueSizeCr ? `₹${formatNumber(ipo.issueSizeCr, ipo.issueSizeCr % 1 ? 2 : 0)} crore issue` : "Issue"}
            {ipo.priceBand[1] ? `, price band ${priceBandLabel(ipo)}` : ""}
            {ipo.lotSize ? `, lot of ${formatNumber(ipo.lotSize)} shares` : ""}.
          </p>
          {ipo.sample ? (
            <p className="mt-4 border-l-4 border-gold bg-white px-4 py-2.5 text-sm text-[#5b4300]">
              <strong>Sample data.</strong> Figures on this page are illustrative and were added to show how the IPO template works.
            </p>
          ) : (
            <p className="mt-4 border-l-4 border-ipo bg-white px-4 py-2.5 text-sm text-ink/80">
              Figures from TradeTarget’s coverage of this issue. Fields we did not report are shown as –.
            </p>
          )}

          {photo ? (
            <figure className="mt-6">
              <Photo image={photo} sizes="(min-width: 1024px) 760px, 100vw" aspect="aspect-[2/1]" priority />
              <figcaption className="mt-2 text-[0.82rem] text-muted">
                {photo.caption}. Photo: {photo.credit}. Illustrative.
              </figcaption>
            </figure>
          ) : null}

          <Block title="IPO timeline">
            <IpoTimeline ipo={ipo} buildDate={buildDate} />
          </Block>

          <Block title="Key details">
            <div className="table-wrap">
              <table className="data-table">
                <tbody>
                  {details.map(([k, v]) => (
                    <tr key={k}>
                      <td className="w-[42%] font-semibold text-muted">{k}</td>
                      <td className="font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>

          <div className="grid gap-x-8 xl:grid-cols-2">
            <Block title="Subscription by category" note={ipo.subscription ? `As of ${ipo.subscriptionAsOf}.` : undefined}>
              {ipo.subscription ? <SubscriptionChart subscription={ipo.subscription} /> : <p className="border border-dashed border-rule bg-white px-4 py-8 text-center text-sm text-muted">Bidding has not started. Subscription figures appear once the issue opens.</p>}
            </Block>
            <Block title="GMP trend" note="Grey market premium is unofficial and can change quickly.">
              {ipo.gmpHistory.length > 1 ? <GmpChart history={ipo.gmpHistory} /> : <p className="border border-dashed border-rule bg-white px-4 py-8 text-center text-sm text-muted">{ipo.gmpHistory.length === 1 ? `Last reported GMP: ₹${ipo.gmpHistory[0].gmp} on ${formatDate(ipo.gmpHistory[0].date)}. Not enough readings for a trend.` : "No GMP readings tracked for this issue."}</p>}
            </Block>
          </div>

          {lots.length ? (
            <Block title="How much you can apply for" note={ipo.board === "mainboard" ? "At the upper price band. Retail bids are capped at ₹2 lakh; S-HNI bids run from ₹2 lakh to ₹10 lakh." : "At the upper price band."}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Application</th>
                      <th className="text-right">Lots</th>
                      <th className="text-right">Shares</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((r) => (
                      <tr key={r.category}>
                        <td className="font-semibold">{r.category}</td>
                        <td className="text-right">{formatNumber(r.lots)}</td>
                        <td className="text-right">{formatNumber(r.shares)}</td>
                        <td className="text-right font-semibold">{formatINR(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>
          ) : null}

          <Block title={`About ${ipo.name}`}>
            <p className="text-[1.05rem] leading-relaxed">{ipo.about}</p>
          </Block>

          {ipo.brokers ? (
            <Block title="Brokerage views" note="Sample data.">
              <div className="flex flex-wrap gap-6">
                {(
                  [
                    ["Apply", ipo.brokers.apply, "border-navy"],
                    ["Neutral", ipo.brokers.neutral, "border-gold"],
                    ["Avoid", ipo.brokers.avoid, "border-accent"],
                  ] as const
                ).map(([label, n, tone]) => (
                  <div key={label} className={`border-l-4 bg-white px-4 py-2 ${tone}`}>
                    <p className="headline text-2xl">{n}</p>
                    <p className="text-sm text-muted">{label}</p>
                  </div>
                ))}
              </div>
            </Block>
          ) : null}
        </div>

        <aside>
          <div className="space-y-6 lg:sticky lg:top-16">
            <AtAGlance ipo={ipo} buildDate={buildDate} />
            <div className="bg-white p-5">
              <p className="kicker text-muted">IPO tools</p>
              <ul className="mt-2 divide-y divide-rule text-[0.95rem] font-semibold">
                <li>
                  <Link prefetch={false} href="/ipo/" className="flex justify-between py-2.5 hover:text-ipo">
                    All IPOs this month <span aria-hidden>→</span>
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/stock-market-iq/what-is-an-ipo/" className="flex justify-between py-2.5 hover:text-ipo">
                    What is an IPO? <span aria-hidden>→</span>
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/calculators/cagr-calculator/" className="flex justify-between py-2.5 hover:text-ipo">
                    CAGR calculator <span aria-hidden>→</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-14" aria-label="Related articles">
        <SectionHeader title="IPO coverage" href="/ipo/" accent="ipo" />
        <div className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((a) => (
            <StoryTile key={a.slug} story={toCard(a)} />
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${ipo.name} IPO`,
          description: `${ipo.name} IPO dates, price band, lot size, GMP and subscription.`,
          url: `https://tradetarget.in/ipo/${ipo.slug}/`,
        }}
      />
    </div>
  );
}
