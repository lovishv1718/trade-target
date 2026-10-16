"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { compareRegimes, computeTax, HRA_METRO_CITIES, hraExemption, type AgeGroup, type Regime, type TaxInput, type TaxResult } from "@/lib/calc/tax";
import { formatINR, formatINRCompact } from "@/lib/format";
import { DonutWithLegend } from "./donut";
import { Lines } from "./lazy-charts";
import { AnimatedValue, BreakdownTable, CalcLayout, CalcSection, COLORS, Formula, Insight, ResultPanel, Segmented, SelectField, SliderField, StatRows, Toggle } from "./kit";

// Income tax -------------------------------------------------------------------------

function breakEvenDeduction(input: TaxInput): number | null {
  const base: TaxInput = { ...input, sec80C: 0, sec80D: 0, sec80CCD1B: 0, homeLoanInterest: 0, hraExemption: 0, otherDeductions: 0 };
  const newTax = computeTax(base, "new").totalTax;
  const max = input.salary + input.otherIncome;
  if (computeTax({ ...base, otherDeductions: max }, "old").totalTax > newTax) return null;
  let lo = 0;
  let hi = max;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (computeTax({ ...base, otherDeductions: mid }, "old").totalTax <= newTax) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi / 1000) * 1000;
}

function Row({ label, a, b, strong = false, better }: { label: string; a: number | string; b: number | string; strong?: boolean; better?: Regime }) {
  const fmt = (v: number | string) => (typeof v === "number" ? formatINR(v) : v);
  return (
    <tr className={`border-t border-rule ${strong ? "font-bold" : ""}`}>
      <td className="py-2 pr-2 text-ink-2">{label}</td>
      <td className={`whitespace-nowrap px-2 py-2 text-right tabular ${better === "new" ? "bg-paper-2" : ""}`}>{fmt(a)}</td>
      <td className={`whitespace-nowrap px-2 py-2 text-right tabular ${better === "old" ? "bg-paper-2" : ""}`}>{fmt(b)}</td>
    </tr>
  );
}

function deductionTotal(r: TaxResult) {
  return r.standardDeduction + r.totalDeductions;
}

