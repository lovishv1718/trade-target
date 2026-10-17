"use client";

import { formatINR } from "@/lib/format";
import { useSeen } from "../reveal";

export type Slice = { name: string; value: number; color: string };

// A circle with r = 15.9155 has a circumference of 100, so dash lengths are percentages.
const R = 15.9155;
const EASE = "240ms cubic-bezier(0.2, 0.7, 0.2, 1)";

/**
 * Lightweight SVG donut. The first time it scrolls into view the arcs draw in from nothing;
 * after that each slice eases to its new size (240ms) as the inputs move. The ring is a token
 * colour, so it reads on paper and on black. The global reduced-motion rule removes both.
 */
export function Donut({ slices, centerLabel, centerValue, size = 190 }: { slices: Slice[]; centerLabel?: string; centerValue?: string; size?: number }) {
  const ref = useSeen<HTMLDivElement>();
  const data = slices.filter((s) => s.value > 0);
  const total = data.reduce((s, x) => s + x.value, 0) || 1;
  const gap = data.length > 1 ? 0.6 : 0;
  const pcts = data.map((s) => (s.value / total) * 100);
  const arcs = data.map((s, i) => ({
    ...s,
    dash: Math.max(pcts[i] - gap, 0),
    start: pcts.slice(0, i).reduce((a, b) => a + b, 0),
  }));
  return (
    <div ref={ref} className="donut relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label={data.map((s, i) => `${s.name} ${formatINR(s.value)} (${pcts[i].toFixed(1)}%)`).join(", ")}>
        <circle className="donut-track" cx="21" cy="21" r={R} fill="none" strokeWidth="6" />
        {arcs.map((a) => (
          <circle
            key={a.name}
            className="donut-arc"
            cx="21"
            cy="21"
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth="6"
            strokeDasharray={`${a.dash} ${100 - a.dash}`}
            strokeDashoffset={25 - a.start}
            style={{ transition: `stroke-dasharray ${EASE}, stroke-dashoffset ${EASE}` }}
          >
            <title>{`${a.name}: ${formatINR(a.value)}`}</title>
          </circle>
        ))}
      </svg>
      {centerLabel ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="kicker text-muted">{centerLabel}</span>
          {centerValue ? <span className="mt-0.5 text-xl font-semibold leading-tight text-ink tabular">{centerValue}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function DonutWithLegend({ slices, centerLabel, centerValue }: { slices: Slice[]; centerLabel?: string; centerValue?: string }) {
  const total = slices.reduce((s, x) => s + Math.max(x.value, 0), 0) || 1;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <Donut slices={slices} centerLabel={centerLabel} centerValue={centerValue} />
      <ul className="w-full divide-y divide-rule border-y border-rule">
        {slices.map((s) => (
          <li key={s.name} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm">
            <span className="flex items-center gap-2 leading-snug text-ink-2">
              <span aria-hidden className="inline-block h-3 w-3 shrink-0" style={{ background: s.color }} />
              {s.name}
            </span>
            <span className="shrink-0 text-right tabular">
              <span className="font-semibold text-ink">{formatINR(s.value)}</span>
              <span className="ml-2 inline-block min-w-12 text-xs text-muted">{((Math.max(s.value, 0) / total) * 100).toFixed(1)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
