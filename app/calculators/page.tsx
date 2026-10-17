import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="Calculators" />
      <header className="mt-4 max-w-3xl">
        <p className="kicker text-learn">Tools</p>
        <h1 className="headline mt-1.5 text-3xl md:text-4xl lg:text-5xl">Calculators</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-2">
          {calcs.length} calculators for investing, savings, retirement, loans and tax. Every result comes with a year-by-year table you can download and the formula,
          worked through with your numbers.
        </p>
      </header>

      <section aria-labelledby="most-used" className="mt-8 border-t-3 border-learn md:mt-10">
        <h2 id="most-used" className="sr-only">
          Most used
        </h2>
        <div className="grid gap-px border-x border-b border-rule bg-rule md:grid-cols-3">
          {featured.map((c, i) => (
            <Link prefetch={false} key={c.slug} href={`/calculators/${c.slug}/`} className="group flex flex-col justify-between bg-white p-5 hover:bg-paper md:p-6">
              <div>
                <p className="kicker text-muted tabular">Most used · {String(i + 1).padStart(2, "0")}</p>
                <h3 className="headline mt-2 text-2xl">{c.name}</h3>
                <p className="mt-2 text-md leading-normal text-ink-2">{c.description}</p>
              </div>
              <span className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink">
                Open calculator
                <span aria-hidden className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 space-y-10 md:mt-14 md:space-y-12">
        {ORDER.map((group) => {
          const list = calcs.filter((c) => c.category === group);
          return (
            <section key={group} aria-labelledby={`g-${group}`} className="grid gap-x-8 gap-y-3 border-t border-ink pt-3 md:grid-cols-[15rem_1fr]">
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
                    <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex min-h-11 items-center justify-between gap-3 py-3">
                      <span>
                        <span className="block text-md font-semibold leading-snug text-ink group-hover:underline group-hover:underline-offset-3">{c.name}</span>
                        <span className="mt-0.5 block text-sm leading-normal text-muted">{c.short}</span>
                      </span>
                      <span aria-hidden className="shrink-0 text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-ink">
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
    </div>
  );
}
