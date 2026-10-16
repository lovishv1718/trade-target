"use client";

import { useMemo, useState, type ReactNode } from "react";
import { amortise, emi, loanWithPrepayment, type AmortRow } from "@/lib/calc/loans";
import { amountInWords, formatINR, formatINRCompact } from "@/lib/format";
import { DonutWithLegend } from "./donut";
import { StackedBars } from "./lazy-charts";
import { BreakdownTable, CalcLayout, CalcSection, COLORS, Formula, Insight, ResultPanel, SliderField, StatRows, Toggle } from "./kit";

const f6 = (n: number) => n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
const tenureLabel = (m: number) => `${Math.floor(m / 12)} yrs${m % 12 ? ` ${m % 12} mo` : ""}`;

function LoanSections({ principal, rate, months, rows, emiValue, slug, extra }: { principal: number; rate: number; months: number; rows: AmortRow[]; emiValue: number; slug: string; extra?: ReactNode }) {
  const r = rate / 1200;
  const g = Math.pow(1 + r, months);
  const hasPrepay = rows.some((x) => x.prepaid > 0);
  return (
    <>
      <CalcSection title="Principal and interest paid each year">
        <StackedBars
          data={rows.map((x) => ({ year: x.year, principal: x.principalPaid + x.prepaid, interest: x.interestPaid }))}
          xKey="year"
          series={[
            { key: "principal", name: "Principal", color: COLORS.invested },
            { key: "interest", name: "Interest", color: COLORS.interest },
          ]}
        />
        {extra ? <div className="mt-4">{extra}</div> : null}
      </CalcSection>
      <CalcSection title="Amortisation schedule">
        <BreakdownTable
          rows={rows}
          filename={`${slug}-${principal}-${rate}pct.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Principal paid", value: (x) => x.principalPaid, format: "inr" },
            { label: "Interest paid", value: (x) => x.interestPaid, format: "inr" },
            ...(hasPrepay ? [{ label: "Prepaid", value: (x: AmortRow) => x.prepaid, format: "inr" as const }] : []),
            { label: "Outstanding", value: (x) => x.balance, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="EMI = P × r × (1 + r)ⁿ ÷ [(1 + r)ⁿ − 1]"
          legend={[
            ["P", "Loan amount"],
            ["r", "Monthly rate = annual rate ÷ 12"],
            ["n", "Number of monthly instalments"],
          ]}
          steps={[
            { label: "Monthly rate", expr: `r = ${rate}% ÷ 12 = ${f6(r)}` },
            { label: "Instalments", expr: `n = ${months}` },
            { label: "(1 + r)ⁿ", expr: f6(g) },
            { label: "EMI", expr: `${formatINR(principal)} × ${f6(r)} × ${f6(g)} ÷ ${f6(g - 1)} = ${formatINR(emiValue)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

function LoanResult({ emiValue, principal, interest, sub, children }: { emiValue: number; principal: number; interest: number; sub: ReactNode; children?: ReactNode }) {
  return (
    <ResultPanel label="Monthly EMI" value={emiValue} sub={sub}>
      <DonutWithLegend
        slices={[
          { name: "Principal", value: principal, color: COLORS.invested },
          { name: "Total interest", value: interest, color: COLORS.interest },
        ]}
        centerLabel="Total"
        centerValue={formatINRCompact(principal + interest)}
      />
      {children ? <div className="mt-4 border-t border-rule pt-3">{children}</div> : null}
    </ResultPanel>
  );
}

// Home loan ----------------------------------------------------------------------------

export function HomeLoanCalculator() {
  const [principal, setPrincipal] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [prepayOn, setPrepayOn] = useState(false);
  const [lump, setLump] = useState(500000);
  const [lumpYear, setLumpYear] = useState(3);
  const [yearly, setYearly] = useState(0);
  const months = years * 12;
  const plan = useMemo(
    () => loanWithPrepayment(principal, rate, months, prepayOn ? { lumpSum: lump, lumpSumMonth: lumpYear * 12, yearly } : {}),
    [principal, rate, months, prepayOn, lump, lumpYear, yearly],
  );
  const view = prepayOn ? plan.withPrepay : plan.base;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Loan amount" value={principal} onChange={setPrincipal} min={500000} max={100000000} step={50000} />
            <SliderField label="Interest rate (p.a.)" value={rate} onChange={setRate} min={6} max={15} step={0.05} unit="pct" decimals={2} />
            <SliderField label="Loan tenure" value={years} onChange={setYears} min={1} max={30} step={1} unit="years" />
            <div className="border-t border-rule">
              <Toggle label="Add a prepayment" description="Keep the EMI the same and close the loan sooner" checked={prepayOn} onChange={setPrepayOn} />
              {prepayOn ? (
                <>
                  <SliderField label="One-time prepayment" value={lump} onChange={setLump} min={0} max={Math.max(principal / 2, 100000)} step={10000} />
                  <SliderField label="Paid at the end of year" value={lumpYear} onChange={(v) => setLumpYear(Math.min(v, years))} min={1} max={years} step={1} unit="years" />
                  <SliderField label="Extra prepayment every year" value={yearly} onChange={setYearly} min={0} max={1000000} step={5000} />
                </>
              ) : null}
            </div>
          </>
        }
        results={
          <LoanResult emiValue={view.emi} principal={principal} interest={view.totalInterest} sub={<>for {years} years on {formatINRCompact(principal)}</>}>
            {prepayOn ? (
              <StatRows
                rows={[
                  { label: "Interest without prepayment", value: plan.base.totalInterest },
                  { label: "Interest with prepayment", value: plan.withPrepay.totalInterest },
                  { label: "Interest saved", value: plan.interestSaved, strong: true },
                  { label: "EMIs saved", value: plan.monthsSaved, format: "num", suffix: "months" },
                ]}
              />
            ) : (
              <StatRows
                rows={[
                  { label: "Total interest", value: plan.base.totalInterest },
                  { label: "Total amount payable", value: plan.base.totalPayment, strong: true },
                ]}
              />
            )}
          </LoanResult>
        }
      />
      <LoanSections
        principal={principal}
        rate={rate}
        months={months}
        rows={view.rows}
        emiValue={view.emi}
        slug="home-loan"
        extra={
          <Insight>
            In the first year, <strong>{((plan.base.rows[0]?.interestPaid / (view.emi * 12)) * 100).toFixed(0)}%</strong> of what you pay goes to interest.{" "}
            {prepayOn ? (
              <>
                The prepayment plan saves <strong>{formatINRCompact(plan.interestSaved)}</strong> and finishes the loan in <strong>{tenureLabel(plan.withPrepay.months)}</strong>.
              </>
            ) : (
              <>Turn on prepayment to see how much an early part-payment saves.</>
            )}
          </Insight>
        }
      />
    </>
  );
}

// Car loan -----------------------------------------------------------------------------

export function CarLoanCalculator() {
  const [price, setPrice] = useState(1000000);
  const [down, setDown] = useState(200000);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(5);
  const [compare, setCompare] = useState(false);
  const principal = Math.max(price - down, 0);
  const months = years * 12;
  const r = useMemo(() => amortise(principal, rate, months), [principal, rate, months]);
  const options = [3, 5, 7].map((y) => {
    const e = emi(principal, rate, y * 12);
    return { years: y, emi: e, interest: e * y * 12 - principal };
  });

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="On-road price" value={price} onChange={(v) => { setPrice(v); setDown((d) => Math.min(d, v)); }} min={100000} max={20000000} step={10000} />
            <SliderField label="Down payment" value={down} onChange={(v) => setDown(Math.min(v, price))} min={0} max={price} step={5000} hint={`${((down / price) * 100).toFixed(0)}% of the price; you borrow ₹${amountInWords(principal)}`} />
            <SliderField label="Interest rate (p.a.)" value={rate} onChange={setRate} min={6} max={18} step={0.05} unit="pct" decimals={2} />
            <SliderField label="Loan tenure" value={years} onChange={setYears} min={1} max={7} step={1} unit="years" />
            <div className="border-t border-rule">
              <Toggle label="Compare 3, 5 and 7 years" description="Lower EMI against higher total interest" checked={compare} onChange={setCompare} />
            </div>
          </>
        }
        results={
          <LoanResult emiValue={r.emi} principal={principal} interest={r.totalInterest} sub={<>on a loan of {formatINRCompact(principal)}</>}>
            {compare ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="pb-1 font-semibold">Tenure</th>
                    <th className="pb-1 text-right font-semibold">EMI</th>
                    <th className="pb-1 text-right font-semibold">Interest</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((o) => (
                    <tr key={o.years} className={`border-t border-rule ${o.years === years ? "font-bold" : ""}`}>
                      <td className="py-1.5">{o.years} years</td>
                      <td className="py-1.5 text-right tabular">{formatINR(o.emi)}</td>
                      <td className="py-1.5 text-right tabular">{formatINR(o.interest)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <StatRows
                rows={[
                  { label: "Down payment", value: down },
                  { label: "Total interest", value: r.totalInterest },
                  { label: "Total cost of the car", value: down + r.totalPayment, strong: true },
                ]}
              />
            )}
          </LoanResult>
        }
      />
      <LoanSections
        principal={principal}
        rate={rate}
        months={months}
        rows={r.rows}
        emiValue={r.emi}
        slug="car-loan"
        extra={
          <Insight>
            Raising the down payment by ₹50,000 would cut the EMI by about <strong>{formatINR(emi(50000, rate, months))}</strong> and total interest by{" "}
            <strong>{formatINR(emi(50000, rate, months) * months - 50000)}</strong>.
          </Insight>
        }
      />
    </>
  );
}

// Personal loan ------------------------------------------------------------------------

export function PersonalLoanCalculator() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(13);
  const [years, setYears] = useState(3);
  const [fee, setFee] = useState(2);
  const [compare, setCompare] = useState(false);
  const months = years * 12;
  const r = useMemo(() => amortise(principal, rate, months), [principal, rate, months]);
  const feeAmount = ((principal * fee) / 100) * 1.18;
  const card = useMemo(() => amortise(principal, 42, months), [principal, months]);

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Loan amount" value={principal} onChange={setPrincipal} min={50000} max={5000000} step={10000} />
            <SliderField label="Interest rate (p.a.)" value={rate} onChange={setRate} min={9} max={30} step={0.05} unit="pct" decimals={2} />
            <SliderField label="Loan tenure" value={years} onChange={setYears} min={1} max={7} step={1} unit="years" />
            <SliderField label="Processing fee" value={fee} onChange={setFee} min={0} max={5} step={0.1} unit="pct" decimals={1} hint="GST of 18% is added on the fee" />
            <div className="border-t border-rule">
              <Toggle label="Compare with a credit card balance" description="Same repayment period at 3.5% a month (42% a year)" checked={compare} onChange={setCompare} />
            </div>
          </>
        }
        results={
          <LoanResult emiValue={r.emi} principal={principal} interest={r.totalInterest} sub={<>for {years} {years === 1 ? "year" : "years"} at {rate}%</>}>
            <StatRows
              rows={[
                { label: "Processing fee incl. GST", value: feeAmount },
                { label: "Amount credited to you", value: principal - feeAmount },
                { label: "Total cost of borrowing", value: r.totalInterest + feeAmount, strong: true },
                ...(compare ? [{ label: "Interest on a card balance", value: card.totalInterest }, { label: "Saved with the loan", value: card.totalInterest - r.totalInterest - feeAmount, strong: true }] : []),
              ]}
            />
          </LoanResult>
        }
      />
      <LoanSections
        principal={principal}
        rate={rate}
        months={months}
        rows={r.rows}
        emiValue={r.emi}
        slug="personal-loan"
        extra={
          <Insight>
            Including the fee, the loan costs you <strong>{(((r.totalInterest + feeAmount) / principal) * 100).toFixed(1)}%</strong> of the amount borrowed over {years}{" "}
            {years === 1 ? "year" : "years"}.
          </Insight>
        }
      />
    </>
  );
}
