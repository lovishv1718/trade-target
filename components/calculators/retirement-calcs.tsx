"use client";

import { useMemo, useState } from "react";
import { sipFutureValue, stepUpSip } from "@/lib/calc/investing";
import { epf, epfMonthlySplit, nps, retirementPlan } from "@/lib/calc/retirement";
import { formatINR, formatINRCompact } from "@/lib/format";
import { DonutWithLegend } from "./donut";
import { Lines, StackedArea } from "./lazy-charts";
import { BreakdownTable, CalcLayout, CalcSection, COLORS, Formula, Insight, ResultPanel, SliderField, StatRows, Toggle } from "./kit";

const f4 = (n: number) => n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");

// EPF ------------------------------------------------------------------------------

export function EpfCalculator() {
  const [basic, setBasic] = useState(30000);
  const [age, setAge] = useState(28);
  const [retireAge, setRetireAge] = useState(58);
  const [increase, setIncrease] = useState(6);
  const [rate, setRate] = useState(8.25);
  const [balance, setBalance] = useState(0);
  const [vpfOn, setVpfOn] = useState(false);
  const [vpf, setVpf] = useState(5);

  const base = useMemo(() => epf({ basic, age, retireAge, annualIncreasePct: increase, ratePct: rate, currentBalance: balance }), [basic, age, retireAge, increase, rate, balance]);
  const withVpf = useMemo(
    () => epf({ basic, age, retireAge, annualIncreasePct: increase, ratePct: rate, currentBalance: balance, employeePct: 12 + vpf }),
    [basic, age, retireAge, increase, rate, balance, vpf],
  );
  const r = vpfOn ? withVpf : base;
  const split = epfMonthlySplit(basic, vpfOn ? 12 + vpf : 12);
  const chart = useMemo(() => {
    const sum = (k: number, key: "employee" | "employer" | "interest") => r.rows.slice(0, k + 1).reduce((s, x) => s + x[key], 0);
    return r.rows.map((row, k) => ({ year: row.age, employee: balance + sum(k, "employee"), employer: sum(k, "employer"), interest: sum(k, "interest") }));
  }, [r, balance]);
  const firstYearMonthly = split.employee + split.employerEpf;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Monthly basic pay + DA" value={basic} onChange={setBasic} min={5000} max={500000} step={500} />
            <SliderField label="Your age" value={age} onChange={(v) => setAge(Math.min(v, retireAge - 1))} min={18} max={57} step={1} unit="years" />
            <SliderField label="Retirement age" value={retireAge} onChange={(v) => setRetireAge(Math.max(v, age + 1))} min={45} max={60} step={1} unit="years" />
            <SliderField label="Annual increase in basic pay" value={increase} onChange={setIncrease} min={0} max={20} step={0.5} unit="pct" decimals={1} />
            <SliderField label="EPF interest rate" value={rate} onChange={setRate} min={5} max={10} step={0.05} unit="pct" decimals={2} />
            <SliderField label="Current EPF balance" value={balance} onChange={setBalance} min={0} max={10000000} step={5000} />
            <div className="border-t border-rule">
              <Toggle label="Add Voluntary PF (VPF)" description="Extra contribution from your salary, earning the EPF rate" checked={vpfOn} onChange={setVpfOn} />
              {vpfOn ? <SliderField label="VPF on top of 12%" value={vpf} onChange={setVpf} min={1} max={88} step={1} unit="pct" /> : null}
            </div>
          </>
        }
        results={
          <ResultPanel label={`EPF corpus at ${retireAge}`} value={r.corpus} sub={<>{formatINR(firstYearMonthly)} goes into EPF every month in year one</>}>
            <DonutWithLegend
              slices={[
                { name: "Your contribution", value: r.totalEmployee + balance, color: COLORS.invested },
                { name: "Employer contribution", value: r.totalEmployer, color: COLORS.other },
                { name: "Interest", value: r.totalInterest, color: COLORS.returns },
              ]}
            />
            <div className="mt-4 border-t border-rule pt-3">
              <StatRows
                rows={[
                  { label: "To EPS (pension, not in corpus)", value: r.totalEps },
                  ...(vpfOn ? [{ label: "Extra corpus from VPF", value: withVpf.corpus - base.corpus, strong: true }] : []),
                ]}
              />
            </div>
          </ResultPanel>
        }
      />
      <CalcSection title="How your EPF builds up">
        <StackedArea
          data={chart}
          xKey="year"
          xLabel={(v) => `Age ${v}`}
          series={[
            { key: "employee", name: "Your contribution", color: COLORS.invested },
            { key: "employer", name: "Employer", color: COLORS.other },
            { key: "interest", name: "Interest", color: COLORS.returns },
          ]}
        />
        <div className="mt-4">
          <Insight>
            Of your employer’s 12%, <strong>{formatINR(split.eps)}</strong> a month goes to the pension scheme (EPS) because it is worked out on wages capped at ₹15,000. The
            remaining <strong>{formatINR(split.employerEpf)}</strong> goes to your EPF account.
          </Insight>
        </div>
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`epf-${basic}-${age}-${retireAge}.csv`}
          columns={[
            { label: "Age", value: (x) => x.age, format: "num" },
            { label: "Basic + DA / month", value: (x) => x.basic, format: "inr" },
            { label: "Your share", value: (x) => x.employee, format: "inr" },
            { label: "Employer EPF", value: (x) => x.employer, format: "inr" },
            { label: "Interest", value: (x) => x.interest, format: "inr" },
            { label: "Closing balance", value: (x) => x.balance, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="Iₘ = Bₘ × r ÷ 12,  Balance(year end) = B + Σ Iₘ"
          legend={[
            ["Bₘ", "Running balance after month m's contribution"],
            ["r", "EPF interest rate"],
            ["EPS", "8.33% of min(basic, ₹15,000), capped at ₹1,250"],
          ]}
          steps={[
            { label: "Your contribution", expr: `${vpfOn ? 12 + vpf : 12}% × ${formatINR(basic)} = ${formatINR(split.employee)}` },
            { label: "Employer to EPF", expr: `12% × ${formatINR(basic)} − ${formatINR(split.eps)} EPS = ${formatINR(split.employerEpf)}` },
            { label: "Year 1 interest", expr: `${formatINR(r.rows[0]?.interest ?? 0)} credited at year end` },
            { label: `Corpus at ${retireAge}`, expr: formatINR(r.corpus) },
          ]}
        />
      </CalcSection>
    </>
  );
}

// NPS ------------------------------------------------------------------------------

export function NpsCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [ret, setRet] = useState(10);
  const [annuityPct, setAnnuityPct] = useState(40);
  const [annuityRate, setAnnuityRate] = useState(6);
  const [step, setStep] = useState(0);
  const [compare, setCompare] = useState(false);

  const r = useMemo(() => nps({ monthly, age, retireAge, returnPct: ret, annuityPct, annuityRatePct: annuityRate, stepUpPct: step }), [monthly, age, retireAge, ret, annuityPct, annuityRate, step]);
  const at20 = useMemo(() => nps({ monthly, age, retireAge, returnPct: ret, annuityPct: 20, annuityRatePct: annuityRate, stepUpPct: step }), [monthly, age, retireAge, ret, annuityRate, step]);
  const at40 = useMemo(() => nps({ monthly, age, retireAge, returnPct: ret, annuityPct: 40, annuityRatePct: annuityRate, stepUpPct: step }), [monthly, age, retireAge, ret, annuityRate, step]);

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Monthly contribution" value={monthly} onChange={setMonthly} min={500} max={200000} step={500} />
            <SliderField label="Your age" value={age} onChange={(v) => setAge(Math.min(v, retireAge - 1))} min={18} max={69} step={1} unit="years" />
            <SliderField label="Exit age" value={retireAge} onChange={(v) => setRetireAge(Math.max(v, age + 1))} min={60} max={75} step={1} unit="years" />
            <SliderField label="Expected return (p.a.)" value={ret} onChange={setRet} min={6} max={14} step={0.1} unit="pct" decimals={1} />
            <SliderField label="Annual increase in contribution" value={step} onChange={setStep} min={0} max={20} step={1} unit="pct" />
            <SliderField label="Corpus used for annuity" value={annuityPct} onChange={setAnnuityPct} min={20} max={100} step={5} unit="pct" hint="Minimum 20% for non-government subscribers, 40% for government employees" />
            <SliderField label="Annuity rate (p.a.)" value={annuityRate} onChange={setAnnuityRate} min={4} max={9} step={0.1} unit="pct" decimals={1} />
            <div className="border-t border-rule">
              <Toggle label="Compare 20% and 40% annuity" description="Lump sum and pension under each" checked={compare} onChange={setCompare} />
            </div>
          </>
        }
        results={
          <ResultPanel label={`NPS corpus at ${retireAge}`} value={r.corpus} sub={<>Monthly pension of about <strong className="font-semibold text-ink tabular">{formatINR(r.monthlyPension)}</strong></>}>
            <DonutWithLegend
              slices={[
                { name: "Lump sum you can withdraw", value: r.lumpSum, color: COLORS.returns },
                { name: "Used to buy annuity", value: r.annuityAmount, color: COLORS.invested },
              ]}
            />
            <div className="mt-4 border-t border-rule pt-3">
              <StatRows
                rows={[
                  { label: "Total contributed", value: r.invested },
                  { label: "Returns earned", value: r.returns },
                ]}
              />
            </div>
            {compare ? (
              <div className="mt-4 grid grid-cols-2 gap-px border border-rule bg-rule text-sm">
                {[
                  ["20% annuity", at20],
                  ["40% annuity", at40],
                ].map(([label, x]) => {
                  const v = x as typeof at20;
                  return (
                    <div key={label as string} className="bg-white p-3">
                      <p className="font-semibold text-ink">{label as string}</p>
                      <p className="mt-1 text-muted">Lump sum</p>
                      <p className="font-semibold tabular">{formatINRCompact(v.lumpSum)}</p>
                      <p className="mt-1 text-muted">Pension</p>
                      <p className="font-semibold tabular">{formatINR(v.monthlyPension)}/mo</p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="How your NPS corpus grows">
        <StackedArea
          data={r.rows.map((row) => ({ year: row.age, invested: row.invested, returns: row.value - row.invested }))}
          xKey="year"
          xLabel={(v) => `Age ${v}`}
          series={[
            { key: "invested", name: "Contributed", color: COLORS.invested },
            { key: "returns", name: "Returns", color: COLORS.returns },
          ]}
        />
        <div className="mt-4">
          <Insight>
            Up to 60% of the corpus can be withdrawn tax-free at exit. The pension from the annuity is taxed as income each year.
          </Insight>
        </div>
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`nps-${monthly}-${age}.csv`}
          columns={[
            { label: "Age", value: (x) => x.age, format: "num" },
            { label: "Contributed to date", value: (x) => x.invested, format: "inr" },
            { label: "Returns", value: (x) => x.value - x.invested, format: "inr" },
            { label: "Corpus", value: (x) => x.value, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="Pension = Corpus × a × annuity rate ÷ 12"
          legend={[
            ["Corpus", "Monthly contributions compounded monthly until exit"],
            ["a", "Share of corpus used to buy the annuity"],
          ]}
          steps={[
            { label: "Corpus", expr: `${formatINR(r.corpus)} after ${(retireAge - age) * 12} months at ${ret}%` },
            { label: "Annuity purchase", expr: `${formatINR(r.corpus)} × ${annuityPct}% = ${formatINR(r.annuityAmount)}` },
            { label: "Monthly pension", expr: `${formatINR(r.annuityAmount)} × ${annuityRate}% ÷ 12 = ${formatINR(r.monthlyPension)}` },
            { label: "Lump sum", expr: `${formatINR(r.corpus)} − ${formatINR(r.annuityAmount)} = ${formatINR(r.lumpSum)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

// Retirement -------------------------------------------------------------------------

export function RetirementCalculator() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [life, setLife] = useState(85);
  const [expense, setExpense] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [pre, setPre] = useState(12);
  const [post, setPost] = useState(8);
  const [savings, setSavings] = useState(500000);
  const [stepUp, setStepUp] = useState(false);

  const r = useMemo(
    () => retirementPlan({ age, retireAge, lifeExpectancy: life, monthlyExpense: expense, inflationPct: inflation, preReturnPct: pre, postReturnPct: post, currentSavings: savings }),
    [age, retireAge, life, expense, inflation, pre, post, savings],
  );
  const years = r.yearsToRetire;
  const stepUnit = useMemo(() => stepUpSip(1, 10, pre, years).value, [pre, years]);
  const stepStart = stepUnit > 0 ? r.shortfall / stepUnit : 0;
  const sipReturns = sipFutureValue(r.monthlySip, pre, years * 12) - r.totalSipInvested;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Current age" value={age} onChange={(v) => setAge(Math.min(v, retireAge - 1))} min={18} max={60} step={1} unit="years" />
            <SliderField label="Retirement age" value={retireAge} onChange={(v) => setRetireAge(Math.min(Math.max(v, age + 1), life - 1))} min={40} max={70} step={1} unit="years" />
            <SliderField label="Life expectancy" value={life} onChange={(v) => setLife(Math.max(v, retireAge + 1))} min={60} max={100} step={1} unit="years" />
            <SliderField label="Monthly expenses today" value={expense} onChange={setExpense} min={5000} max={500000} step={1000} />
            <SliderField label="Inflation" value={inflation} onChange={setInflation} min={2} max={10} step={0.5} unit="pct" decimals={1} />
            <SliderField label="Return before retirement" value={pre} onChange={setPre} min={4} max={15} step={0.5} unit="pct" decimals={1} />
            <SliderField label="Return after retirement" value={post} onChange={setPost} min={2} max={12} step={0.5} unit="pct" decimals={1} />
            <SliderField label="Savings already set aside" value={savings} onChange={setSavings} min={0} max={50000000} step={10000} />
            <div className="border-t border-rule">
              <Toggle label="Raise the SIP 10% a year" description="Start lower and grow with your income" checked={stepUp} onChange={setStepUp} />
            </div>
          </>
        }
        results={
          <ResultPanel
            label={stepUp ? "Starting monthly SIP needed" : "Monthly SIP needed"}
            value={stepUp ? stepStart : r.monthlySip}
            sub={<>to build {formatINRCompact(r.corpusNeeded)} by age {retireAge}</>}
          >
            <StatRows
              rows={[
                { label: "Corpus needed at retirement", value: r.corpusNeeded, strong: true },
                { label: `Monthly expenses at ${retireAge}`, value: r.monthlyExpenseAtRetirement },
                { label: "Existing savings by then", value: r.savingsAtRetirement },
                ...(stepUp ? [{ label: "Flat SIP for comparison", value: r.monthlySip }] : [{ label: "With a 10% step-up, start at", value: stepStart }]),
              ]}
            />
            <div className="mt-4 border-t border-rule pt-4">
              <DonutWithLegend
                slices={[
                  { name: "Existing savings, grown", value: Math.min(r.savingsAtRetirement, r.corpusNeeded), color: COLORS.other },
                  { name: "SIP contributions", value: r.totalSipInvested, color: COLORS.invested },
                  { name: "SIP returns", value: Math.max(sipReturns, 0), color: COLORS.returns },
                ]}
              />
            </div>
          </ResultPanel>
        }
      />
      <CalcSection title="Path to your retirement corpus">
        <Lines
          data={r.rows.map((row) => ({ year: row.age, value: row.value, target: row.target }))}
          xKey="year"
          xLabel={(v) => `Age ${v}`}
          series={[
            { key: "value", name: "Projected savings", color: COLORS.invested },
            { key: "target", name: "Corpus needed", color: COLORS.interest, dashed: true },
          ]}
        />
        <div className="mt-4">
          <Insight>
            At {inflation}% inflation, today’s {formatINR(expense)} a month becomes <strong>{formatINR(r.monthlyExpenseAtRetirement)}</strong> by age {retireAge}. The corpus has
            to fund {r.yearsInRetirement} years of rising expenses.
          </Insight>
        </div>
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`retirement-plan-${age}-${retireAge}.csv`}
          columns={[
            { label: "Age", value: (x) => x.age, format: "num" },
            { label: "Invested to date", value: (x) => x.invested, format: "inr" },
            { label: "Projected value", value: (x) => x.value, format: "inr" },
            { label: "Target", value: (x) => x.target, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="Corpus = E × [1 − ((1 + g) ÷ (1 + r))ᴺ] ÷ (r − g) × (1 + r)"
          legend={[
            ["E", "First year's expenses at retirement"],
            ["g", "Inflation"],
            ["r", "Return after retirement"],
            ["N", "Years in retirement"],
          ]}
          steps={[
            { label: "Expenses at retirement", expr: `${formatINR(expense)} × ${f4(1 + inflation / 100)}^${years} × 12 = ${formatINR(r.monthlyExpenseAtRetirement * 12)} a year` },
            { label: "Corpus needed", expr: `${formatINR(r.corpusNeeded)} for ${r.yearsInRetirement} years` },
            { label: "Gap after existing savings", expr: `${formatINR(r.corpusNeeded)} − ${formatINR(r.savingsAtRetirement)} = ${formatINR(r.shortfall)}` },
            { label: "Monthly SIP", expr: `${formatINR(r.shortfall)} ÷ ${f4(sipFutureValue(1, pre, years * 12))} = ${formatINR(r.monthlySip)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}
