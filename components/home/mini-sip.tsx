"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sip } from "@/lib/calc/investing";
import { Donut } from "../calculators/donut";
import { LiveValue, SliderField, SplitBar } from "../calculators/kit";

// Literal palette values: SVG strokes take them as attributes
const INVESTED = "#ffffff";
const RETURNS = "#22d1a8";

/** The values under a fader's five tick marks: min, the quartiles and max, each on the step. */
const stops = (min: number, max: number, step: number) => Array.from(new Set([0, 0.25, 0.5, 0.75, 1].map((q) => Number((min + Math.round((q * (max - min)) / step) * step).toFixed(6)))));

const RATE_STOPS = stops(4, 20, 0.5);
const YEAR_STOPS = stops(1, 30, 1);

/**
 * Compact live SIP calculator for the home page, built as one instrument: a label strip, faders
 * on white, the readout on a recessed dark panel. On a phone the readout comes first and pins
 * under the nav while the faders are worked below it; the donut and the way on follow the faders.
 * From md the dark panel takes the right column: readout at the top, donut and button below.
 */
export function MiniSip({ prompt }: { prompt: string }) {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const r = useMemo(() => sip(monthly, rate, years), [monthly, rate, years]);
  return (
    <div className="instrument surface-paper">
      <p className="instrument-label">{prompt}</p>
      <div className="cx-mini-grid">
        <div className="cx-mini-faders bg-white px-4 py-1 sm:px-5">
          <SliderField label="Monthly SIP" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} />
          <SliderField label="Expected return" value={rate} onChange={setRate} min={4} max={20} step={0.5} unit="pct" decimals={1} presets={RATE_STOPS} />
          <SliderField label="Years" value={years} onChange={setYears} min={1} max={30} step={1} unit="years" presets={YEAR_STOPS} />
        </div>
        <div className="surface-ink cx-mini-readout bg-paper-2">
          <p className="kicker text-muted">Estimated value</p>
          <output className="cx-figure mt-1 md:mt-2">
            <LiveValue value={r.value} live />
          </output>
          <SplitBar
            split={[
              { label: "Invested", value: r.invested, color: INVESTED },
              { label: "Returns", value: r.returns, color: RETURNS },
            ]}
          />
        </div>
        <div className="surface-ink cx-mini-foot bg-paper-2">
          <Donut
            size={148}
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
  );
}
