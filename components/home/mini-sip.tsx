"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sip } from "@/lib/calc/investing";
import { formatINRCompact } from "@/lib/format";
import { Donut } from "../calculators/donut";
import { AnimatedValue, SliderField } from "../calculators/kit";

// Literal palette values: SVG strokes cannot read CSS variables
const INVESTED = "#ffffff";
const RETURNS = "#d99a12";

/** Compact live SIP calculator for the home page: sliders on paper, the answer on black. */
export function MiniSip() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const r = useMemo(() => sip(monthly, rate, years), [monthly, rate, years]);
  return (
    <div className="grid border border-rule-strong bg-white md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="px-4 py-2 sm:px-5">
        <SliderField label="Monthly SIP" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} />
        <SliderField label="Expected return" value={rate} onChange={setRate} min={4} max={20} step={0.5} unit="pct" decimals={1} />
        <SliderField label="Years" value={years} onChange={setYears} min={1} max={30} step={1} unit="years" />
      </div>
      <div className="surface-ink flex flex-col justify-between gap-6 p-4 sm:p-5">
        <div>
          <p className="kicker text-muted">Estimated value</p>
          <output className="mt-2 block break-words text-4xl font-semibold tabular-nums text-ink">
            <AnimatedValue value={r.value} />
          </output>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm tabular-nums">
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-2 text-muted">
                <span aria-hidden className="inline-block size-2.5" style={{ background: INVESTED }} />
                Invested
              </dt>
              <dd className="font-semibold text-ink">{formatINRCompact(r.invested)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-2 text-muted">
                <span aria-hidden className="inline-block size-2.5" style={{ background: RETURNS }} />
                Returns
              </dt>
              <dd className="font-semibold text-ink">{formatINRCompact(r.returns)}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Donut
            size={88}
            slices={[
              { name: "Invested", value: r.invested, color: INVESTED },
              { name: "Returns", value: r.returns, color: RETURNS },
            ]}
          />
          <Link prefetch={false} href="/calculators/sip-calculator/" className="btn ml-auto">
            Full SIP calculator <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
