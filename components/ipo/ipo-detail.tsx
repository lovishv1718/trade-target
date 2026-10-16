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

const SUB_ROWS: [keyof NonNullable<Ipo["subscription"]>, string][] = [
  ["qib", "QIB"],
  ["nii", "NII"],
  ["retail", "Retail"],
  ["employee", "Employee"],
  ["total", "Total"],
];

function signedRupees(v: number) {
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}₹${formatNumber(Math.abs(v))}`;
}

function slugId(title: string) {
  return `ipo-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  const id = slugId(title);
  return (
    <section className="mt-12" aria-labelledby={id}>
      <h2 id={id} className="headline border-t border-ink pt-3 text-2xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
      {note ? <p className="mt-2 text-xs leading-normal text-muted">{note}</p> : null}
    </section>
  );
}

function crore(v: number) {
  return formatNumber(v, v % 1 ? 2 : 0);
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="kicker text-ipo">{board}</span>
            <LiveStatus ipo={ipo} buildDate={buildDate} detail />
          </div>
          <h1 className="headline mt-2 text-3xl md:text-4xl xl:text-5xl">{ipo.name} IPO</h1>
          <p className="mt-3 text-lg leading-normal text-ink-2">
            {ipo.sector}.{" "}
            {ipo.issueSizeCr ? `₹${crore(ipo.issueSizeCr)} crore issue` : "Issue"}
            {ipo.priceBand[1] ? `, price band ${priceBandLabel(ipo)}` : ""}
            {ipo.lotSize ? `, lot of ${formatNumber(ipo.lotSize)} shares` : ""}.
          </p>

          {/* Headline facts: large sans, tabular */}
          <dl className="mt-6 grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-3">
            <div className="col-span-2 bg-white px-4 py-3 sm:col-span-1">
              <dt className="kicker text-muted">Price band</dt>
              <dd className="mt-1 text-2xl font-semibold leading-tight text-ink tabular sm:text-3xl">{priceBandLabel(ipo)}</dd>
              <dd className="text-xs text-muted">per share</dd>
            </div>
            <div className="bg-white px-4 py-3">
              <dt className="kicker text-muted">Lot size</dt>
              <dd className="mt-1 text-2xl font-semibold leading-tight text-ink tabular sm:text-3xl">{ipo.lotSize ? formatNumber(ipo.lotSize) : "–"}</dd>
              <dd className="text-xs text-muted">{ipo.lotSize ? "shares" : "Not reported"}</dd>
            </div>
            <div className="bg-white px-4 py-3">
              <dt className="kicker text-muted">Issue size</dt>
              <dd className="mt-1 text-2xl font-semibold leading-tight text-ink tabular sm:text-3xl">{ipo.issueSizeCr ? `₹${crore(ipo.issueSizeCr)}` : "–"}</dd>
              <dd className="text-xs text-muted">{ipo.issueSizeCr ? "crore" : "Not reported"}</dd>
            </div>
          </dl>

          {ipo.sample ? (
            <p className="mt-4 border-l-3 border-company-mark bg-white px-4 py-2.5 text-sm leading-normal text-ink-2">
              <strong className="text-ink">Sample data.</strong> Figures on this page are illustrative and were added to show how the IPO template works.
            </p>
          ) : (
            <p className="mt-4 border-l-3 border-rule-strong bg-white px-4 py-2.5 text-sm leading-normal text-ink-2">
              Figures from TradeTarget’s coverage of this issue. Fields we did not report are shown as –.
            </p>
          )}

          <Block title="IPO timeline">
            <IpoTimeline ipo={ipo} buildDate={buildDate} />
          </Block>

          {photo ? (
            <figure className="mt-10">
              <Photo image={photo} sizes="(min-width: 1024px) 760px, 100vw" aspect="aspect-[2/1]" priority />
              <figcaption className="mt-2 text-xs leading-normal text-muted">
                {photo.caption}. Photo: {photo.credit}. Illustrative.
              </figcaption>
            </figure>
          ) : null}

          <Block title="Key details">
            <div className="table-wrap">
              <table className="data-table">
                <caption className="sr-only">Key details of the {ipo.name} IPO</caption>
                <tbody>
                  {details.map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="w-[42%] text-muted">
                        {k}
                      </th>
                      <td className="font-semibold text-ink tabular">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>

          <div className="grid gap-x-8 xl:grid-cols-2">
            <Block title="Subscription by category" note={ipo.subscription ? `As of ${ipo.subscriptionAsOf}.` : undefined}>
              {ipo.subscription ? (
                <>
                  <SubscriptionChart subscription={ipo.subscription} />
                  <table className="sr-only">
                    <caption>Times subscribed by investor category</caption>
                    <thead>
                      <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Times subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SUB_ROWS.filter(([k]) => ipo.subscription![k] != null).map(([k, label]) => (
                        <tr key={k}>
                          <th scope="row">{label}</th>
                          <td>{ipo.subscription![k]!.toFixed(2)}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="border border-rule bg-paper-2 px-4 py-6 text-sm leading-normal text-muted">Bidding has not started. Subscription figures appear once the issue opens.</p>
              )}
            </Block>
            <Block title="GMP trend" note="Grey market premium is unofficial and can change quickly.">
              {ipo.gmpHistory.length > 1 ? (
                <>
                  <GmpChart history={ipo.gmpHistory} />
                  <table className="sr-only">
                    <caption>Grey market premium readings by date</caption>
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">GMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ipo.gmpHistory.map((h) => (
                        <tr key={h.date}>
                          <th scope="row">{formatDate(h.date)}</th>
                          <td>{signedRupees(h.gmp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="border border-rule bg-paper-2 px-4 py-6 text-sm leading-normal text-muted tabular">
                  {ipo.gmpHistory.length === 1
                    ? `Last reported GMP: ${signedRupees(ipo.gmpHistory[0].gmp)} on ${formatDate(ipo.gmpHistory[0].date)}. Not enough readings for a trend.`
                    : "No GMP readings tracked for this issue."}
                </p>
              )}
            </Block>
          </div>

          {lots.length ? (
            <Block title="How much you can apply for" note={ipo.board === "mainboard" ? "At the upper price band. Retail bids are capped at ₹2 lakh; S-HNI bids run from ₹2 lakh to ₹10 lakh." : "At the upper price band."}>
              <div className="table-wrap">
                <table className="data-table">
                  <caption className="sr-only">Minimum and maximum application by investor category, at the upper price band</caption>
                  <thead>
                    <tr>
                      <th scope="col">Application</th>
                      <th scope="col" className="num">
                        Lots
                      </th>
                      <th scope="col" className="num">
                        Shares
                      </th>
                      <th scope="col" className="num">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((r) => (
                      <tr key={r.category}>
                        <th scope="row">{r.category}</th>
                        <td className="num">{formatNumber(r.lots)}</td>
                        <td className="num">{formatNumber(r.shares)}</td>
                        <td className="num font-semibold text-ink">{formatINR(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>
          ) : null}

          <Block title={`About ${ipo.name}`}>
            <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{ipo.about}</p>
          </Block>

          {ipo.brokers ? (
            <Block title="Brokerage views" note="Sample data.">
              <dl className="grid max-w-md grid-cols-3 gap-px border border-rule bg-rule">
                {(
                  [
                    ["Apply", ipo.brokers.apply, "border-t-up"],
                    ["Neutral", ipo.brokers.neutral, "border-t-rule-strong"],
                    ["Avoid", ipo.brokers.avoid, "border-t-down"],
                  ] as const
                ).map(([label, n, tone]) => (
                  <div key={label} className={`border-t-3 bg-white px-4 py-3 ${tone}`}>
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="mt-0.5 text-2xl font-semibold leading-tight text-ink tabular">{n}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}
        </div>

        <aside>
          <div className="space-y-6 lg:sticky lg:top-16">
            <AtAGlance ipo={ipo} buildDate={buildDate} />
            <nav className="border border-rule bg-white px-5 pb-2 pt-4" aria-label="IPO tools">
              <p className="kicker text-muted">IPO tools</p>
              <ul className="mt-2 divide-y divide-rule text-md font-semibold">
                <li>
                  <Link prefetch={false} href="/ipo/" className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-ink hover:text-ipo hover:underline">
                    All IPOs this month <span aria-hidden>→</span>
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/stock-market-iq/what-is-an-ipo/" className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-ink hover:text-ipo hover:underline">
                    What is an IPO? <span aria-hidden>→</span>
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/calculators/cagr-calculator/" className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-ink hover:text-ipo hover:underline">
                    CAGR calculator <span aria-hidden>→</span>
                  </Link>
                </li>
              </ul>
            </nav>
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
