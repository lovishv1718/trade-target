import type { Metadata } from "next";
import Link from "next/link";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { getCalculators } from "@/lib/content";

export const metadata: Metadata = {
  title: "Financial Calculators: SIP, EMI, Income Tax, PPF, EPF, NPS and more",
  description: "Sixteen free calculators for investing, deposits, retirement, loans and tax, with year-by-year tables, charts and the formula behind every result.",
  alternates: { canonical: "/calculators/" },
};

const ORDER = ["Investing", "Savings", "Retirement", "Loans", "Tax"];
const GROUP_NOTES: Record<string, string> = {
  Investing: "Mutual fund SIPs, one-time investments and withdrawals",
  Savings: "Small savings schemes and bank deposits",
  Retirement: "Provident fund, pension and retirement planning",
  Loans: "EMIs, total interest and prepayment",
  Tax: "Income tax for FY 2026-27 and HRA",
};
const FEATURED = ["sip-calculator", "income-tax-calculator", "home-loan-emi-calculator"];

export default function CalculatorsHub() {
  const calcs = getCalculators();
  const featured = FEATURED.map((s) => calcs.find((c) => c.slug === s)!);
  return (
    <>
      <SectionMasthead
        title="Calculators"
        kicker="Tools"
        accent="learn"
        crumbs={[{ label: "Home", href: "/" }]}
        description={`${calcs.length} calculators for investing, savings, retirement, loans and tax. Every result comes with a year-by-year table you can download and the formula, worked through with your numbers.`}
      />

      {/* The three most used, set as instruments on the ink band */}
      <section aria-labelledby="most-used" className="surface-ink py-8 md:py-10">
        <div className="wrap">
          <h2 id="most-used" className="sr-only">
            Most used
          </h2>
          <div className="grid gap-px border border-rule bg-rule md:grid-cols-3">
            {featured.map((c, i) => (
              <Link prefetch={false} key={c.slug} href={`/calculators/${c.slug}/`} className="story group flex flex-col justify-between bg-black p-5 hover:bg-paper-2 md:p-6">
                <div>
                  <p className="kicker text-learn tabular">Most used · {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="headline mt-2 text-2xl">{c.name}</h3>
                  <p className="mt-2 text-md leading-normal text-ink-2">{c.description}</p>
                </div>
                <span className="btn btn-secondary mt-6 self-start">
                  Open calculator <span className="arrow" aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap mt-12 space-y-12 md:mt-16 md:space-y-14">
        {ORDER.map((group) => {
          const list = calcs.filter((c) => c.category === group);
          return (
            <section key={group} aria-labelledby={`g-${group}`} className="grid gap-x-8 gap-y-3 border-t-3 border-learn pt-3 md:grid-cols-[15rem_1fr]">
              <div>
                <h2 id={`g-${group}`} className="headline text-xl md:text-2xl">
                  {group}
                </h2>
                <p className="mt-1 text-sm leading-normal text-muted">{GROUP_NOTES[group]}</p>
                <p className="kicker mt-2 text-learn tabular">
                  {list.length} {list.length === 1 ? "calculator" : "calculators"}
                </p>
              </div>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {list.map((c) => (
                  <li key={c.slug} className="border-b border-rule">
                    <Link prefetch={false} href={`/calculators/${c.slug}/`} className="link-row text-md">
                      <span>
                        <span className="link-row-label">{c.name}</span>
                        <span className="link-row-note">{c.short}</span>
                      </span>
                      <span aria-hidden className="arrow">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
