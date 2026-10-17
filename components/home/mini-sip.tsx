"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sip } from "@/lib/calc/investing";
import { formatINRCompact } from "@/lib/format";
import { Donut } from "../calculators/donut";
import { LiveValue, SliderField } from "../calculators/kit";

// Literal palette values: SVG strokes take them as attributes
const INVESTED = "#ffffff";
const RETURNS = "#d99a12";

/**
 * Compact live SIP calculator for the home page, built as one instrument: faders on white,
 * the readout on black. On a phone the readout comes first, so the number sits above the
 * thumb while the faders are worked one-handed below it.
 */
export function MiniSip({ prompt }: { prompt: string }) {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const r = useMemo(() => sip(monthly, rate, years), [monthly, rate, years]);
  return (
    <div className="instrument surface-paper">
      <p className="instrument-label">{prompt}</p>
      <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="order-2 bg-white px-4 py-1 sm:px-5 md:order-1">
          <SliderField label="Monthly SIP" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} />
          <SliderField label="Expected return" value={rate} onChange={setRate} min={4} max={20} step={0.5} unit="pct" decimals={1} />
          <SliderField label="Years" value={years} onChange={setYears} min={1} max={30} step={1} unit="years" />
        </div>
        <div className="surface-ink order-1 flex flex-col justify-between gap-5 border-b border-rule bg-paper-2 p-4 sm:p-5 md:order-2 md:border-b-0 md:border-l">
          <div>
            <p className="kicker text-muted">Estimated value</p>
            <output className="readout mt-2 text-[2rem] sm:text-4xl">
              <LiveValue value={r.value} live />
            </output>
            <dl className="mt-3 grid grid-cols-2 border-t border-rule pt-2.5 text-sm tabular">
              <div>
                <dt className="flex items-center gap-2 text-xs text-muted">
                  <span aria-hidden className="inline-block size-2.5" style={{ background: INVESTED }} />
                  Invested
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatINRCompact(r.invested)}</dd>
              </div>
              <div className="border-l border-rule pl-3">
                <dt className="flex items-center gap-2 text-xs text-muted">
                  <span aria-hidden className="inline-block size-2.5" style={{ background: RETURNS }} />
                  Returns
                </dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatINRCompact(r.returns)}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Donut
              size={84}
              slices={[
                { name: "Invested", value: r.invested, color: INVESTED },
                { name: "Returns", value: r.returns, color: RETURNS },
              ]}
            />
            <Link prefetch={false} href="/calculators/sip-calculator/" className="btn ml-auto">
              Full SIP calculator <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
