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
        <p className="kicker text-accent-ink">Tools</p>
        <h1 className="headline mt-1 text-[2.2rem] leading-tight md:text-[2.7rem]">Calculators</h1>
        <p className="mt-2 text-[1.08rem] leading-relaxed text-[#3a4453]">
          {calcs.length} calculators for investing, savings, retirement, loans and tax. Every result comes with a year-by-year table you can download and the formula,
          worked through with your numbers.
        </p>
      </header>

      <section aria-label="Most used" className="mt-8 grid gap-px border border-rule bg-rule md:grid-cols-3">
        {featured.map((c, i) => (
          <Link prefetch={false} key={c.slug} href={`/calculators/${c.slug}/`} className="group flex flex-col justify-between bg-white p-6 hover:bg-paper">
            <div>
              <p className="kicker text-muted">Most used · {String(i + 1).padStart(2, "0")}</p>
              <h2 className="headline mt-2 text-[1.6rem] leading-tight group-hover:underline">{c.name}</h2>
              <p className="mt-2 text-[0.98rem] text-muted">{c.description}</p>
            </div>
            <span className="mt-5 text-sm font-semibold text-accent-ink">Open calculator →</span>
          </Link>
        ))}
      </section>

      <div className="mt-12 space-y-10">
        {ORDER.map((group) => {
          const list = calcs.filter((c) => c.category === group);
          return (
            <section key={group} aria-labelledby={`g-${group}`} className="grid gap-4 border-t-[3px] border-navy pt-3 md:grid-cols-[240px_1fr]">
              <div>
                <h2 id={`g-${group}`} className="headline text-[1.45rem]">
                  {group}
                </h2>
                <p className="mt-1 text-sm text-muted">{GROUP_NOTES[group]}</p>
              </div>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {list.map((c) => (
                  <li key={c.slug} className="border-b border-rule">
                    <Link prefetch={false} href={`/calculators/${c.slug}/`} className="group flex items-center justify-between gap-3 py-3">
                      <span>
                        <span className="block font-semibold group-hover:text-accent-ink">{c.name}</span>
                        <span className="text-sm text-muted">{c.short}</span>
                      </span>
                      <span aria-hidden className="text-accent-ink">→</span>
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