export function IncomeTaxCalculator() {
  const [age, setAge] = useState<AgeGroup>("below60");
  const [salary, setSalary] = useState(1500000);
  const [other, setOther] = useState(0);
  const [c80, setC80] = useState(150000);
  const [d80, setD80] = useState(25000);
  const [nps, setNps] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [hra, setHra] = useState(0);
  const [others, setOthers] = useState(0);
  const [showDeductions, setShowDeductions] = useState(true);
  const [slabView, setSlabView] = useState<Regime>("new");

  const input = useMemo<TaxInput>(
    () => ({ salary, otherIncome: other, age, sec80C: c80, sec80D: d80, sec80CCD1B: nps, homeLoanInterest: homeLoan, hraExemption: hra, otherDeductions: others }),
    [salary, other, age, c80, d80, nps, homeLoan, hra, others],
  );
  const cmp = useMemo(() => compareRegimes(input), [input]);
  const breakEven = useMemo(() => breakEvenDeduction(input), [input]);
  const best = cmp[cmp.better];
  const curve = useMemo(() => {
    const pts = [];
    for (let inc = 500000; inc <= 5000000; inc += 100000) {
      const i: TaxInput = { ...input, salary: inc, otherIncome: 0 };
      pts.push({ income: inc, old: computeTax(i, "old").totalTax, new: computeTax(i, "new").totalTax });
    }
    return pts;
  }, [input]);
  const slab = cmp[slabView];
  const n = cmp.new;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <Segmented
              label="Age"
              value={age}
              onChange={setAge}
              options={[
                { value: "below60", label: "Below 60" },
                { value: "60to80", label: "60 to 80" },
                { value: "above80", label: "Above 80" },
              ]}
            />
            <SliderField label="Annual salary (gross)" value={salary} onChange={setSalary} min={0} max={50000000} step={10000} />
            <SliderField label="Other income" value={other} onChange={setOther} min={0} max={10000000} step={5000} hint="Interest, rent and other income taxed at slab rates" />
            <div className="border-t border-rule">
              <Toggle label="Deductions (old regime only)" description="80C, 80D, NPS, home loan, HRA" checked={showDeductions} onChange={setShowDeductions} />
              {showDeductions ? (
                <>
                  <SliderField label="Section 80C" value={c80} onChange={setC80} min={0} max={150000} step={1000} hint="EPF, PPF, ELSS, life cover, principal on home loan" />
                  <SliderField label="Section 80D (health insurance)" value={d80} onChange={setD80} min={0} max={100000} step={1000} />
                  <SliderField label="NPS, Section 80CCD(1B)" value={nps} onChange={setNps} min={0} max={50000} step={1000} />
                  <SliderField label="Home loan interest, 24(b)" value={homeLoan} onChange={setHomeLoan} min={0} max={200000} step={5000} />
                  <SliderField label="HRA exemption" value={hra} onChange={setHra} min={0} max={1500000} step={5000} hint="Work it out with the HRA calculator" />
                  <SliderField label="Other deductions" value={others} onChange={setOthers} min={0} max={500000} step={1000} hint="80E, 80G, 80TTA and others" />
                </>
              ) : null}
            </div>
          </>
        }
        results={
          <ResultPanel
            label={cmp.saving === 0 ? "Both regimes cost the same" : `You save with the ${cmp.better} regime`}
            value={cmp.saving}
            sub={
              <>
                New {formatINR(cmp.new.totalTax)} · Old {formatINR(cmp.old.totalTax)} for FY 2026-27
              </>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-left font-semibold text-muted"> </th>
                    <th scope="col" className={`whitespace-nowrap px-2 pb-2 pt-1 text-right font-bold text-ink ${cmp.better === "new" ? "bg-paper-2" : ""}`}>New regime{cmp.better === "new" ? " ✓" : ""}</th>
                    <th scope="col" className={`whitespace-nowrap px-2 pb-2 pt-1 text-right font-bold text-ink ${cmp.better === "old" ? "bg-paper-2" : ""}`}>Old regime{cmp.better === "old" ? " ✓" : ""}</th>
                  </tr>
                </thead>
                <tbody>
                  <Row label="Gross income" a={cmp.new.grossIncome} b={cmp.old.grossIncome} better={cmp.better} />
                  <Row label="Deductions" a={deductionTotal(cmp.new)} b={deductionTotal(cmp.old)} better={cmp.better} />
                  <Row label="Taxable income" a={cmp.new.taxableIncome} b={cmp.old.taxableIncome} better={cmp.better} />
                  <Row label="Tax on slabs" a={cmp.new.slabTax} b={cmp.old.slabTax} better={cmp.better} />
                  <Row label="Rebate / relief" a={-(cmp.new.rebate + cmp.new.marginalRelief87A)} b={-(cmp.old.rebate + cmp.old.marginalRelief87A)} better={cmp.better} />
                  <Row label="Surcharge" a={cmp.new.surcharge} b={cmp.old.surcharge} better={cmp.better} />
                  <Row label="Cess (4%)" a={cmp.new.cess} b={cmp.old.cess} better={cmp.better} />
                  <tr className="border-t-2 border-ink font-bold text-ink">
                    <td className="py-2">Total tax</td>
                    <td className={`whitespace-nowrap px-2 py-2 text-right ${cmp.better === "new" ? "bg-paper-2" : ""}`}>
                      <AnimatedValue value={cmp.new.totalTax} />
                    </td>
                    <td className={`whitespace-nowrap px-2 py-2 text-right ${cmp.better === "old" ? "bg-paper-2" : ""}`}>
                      <AnimatedValue value={cmp.old.totalTax} />
                    </td>
                  </tr>
                  <Row label="Effective rate" a={`${cmp.new.effectiveRate.toFixed(2)}%`} b={`${cmp.old.effectiveRate.toFixed(2)}%`} better={cmp.better} />
                  <Row label="Monthly TDS" a={cmp.new.monthlyTax} b={cmp.old.monthlyTax} better={cmp.better} />
                </tbody>
              </table>
            </div>
          </ResultPanel>
        }
      />

      <CalcSection title="Where your income goes">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
          <DonutWithLegend
            slices={[
              { name: "Take-home", value: best.grossIncome - best.totalTax, color: COLORS.invested },
              { name: `Tax (${cmp.better} regime)`, value: best.totalTax, color: COLORS.interest },
            ]}
          />
          <Insight>
            {breakEven === null ? (
              <>At this income the new regime is cheaper whatever your deductions.</>
            ) : (
              <>
                The old regime only wins if your deductions (beyond the standard deduction) exceed <strong>{formatINRCompact(breakEven)}</strong>. Yours add up to{" "}
                <strong>{formatINRCompact(cmp.old.totalDeductions)}</strong>.
              </>
            )}
          </Insight>
        </div>
      </CalcSection>

      <CalcSection title="Tax at different income levels">
        <Lines
          data={curve.map((p) => ({ income: p.income, old: p.old, new: p.new }))}
          xKey="income"
          xLabel={(v) => formatINRCompact(Number(v))}
          series={[
            { key: "new", name: "New regime", color: COLORS.invested },
            { key: "old", name: "Old regime", color: COLORS.interest, dashed: true },
          ]}
        />
        <p className="mt-2 text-xs text-muted">Salary income on the horizontal axis, with your deductions held at the same amounts.</p>
      </CalcSection>

      <CalcSection title="Slab-wise working" aside={<Segmented label="" value={slabView} onChange={setSlabView} options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]} />}>
        <BreakdownTable
          rows={slab.slabLines}
          unitLabel="slab"
          initial={10}
          filename={`income-tax-${slabView}-regime-fy2026-27.csv`}
          columns={[
            { label: "Income slab", value: (x) => `${formatINRCompact(x.from)} – ${x.to === Infinity ? "above" : formatINRCompact(x.to)}`, format: "text" },
            { label: "Rate", value: (x) => `${x.rate}%`, format: "text" },
            { label: "Income in slab", value: (x) => x.taxable, format: "inr" },
            { label: "Tax", value: (x) => x.tax, format: "inr" },
          ]}
        />
      </CalcSection>

      <CalcSection title="How this is calculated">
        <Formula
          formula="Tax = (Slab tax − Rebate + Surcharge) × 1.04"
          legend={[
            ["Slab tax", "Tax on taxable income across slabs"],
            ["Rebate", "Section 87A: full rebate up to ₹12 lakh (new) or ₹5 lakh (old)"],
            ["1.04", "Health and education cess of 4%"],
          ]}
          steps={[
            { label: "New regime taxable income", expr: `${formatINR(n.grossIncome)} − ${formatINR(n.standardDeduction)} standard deduction = ${formatINR(n.taxableIncome)}` },
            { label: "Tax on slabs", expr: formatINR(n.slabTax) },
            { label: "Rebate and relief", expr: `− ${formatINR(n.rebate + n.marginalRelief87A)}` },
            { label: "Surcharge and cess", expr: `+ ${formatINR(n.surcharge)} + ${formatINR(n.cess)} = ${formatINR(n.totalTax)}` },
          ]}
        />
        <p className="mt-4 text-sm text-muted">
          Slabs for FY 2026-27 follow Budget 2025, which Budget 2026 left unchanged. The calculator covers income taxed at slab rates; capital gains taxed at special
          rates are not included.
        </p>
      </CalcSection>
    </>
  );
}

