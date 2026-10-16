"use client";

import { useMemo, useState } from "react";
import { cagr, cagrPath, lumpsum, sip, stepUpSip, swp } from "@/lib/calc/investing";
import { formatINR, formatINRCompact, formatNumber } from "@/lib/format";
import { DonutWithLegend } from "./donut";
import { Lines, StackedArea } from "./lazy-charts";
import { BreakdownTable, CalcLayout, CalcSection, COLORS, Formula, Insight, ResultPanel, SliderField, StatRows, Toggle } from "./kit";

const yrs = (n: number) => `${n} ${n === 1 ? "year" : "years"}`;
const f4 = (n: number) => n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");

// SIP ---------------------------------------------------------------------------

export function SipCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [compare, setCompare] = useState(false);

  const r = useMemo(() => sip(monthly, rate, years), [monthly, rate, years]);
  const lump = useMemo(() => lumpsum(r.invested, rate, years), [r.invested, rate, years]);
  const i = rate / 1200;
  const n = years * 12;

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Monthly investment" value={monthly} onChange={setMonthly} min={500} max={200000} step={500} />
            <SliderField label="Expected return (p.a.)" value={rate} onChange={setRate} min={1} max={30} step={0.1} unit="pct" decimals={1} />
            <SliderField label="Time period" value={years} onChange={setYears} min={1} max={40} step={1} unit="years" />
            <div className="border-t border-rule">
              <Toggle label="Compare with lumpsum" description="Invest the same total on day one instead" checked={compare} onChange={setCompare} />
            </div>
          </>
        }
        results={
          <ResultPanel label="Estimated value" value={r.value} sub={<>on {formatINRCompact(r.invested)} invested over {yrs(years)}</>}>
            <DonutWithLegend
              slices={[
                { name: "Amount invested", value: r.invested, color: COLORS.invested },
                { name: "Estimated returns", value: r.returns, color: COLORS.returns },
              ]}
              centerLabel="Returns"
              centerValue={`${((r.returns / r.value) * 100).toFixed(0)}%`}
            />
            {compare ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: "SIP value", value: r.value },
                    { label: `Lumpsum of ${formatINRCompact(r.invested)}`, value: lump.value },
                    { label: lump.value > r.value ? "Lumpsum ahead by" : "SIP ahead by", value: Math.abs(lump.value - r.value), strong: true },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />

      <CalcSection title="How your SIP grows">
        {compare ? (
          <Lines
            data={r.rows.map((row, k) => ({ year: row.year, sip: row.value, lump: lump.rows[k].value }))}
            xKey="year"
            series={[
              { key: "sip", name: "SIP", color: COLORS.invested },
              { key: "lump", name: "Lumpsum", color: COLORS.interest, dashed: true },
            ]}
          />
        ) : (
          <StackedArea
            data={r.rows.map((row) => ({ year: row.year, invested: row.invested, returns: row.returns }))}
            xKey="year"
            series={[
              { key: "invested", name: "Invested", color: COLORS.invested },
              { key: "returns", name: "Returns", color: COLORS.returns },
            ]}
          />
        )}
        <div className="mt-4">
          <Insight>
            Returns make up <strong>{((r.returns / r.value) * 100).toFixed(1)}%</strong> of the final value. Doubling the period to {yrs(years * 2)} would take the
            same SIP to about <strong>{formatINRCompact(sip(monthly, rate, years * 2).value)}</strong>.
          </Insight>
        </div>
      </CalcSection>

      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`sip-${monthly}-${rate}pct-${years}y.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Invested", value: (x) => x.invested, format: "inr" },
            { label: "Returns", value: (x) => x.returns, format: "inr" },
            { label: "Value", value: (x) => x.value, format: "inr" },
            ...(compare ? [{ label: "Lumpsum value", value: (x: { year: number }) => lump.rows[x.year - 1].value, format: "inr" as const }] : []),
          ]}
        />
      </CalcSection>

      <CalcSection title="How this is calculated">
        <Formula
          formula="FV = P × [((1 + i)ⁿ − 1) ÷ i] × (1 + i)"
          legend={[
            ["P", "Monthly instalment"],
            ["i", "Monthly rate = annual return ÷ 12"],
            ["n", "Number of instalments"],
          ]}
          steps={[
            { label: "Monthly rate", expr: `i = ${rate}% ÷ 12 = ${f4(i)}` },
            { label: "Instalments", expr: `n = ${years} × 12 = ${n}` },
            { label: "Growth factor", expr: `(1 + i)ⁿ = ${f4(Math.pow(1 + i, n))}` },
            { label: "Future value", expr: `${formatINR(monthly)} × [(${f4(Math.pow(1 + i, n))} − 1) ÷ ${f4(i)}] × ${f4(1 + i)} = ${formatINR(r.value)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

// Lumpsum -------------------------------------------------------------------------

export function LumpsumCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [compare, setCompare] = useState(false);
  const r = useMemo(() => lumpsum(principal, rate, years), [principal, rate, years]);
  const monthlyEq = principal / (years * 12);
  const s = useMemo(() => sip(monthlyEq, rate, years), [monthlyEq, rate, years]);
  const factor = Math.pow(1 + rate / 100, years);

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Total investment" value={principal} onChange={setPrincipal} min={5000} max={10000000} step={5000} />
            <SliderField label="Expected return (p.a.)" value={rate} onChange={setRate} min={1} max={30} step={0.1} unit="pct" decimals={1} />
            <SliderField label="Time period" value={years} onChange={setYears} min={1} max={40} step={1} unit="years" />
            <div className="border-t border-rule">
              <Toggle label="Compare with SIP" description={`Spread it as ${formatINR(monthlyEq)} a month instead`} checked={compare} onChange={setCompare} />
            </div>
          </>
        }
        results={
          <ResultPanel label="Estimated value" value={r.value} sub={<>{factor.toFixed(2)}× your money in {yrs(years)}</>}>
            <DonutWithLegend
              slices={[
                { name: "Amount invested", value: principal, color: COLORS.invested },
                { name: "Estimated returns", value: r.returns, color: COLORS.returns },
              ]}
              centerLabel="Gain"
              centerValue={`${((factor - 1) * 100).toFixed(0)}%`}
            />
            {compare ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: "Lumpsum value", value: r.value },
                    { label: `SIP of ${formatINR(monthlyEq)}/month`, value: s.value },
                    { label: "Difference", value: Math.abs(r.value - s.value), strong: true },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="Growth over time">
        {compare ? (
          <Lines
            data={r.rows.map((row, k) => ({ year: row.year, lump: row.value, sip: s.rows[k].value }))}
            xKey="year"
            series={[
              { key: "lump", name: "Lumpsum", color: COLORS.invested },
              { key: "sip", name: "SIP", color: COLORS.interest, dashed: true },
            ]}
          />
        ) : (
          <StackedArea
            data={r.rows.map((row) => ({ year: row.year, invested: row.invested, returns: row.returns }))}
            xKey="year"
            series={[
              { key: "invested", name: "Invested", color: COLORS.invested },
              { key: "returns", name: "Returns", color: COLORS.returns },
            ]}
          />
        )}
        <div className="mt-4">
          <Insight>
            At {rate}% a year, money doubles roughly every <strong>{(Math.log(2) / Math.log(1 + rate / 100)).toFixed(1)} years</strong>.
          </Insight>
        </div>
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`lumpsum-${principal}-${rate}pct-${years}y.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Invested", value: (x) => x.invested, format: "inr" },
            { label: "Returns", value: (x) => x.returns, format: "inr" },
            { label: "Value", value: (x) => x.value, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="FV = P × (1 + r)ᵗ"
          legend={[
            ["P", "Amount invested"],
            ["r", "Annual return"],
            ["t", "Years"],
          ]}
          steps={[
            { label: "Annual rate", expr: `r = ${rate}% = ${f4(rate / 100)}` },
            { label: "Growth factor", expr: `(1 + r)ᵗ = ${f4(1 + rate / 100)}^${years} = ${f4(factor)}` },
            { label: "Future value", expr: `${formatINR(principal)} × ${f4(factor)} = ${formatINR(r.value)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

// Step-up SIP -----------------------------------------------------------------------

export function StepUpSipCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [step, setStep] = useState(10);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [compare, setCompare] = useState(true);
  const r = useMemo(() => stepUpSip(monthly, step, rate, years), [monthly, step, rate, years]);
  const flat = useMemo(() => sip(monthly, rate, years), [monthly, rate, years]);

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Starting monthly SIP" value={monthly} onChange={setMonthly} min={500} max={200000} step={500} />
            <SliderField label="Annual step-up" value={step} onChange={setStep} min={0} max={50} step={1} unit="pct" />
            <SliderField label="Expected return (p.a.)" value={rate} onChange={setRate} min={1} max={30} step={0.1} unit="pct" decimals={1} />
            <SliderField label="Time period" value={years} onChange={setYears} min={1} max={40} step={1} unit="years" />
            <div className="border-t border-rule">
              <Toggle label="Compare with a flat SIP" description="Same starting amount, no annual increase" checked={compare} onChange={setCompare} />
            </div>
          </>
        }
        results={
          <ResultPanel label="Estimated value" value={r.value} sub={<>SIP rises to {formatINR(r.finalInstalment)} a month by year {years}</>}>
            <DonutWithLegend
              slices={[
                { name: "Amount invested", value: r.invested, color: COLORS.invested },
                { name: "Estimated returns", value: r.returns, color: COLORS.returns },
              ]}
              centerLabel="Returns"
              centerValue={`${((r.returns / r.value) * 100).toFixed(0)}%`}
            />
            {compare ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: "Flat SIP value", value: flat.value },
                    { label: "Step-up SIP value", value: r.value },
                    { label: "Extra from step-up", value: r.value - flat.value, strong: true },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="Growth over time">
        {compare ? (
          <Lines
            data={r.rows.map((row, k) => ({ year: row.year, step: row.value, flat: flat.rows[k].value }))}
            xKey="year"
            series={[
              { key: "step", name: "Step-up SIP", color: COLORS.invested },
              { key: "flat", name: "Flat SIP", color: COLORS.interest, dashed: true },
            ]}
          />
        ) : (
          <StackedArea
            data={r.rows.map((row) => ({ year: row.year, invested: row.invested, returns: row.returns }))}
            xKey="year"
            series={[
              { key: "invested", name: "Invested", color: COLORS.invested },
              { key: "returns", name: "Returns", color: COLORS.returns },
            ]}
          />
        )}
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`step-up-sip-${monthly}-${step}pct.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Monthly SIP", value: (x) => x.monthlyInstalment, format: "inr" },
            { label: "Invested to date", value: (x) => x.invested, format: "inr" },
            { label: "Returns", value: (x) => x.returns, format: "inr" },
            { label: "Value", value: (x) => x.value, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="FV = Σ Pₖ × [((1 + i)¹² − 1) ÷ i] × (1 + i) × (1 + i)¹²⁽ᵀ⁻ᵏ⁾"
          legend={[
            ["Pₖ", "Monthly SIP in year k = P × (1 + s)ᵏ⁻¹"],
            ["s", "Annual step-up"],
            ["i", "Monthly rate = annual return ÷ 12"],
            ["T", "Total years"],
          ]}
          steps={[
            { label: "Year 1 SIP", expr: `P₁ = ${formatINR(monthly)}` },
            { label: `Year ${years} SIP`, expr: `P${years} = ${formatINR(monthly)} × ${f4(1 + step / 100)}^${years - 1} = ${formatINR(r.finalInstalment)}` },
            { label: "Each year's instalments grow for the remaining years", expr: `i = ${rate}% ÷ 12 = ${f4(rate / 1200)}` },
            { label: "Sum of all years", expr: `FV = ${formatINR(r.value)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

// SWP ------------------------------------------------------------------------------

export function SwpCalculator() {
  const [corpus, setCorpus] = useState(5000000);
  const [withdrawal, setWithdrawal] = useState(30000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(20);
  const [showLimits, setShowLimits] = useState(false);
  const r = useMemo(() => swp(corpus, withdrawal, rate, years), [corpus, withdrawal, rate, years]);
  const i = rate / 1200;
  const n = years * 12;
  const g = Math.pow(1 + i, n);
  const keepsCapital = corpus * i;
  const exhausts = i === 0 ? corpus / n : (corpus * i * g) / (g - 1);
  const chart = useMemo(
    () => r.rows.map((row, k) => ({ year: row.year, balance: row.closing, withdrawn: r.rows.slice(0, k + 1).reduce((s, x) => s + x.withdrawn, 0) })),
    [r],
  );

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Total investment" value={corpus} onChange={setCorpus} min={100000} max={100000000} step={50000} />
            <SliderField label="Monthly withdrawal" value={withdrawal} onChange={setWithdrawal} min={1000} max={1000000} step={500} />
            <SliderField label="Expected return (p.a.)" value={rate} onChange={setRate} min={1} max={20} step={0.1} unit="pct" decimals={1} />
            <SliderField label="Time period" value={years} onChange={setYears} min={1} max={40} step={1} unit="years" />
            <div className="border-t border-rule">
              <Toggle label="Show safe withdrawal limits" description="What keeps the capital intact, and what uses it up exactly" checked={showLimits} onChange={setShowLimits} />
            </div>
          </>
        }
        results={
          <ResultPanel
            label="Value at the end"
            value={r.finalValue}
            sub={
              r.depletedAtMonth ? (
                <span className="font-semibold text-gold">Money runs out in month {r.depletedAtMonth} (year {Math.ceil(r.depletedAtMonth / 12)})</span>
              ) : (
                <>after withdrawing {formatINRCompact(r.totalWithdrawn)} over {yrs(years)}</>
              )
            }
          >
            <DonutWithLegend
              slices={[
                { name: "Total withdrawn", value: r.totalWithdrawn, color: COLORS.interest },
                { name: "Left in the fund", value: r.finalValue, color: COLORS.invested },
              ]}
            />
            {showLimits ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: "Keeps capital intact", value: keepsCapital, suffix: "/ month" },
                    { label: `Uses it up in ${yrs(years)}`, value: exhausts, suffix: "/ month" },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="Balance and withdrawals over time">
        <Lines
          data={chart}
          xKey="year"
          series={[
            { key: "balance", name: "Balance", color: COLORS.invested },
            { key: "withdrawn", name: "Total withdrawn", color: COLORS.interest, dashed: true },
          ]}
        />
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={r.rows}
          filename={`swp-${corpus}-${withdrawal}.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Opening balance", value: (x) => x.opening, format: "inr" },
            { label: "Returns earned", value: (x) => x.returns, format: "inr" },
            { label: "Withdrawn", value: (x) => x.withdrawn, format: "inr" },
            { label: "Closing balance", value: (x) => x.closing, format: "inr" },
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="B = P × (1 + i)ⁿ − W × [((1 + i)ⁿ − 1) ÷ i]"
          legend={[
            ["P", "Amount invested"],
            ["W", "Monthly withdrawal, taken after each month's return"],
            ["i", "Monthly rate = annual return ÷ 12"],
            ["n", "Number of months"],
          ]}
          steps={[
            { label: "Monthly rate and months", expr: `i = ${f4(i)}, n = ${n}` },
            { label: "Corpus grown", expr: `${formatINR(corpus)} × ${f4(g)} = ${formatINR(corpus * g)}` },
            { label: "Withdrawals grown", expr: `${formatINR(withdrawal)} × ${formatNumber((g - 1) / (i || 1), 2)} = ${formatINR(withdrawal * ((g - 1) / (i || 1)))}` },
            { label: "Balance", expr: r.depletedAtMonth ? `Runs out in month ${r.depletedAtMonth}` : `= ${formatINR(r.finalValue)}` },
          ]}
        />
      </CalcSection>
    </>
  );
}

// CAGR -----------------------------------------------------------------------------

export function CagrCalculator() {
  const [start, setStart] = useState(100000);
  const [end, setEnd] = useState(250000);
  const [years, setYears] = useState(5);
  const [compare, setCompare] = useState(true);
  const [bench, setBench] = useState(7);
  const rate = cagr(start, end, years);
  const absolute = ((end - start) / start) * 100;
  const path = cagrPath(start, rate, years);
  const benchPath = cagrPath(start, bench, years);
  const benchEnd = start * Math.pow(1 + bench / 100, years);

  return (
    <>
      <CalcLayout
        inputs={
          <>
            <SliderField label="Initial value" value={start} onChange={setStart} min={1000} max={100000000} step={1000} />
            <SliderField label="Final value" value={end} onChange={setEnd} min={1000} max={500000000} step={1000} />
            <SliderField label="Duration" value={years} onChange={setYears} min={0.5} max={40} step={0.5} unit="years" decimals={1} />
            <div className="border-t border-rule">
              <Toggle label="Compare with a benchmark rate" description="For example an FD or index return" checked={compare} onChange={setCompare} />
              {compare ? <SliderField label="Benchmark return (p.a.)" value={bench} onChange={setBench} min={1} max={20} step={0.1} unit="pct" decimals={1} /> : null}
            </div>
          </>
        }
        results={
          <ResultPanel label="CAGR" value={rate} format="pct" decimals={2} sub={<>Absolute return {absolute.toFixed(1)}% over {yrs(years)}</>}>
            {end >= start ? (
              <DonutWithLegend
                slices={[
                  { name: "Initial value", value: start, color: COLORS.invested },
                  { name: "Gain", value: end - start, color: COLORS.returns },
                ]}
              />
            ) : (
              <DonutWithLegend
                slices={[
                  { name: "Value left", value: end, color: COLORS.invested },
                  { name: "Loss", value: start - end, color: "#c3282c" },
                ]}
              />
            )}
            {compare ? (
              <div className="mt-4 border-t border-rule pt-3">
                <StatRows
                  rows={[
                    { label: `At benchmark ${bench}%`, value: benchEnd },
                    { label: end >= benchEnd ? "Beat the benchmark by" : "Trailed the benchmark by", value: Math.abs(end - benchEnd), strong: true },
                  ]}
                />
              </div>
            ) : null}
          </ResultPanel>
        }
      />
      <CalcSection title="Growth path">
        <Lines
          data={path.map((p, k) => ({ year: p.year, cagr: p.value, ...(compare ? { bench: benchPath[k].value } : {}) }))}
          xKey="year"
          series={[{ key: "cagr", name: `At ${rate.toFixed(2)}% CAGR`, color: COLORS.invested }, ...(compare ? [{ key: "bench", name: `At ${bench}%`, color: COLORS.interest, dashed: true }] : [])]}
        />
      </CalcSection>
      <CalcSection title="Year-by-year breakdown">
        <BreakdownTable
          rows={path.slice(1)}
          filename={`cagr-${start}-${end}.csv`}
          columns={[
            { label: "Year", value: (x) => x.year, format: "num" },
            { label: "Value at CAGR", value: (x) => x.value, format: "inr" },
            ...(compare ? [{ label: `Value at ${bench}%`, value: (x: { year: number }) => benchPath[x.year].value, format: "inr" as const }] : []),
          ]}
        />
      </CalcSection>
      <CalcSection title="How this is calculated">
        <Formula
          formula="CAGR = (FV ÷ PV)^(1 ÷ t) − 1"
          legend={[
            ["PV", "Initial value"],
            ["FV", "Final value"],
            ["t", "Years"],
          ]}
          steps={[
            { label: "Growth multiple", expr: `${formatINR(end)} ÷ ${formatINR(start)} = ${f4(end / start)}` },
            { label: "Annualise", expr: `${f4(end / start)}^(1 ÷ ${years}) = ${f4(Math.pow(end / start, 1 / years))}` },
            { label: "CAGR", expr: `${f4(Math.pow(end / start, 1 / years))} − 1 = ${rate.toFixed(2)}%` },
          ]}
        />
      </CalcSection>
    </>
  );
}
