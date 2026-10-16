"use client";

import { useMemo, useState } from "react";
import { sip } from "@/lib/calc/investing";
import { COMPOUNDING, fd, ppf, rd, type Compounding } from "@/lib/calc/savings";
import { formatINR, formatINRCompact } from "@/lib/format";
import { DonutWithLegend } from "./donut";
import { Lines, StackedArea } from "./lazy-charts";
import { BreakdownTable, CalcLayout, CalcSection, COLORS, Formula, Insight, ResultPanel, Segmented, SliderField, StatRows, Toggle } from "./kit";

const f4 = (n: number) => n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");

// PPF ------------------------------------------------------------------------------

export function PpfCalculator() {
  const [deposit, setDeposit] = useState(150000);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(15);
  const [extend, setExtend] = useState(false);
  const r = useMemo(() => ppf(deposit, rate, years), [deposit, rate, years]);
  const ext = useMemo(() => ppf(deposit, rate, years + 5), [deposit, rate, years]);
  const rr = rate / 100;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Yearly deposit" value={deposit} onChange={setDeposit} min={500} max={150000} step={500} hint="Minimum ₹500, maximum ₹1.5 lakh in a financial year" />
            <SliderField label="Interest rate (p.a.)" value={rate} onChange={setRate} min={5} max={10} step={0.05} unit="pct" decimals={2} hint="Set by the government every quarter" />
            <SliderField label="Tenure" value={years} onChange={setYears} min={15} max={50} step={5} unit="years" hint="15 years, extendable in blocks of 5" />
            <div className="border-t border-rule">
              <Toggle label="Show a 5-year extension" description="Keep depositing for one more block" checked={extend} onChange={setExtend} />
            </div>
          </>
        }
        results={
          <ResultPanel label="Maturity value" value={r.maturity} sub={<>Tax-free after {years} years</>}>
            <DonutWithLegend
              slices={[
                { name: "Total deposited", value: r.deposited, color: COLORS.invested },
                { name: "Interest earned", value: r.interest, color: COLORS.returns },
              ]}
              centerLabel="Interest"
              centerValue={`${((r.interest / r.maturity) * 100).toFixed(0)}%`}
            />
            {extend ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: `After ${years} years`, value: r.maturity },
                    { label: `After ${years + 5} years`, value: ext.maturity },
                    { label: "Extra from extending", value: ext.maturity - r.maturity, strong: true },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="How your PPF balance grows">
        <StackedArea
          data={(extend ? ext : r).rows.map((row) => ({ year: row.year, deposited: row.deposited, interest: row.interest }))}
          xKey="year"
          series={[
            { key: "deposited", name: "Deposited", color: COLORS.invested },
            { key: "interest", name: "Interest", color: COLORS.returns },
          ]}
        />
        <div className="mt-4">
          <Insight>
            Depositing before 5 April each year earns interest for the full year. At {rate}%, interest overtakes your own deposits in year{" "}
            <strong>{r.rows.find((x) => x.interest > x.deposited)?.year ?? "–"}</strong>.
          </Insight>
        </div>
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={(extend ? ext : r).rows}
          filename={`ppf-${deposit}-${years}y.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Deposited to date", value: (x) => x.deposited, format: "inr" },
            { label: "Interest to date", value: (x) => x.interest, format: "inr" },
            { label: "Balance", value: (x) => x.balance, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="F = P × [((1 + r)ⁿ − 1) ÷ r] × (1 + r)"
          legend={[
            ["P", "Yearly deposit, made at the start of the year"],
            ["r", "Annual interest rate"],
            ["n", "Number of years"],
          ]}
          steps={[
            { label: "Rate", expr: `r = ${rate}% = ${f4(rr)}` },
            { label: "Growth factor", expr: `(1 + r)ⁿ = ${f4(Math.pow(1 + rr, years))}` },
            { label: "Maturity", expr: `${formatINR(deposit)} × [(${f4(Math.pow(1 + rr, years))} − 1) ÷ ${f4(rr)}] × ${f4(1 + rr)} = ${formatINR(r.maturity)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

// FD -------------------------------------------------------------------------------

const COMP_OPTIONS: { value: Compounding; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half-yearly", label: "Half-yearly" },
  { value: "yearly", label: "Yearly" },
];

export function FdCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7);
  const [months, setMonths] = useState(60);
  const [comp, setComp] = useState<Compounding>("quarterly");
  const [senior, setSenior] = useState(false);
  const r = useMemo(() => fd(principal, rate, months, comp), [principal, rate, months, comp]);
  const s = useMemo(() => fd(principal, rate + 0.5, months, comp), [principal, rate, months, comp]);
  const n = COMPOUNDING[comp];
  const yieldPct = (Math.pow(1 + rate / 100 / n, n) - 1) * 100;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Deposit amount" value={principal} onChange={setPrincipal} min={5000} max={50000000} step={1000} />
            <SliderField label="Interest rate (p.a.)" value={rate} onChange={setRate} min={2} max={12} step={0.05} unit="pct" decimals={2} />
            <SliderField label="Tenure" value={months} onChange={setMonths} min={3} max={120} step={1} unit="months" />
            <Segmented label="Compounding" options={COMP_OPTIONS} value={comp} onChange={setComp} />
            <div className="border-t border-rule">
              <Toggle label="Senior citizen rate" description="Compare with 0.50% extra, which many banks pay" checked={senior} onChange={setSenior} />
            </div>
          </>
        }
        results={
          <ResultPanel label="Maturity value" value={r.maturity} sub={<>Effective annual yield {yieldPct.toFixed(2)}%</>}>
            <DonutWithLegend
              slices={[
                { name: "Principal", value: principal, color: COLORS.invested },
                { name: "Interest", value: r.interest, color: COLORS.returns },
              ]}
            />
            {senior ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: `At ${rate}%`, value: r.maturity },
                    { label: `At ${(rate + 0.5).toFixed(2)}% (senior)`, value: s.maturity },
                    { label: "Extra interest", value: s.maturity - r.maturity, strong: true },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="Growth over the tenure">
        <StackedArea
          data={r.rows.map((row) => ({ year: row.year, principal, interest: row.interest }))}
          xKey="year"
          series={[
            { key: "principal", name: "Principal", color: COLORS.invested },
            { key: "interest", name: "Interest", color: COLORS.returns },
          ]}
        />
        <div className="mt-4">
          <Insight>
            Interest is taxed at your slab rate. At the 30% slab plus cess, the post-tax yield on this FD is about <strong>{(yieldPct * 0.688).toFixed(2)}%</strong>.
          </Insight>
        </div>
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`fd-${principal}-${rate}pct-${months}m.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Principal", value: () => principal, format: "inr" },
            { label: "Interest to date", value: (x) => x.interest, format: "inr" },
            { label: "Balance", value: (x) => x.balance, format: "inr" },
            ...(senior ? [{ label: "Senior balance", value: (x: { year: number }) => s.rows[x.year - 1].balance, format: "inr" as const }] : []),
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="A = P × (1 + r ÷ n)^(n × t)"
          legend={[
            ["P", "Deposit amount"],
            ["r", "Annual interest rate"],
            ["n", "Compounding periods a year"],
            ["t", "Tenure in years"],
          ]}
          steps={[
            { label: "Rate per period", expr: `r ÷ n = ${rate}% ÷ ${n} = ${f4(rate / 100 / n)}` },
            { label: "Periods", expr: `n × t = ${n} × ${f4(months / 12)} = ${f4((n * months) / 12)}` },
            { label: "Maturity", expr: `${formatINR(principal)} × ${f4(1 + rate / 100 / n)}^${f4((n * months) / 12)} = ${formatINR(r.maturity)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

// RD -------------------------------------------------------------------------------

export function RdCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(7);
  const [months, setMonths] = useState(60);
  const [compare, setCompare] = useState(false);
  const [sipRate, setSipRate] = useState(12);
  const r = useMemo(() => rd(monthly, rate, months), [monthly, rate, months]);
  const s = useMemo(() => sip(monthly, sipRate, months / 12), [monthly, sipRate, months]);
  const q = rate / 400;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Monthly deposit" value={monthly} onChange={setMonthly} min={500} max={500000} step={500} />
            <SliderField label="Interest rate (p.a.)" value={rate} onChange={setRate} min={2} max={12} step={0.05} unit="pct" decimals={2} />
            <SliderField label="Tenure" value={months} onChange={setMonths} min={6} max={120} step={3} unit="months" />
            <div className="border-t border-rule">
              <Toggle label="Compare with an SIP" description="Same monthly amount in a mutual fund" checked={compare} onChange={setCompare} />
              {compare ? <SliderField label="SIP expected return (p.a.)" value={sipRate} onChange={setSipRate} min={1} max={20} step={0.1} unit="pct" decimals={1} /> : null}
            </div>
          </>
        }
        results={
          <ResultPanel label="Maturity value" value={r.maturity} sub={<>on {formatINRCompact(r.deposited)} deposited</>}>
            <DonutWithLegend
              slices={[
                { name: "Total deposited", value: r.deposited, color: COLORS.invested },
                { name: "Interest", value: r.interest, color: COLORS.returns },
              ]}
            />
            {compare ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: "RD maturity (fixed)", value: r.maturity },
                    { label: `SIP at ${sipRate}% (not guaranteed)`, value: s.value },
                    { label: "Difference", value: Math.abs(s.value - r.maturity), strong: true },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="Growth over the tenure">
        {compare ? (
          <Lines
            data={r.rows.map((row, k) => ({ year: row.year, rd: row.balance, sip: s.rows[k]?.value ?? 0 }))}
            xKey="year"
            series={[
              { key: "rd", name: "RD", color: COLORS.invested },
              { key: "sip", name: "SIP", color: COLORS.interest, dashed: true },
            ]}
          />
        ) : (
          <StackedArea
            data={r.rows.map((row) => ({ year: row.year, deposited: row.deposited, interest: row.interest }))}
            xKey="year"
            series={[
              { key: "deposited", name: "Deposited", color: COLORS.invested },
              { key: "interest", name: "Interest", color: COLORS.returns },
            ]}
          />
        )}
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`rd-${monthly}-${rate}pct-${months}m.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Deposited", value: (x) => x.deposited, format: "inr" },
            { label: "Interest", value: (x) => x.interest, format: "inr" },
            { label: "Balance", value: (x) => x.balance, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="M = R × [(1 + i)ⁿ − 1] ÷ [1 − (1 + i)^(−1/3)]"
          legend={[
            ["R", "Monthly instalment"],
            ["i", "Quarterly rate = annual rate ÷ 4"],
            ["n", "Number of quarters"],
          ]}
          steps={[
            { label: "Quarterly rate", expr: `i = ${rate}% ÷ 4 = ${f4(q)}` },
            { label: "Quarters", expr: `n = ${months} ÷ 3 = ${f4(months / 3)}` },
            { label: "Maturity", expr: `${formatINR(monthly)} × [${f4(Math.pow(1 + q, months / 3))} − 1] ÷ [1 − ${f4(Math.pow(1 + q, -1 / 3))}] = ${formatINR(r.maturity)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}
