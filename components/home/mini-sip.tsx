"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sip } from "@/lib/calc/investing";
import { formatINRCompact } from "@/lib/format";
import { Donut } from "../calculators/donut";
import { AnimatedValue, COLORS, SliderField } from "../calculators/kit";

/** Compact live SIP calculator for the home page. */
export function MiniSip() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const r = useMemo(() => sip(monthly, rate, years), [monthly, rate, years]);
  return (
    <div className="grid border border-rule bg-white md:grid-cols-[1.15fr_1fr]">
      <div className="px-5 py-2">
        <SliderField label="Monthly SIP" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} />
        <SliderField label="Expected return" value={rate} onChange={setRate} min={4} max={20} step={0.5} unit="pct" decimals={1} />
        <SliderField label="Years" value={years} onChange={setYears} min={1} max={30} step={1} unit="years" />
      </div>
      <div className="flex flex-col justify-between bg-navy p-5 text-white">
        <div>
          <p className="text-sm text-white/70">Estimated value</p>
          <p className="font-serif text-[2.3rem] font-semibold leading-none">
            <AnimatedValue value={r.value} />
          </p>
          <p className="mt-2 text-sm text-white/70">
            {formatINRCompact(r.invested)} invested, {formatINRCompact(r.returns)} returns
          </p>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Donut
            size={92}
            slices={[
              { name: "Invested", value: r.invested, color: "#ffffff" },
              { name: "Returns", value: r.returns, color: COLORS.returns },
            ]}
          />
          <Link href="/calculators/sip-calculator/" className="ml-auto bg-accent-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700">
            Full SIP calculator →
          </Link>
        </div>
      </div>
    </div>
  );
}