// HRA -------------------------------------------------------------------------------

const CITY_OPTIONS = [...HRA_METRO_CITIES.map((c) => ({ value: c, label: `${c} (50%)` })), { value: "Other", label: "Any other city (40%)" }];
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

export function HraCalculator() {
  const [basic, setBasic] = useState(50000);
  const [da, setDa] = useState(0);
  const [hraReceived, setHraReceived] = useState(20000);
  const [rent, setRent] = useState(25000);
  const [city, setCity] = useState("Mumbai");
  const [compare, setCompare] = useState(false);
  const metro = city !== "Other";
  const annual = (v: number) => v * 12;
  const r = useMemo(() => hraExemption({ basic: annual(basic), da: annual(da), hraReceived: annual(hraReceived), rentPaid: annual(rent), metro }), [basic, da, hraReceived, rent, metro]);
  const alt = useMemo(() => hraExemption({ basic: annual(basic), da: annual(da), hraReceived: annual(hraReceived), rentPaid: annual(rent), metro: !metro }), [basic, da, hraReceived, rent, metro]);
  const curve = useMemo(() => {
    const pts = [];
    const top = Math.max(rent * 2, 20000);
    for (let k = 0; k <= 20; k++) {
      const rm = Math.round((top * k) / 20 / 500) * 500;
      pts.push({ rent: rm, exempt: hraExemption({ basic: annual(basic), da: annual(da), hraReceived: annual(hraReceived), rentPaid: annual(rm), metro }).exempt });
    }
    return pts;
  }, [basic, da, hraReceived, rent, metro]);

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Monthly basic pay" value={basic} onChange={setBasic} min={5000} max={1000000} step={500} />
            <SliderField label="Monthly dearness allowance" value={da} onChange={setDa} min={0} max={500000} step={500} />
            <SliderField label="Monthly HRA received" value={hraReceived} onChange={setHraReceived} min={0} max={500000} step={500} />
            <SliderField label="Monthly rent paid" value={rent} onChange={setRent} min={0} max={500000} step={500} />
            <SelectField label="City you live in" value={city} onChange={setCity} options={CITY_OPTIONS} />
            <div className="border-t border-rule">
              <Toggle label={`Compare with ${metro ? "a non-metro" : "a metro"} city`} description="See how the 50% and 40% limits change the exemption" checked={compare} onChange={setCompare} />
            </div>
          </>
        }
        results={
          <ResultPanel label="Exempt HRA for the year" value={r.exempt} sub={<>{formatINR(r.exempt / 12)} a month is tax-free under the old regime</>}>
            <DonutWithLegend
              slices={[
                { name: "Exempt HRA", value: r.exempt, color: COLORS.invested },
                { name: "Taxable HRA", value: r.taxable, color: COLORS.interest },
              ]}
            />
            <div className="mt-4 border-t border-rule pt-3">
              <StatRows
                rows={[
                  { label: "Tax saved at the 30% slab (with cess)", value: r.exempt * 0.312, strong: true },
                  ...(compare ? [{ label: `Exempt in ${metro ? "a non-metro" : "a metro"} city`, value: alt.exempt }] : []),
                ]}
              />
            </div>
          </ResultPanel>
        }
      />
      <CalcSection title="The three limits">
        <div className="grid gap-px border border-rule bg-rule sm:grid-cols-3">
          {r.limits.map((l) => (
            <div key={l.key} className={`bg-white px-4 py-4 ${r.binding === l.key ? "outline-2 -outline-offset-2 outline-ink" : ""}`}>
              <p className="text-sm text-muted">{l.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink tabular">{formatINR(l.amount)}</p>
              {r.binding === l.key ? <p className="kicker mt-1.5 text-ink">Lowest, so this is exempt</p> : null}
            </div>
          ))}
        </div>
      </CalcSection>
      <CalcSection title="Exemption at different rents">
        <Lines
          data={curve}
          xKey="rent"
          xLabel={(v) => `${formatINR(Number(v))}/mo`}
          series={[{ key: "exempt", name: "Exempt HRA a year", color: COLORS.invested }]}
        />
        <div className="mt-4">
          <Insight>
            Rent below <strong>{formatINR((0.1 * (basic + da)))}</strong> a month earns no exemption. Beyond{" "}
            <strong>{formatINR(Math.min(hraReceived, (metro ? 0.5 : 0.4) * (basic + da)) + 0.1 * (basic + da))}</strong> a month, paying more rent no longer raises it.
          </Insight>
        </div>
      </CalcSection>
      <CalcSection title="Month-by-month breakdown">
        <BreakdownTable
          rows={MONTHS.map((m) => ({ month: m }))}
          unitLabel="month"
          initial={12}
          filename={`hra-${basic}-${rent}-${city.toLowerCase()}.csv`}
          columns={[
            { label: "Month", value: (x) => x.month, format: "text" },
            { label: "HRA received", value: () => hraReceived, format: "inr" },
            { label: "Rent paid", value: () => rent, format: "inr" },
            { label: "Exempt", value: () => r.exempt / 12, format: "inr" },
            { label: "Taxable", value: () => r.taxable / 12, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="Exempt HRA = min(HRA, Rent − 10% × Salary, k × Salary)"
          legend={[
            ["Salary", "Basic pay plus DA for the year"],
            ["k", "50% in the eight listed cities, 40% elsewhere"],
          ]}
          steps={[
            { label: "HRA received", expr: formatINR(r.limits[0].amount) },
            { label: "Rent − 10% of salary", expr: `${formatINR(annual(rent))} − ${formatINR(0.1 * annual(basic + da))} = ${formatINR(r.limits[1].amount)}` },
            { label: `${metro ? "50" : "40"}% of salary`, expr: formatINR(r.limits[2].amount) },
            { label: "Exempt", expr: `Lowest of the three = ${formatINR(r.exempt)}` },
          ]}
        />
        <p className="mt-4 text-sm text-muted">
          From FY 2026-27 the Income Tax Rules, 2026 extend the 50% limit to Bengaluru, Hyderabad, Pune and Ahmedabad. HRA exemption is not available in the new
          regime. Use the result in the <Link href="/calculators/income-tax-calculator/" className="link">income tax calculator</Link>.
        </p>
      </CalcSection>
    </>
  );
}
