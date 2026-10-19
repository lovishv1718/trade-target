"use client";

import { formatINR } from "@/lib/format";
import { useSeen } from "../reveal";

export type Slice = { name: string; value: number; color: string };

// A circle with r = 15.9155 has a circumference of 100, so dash lengths are percentages.
// The ring is 7.5 units thick in a 40-unit box: heavier than a hairline, still a ring.
const R = 15.9155;
const BOX = 40;
const C = BOX / 2;
const RING = 7.5;
const EASE = "240ms cubic-bezier(0.2, 0.7, 0.2, 1)";

/** Black or white, whichever reads better on a slice colour (WCAG luminance). Hex colours only. */
function textOn(color: string) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return undefined;
  const hex = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const lin = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const l = 0.2126 * lin(0) + 0.7152 * lin(2) + 0.0722 * lin(4);
  return l > 0.179 ? "#0b1b33" : "#ffffff";
}

const share = (p: number) => (p > 0 && p < 1 ? "<1%" : `${Math.round(p)}%`);

/**
 * Lightweight SVG donut. The first time it scrolls into view the arcs draw in from nothing;
 * after that each slice eases to its new size (240ms) as the inputs move. The ring is a token
 * colour, so it reads on paper and on black. From 140px up each slice carries its share in place,
 * set on the ring at the arc's midpoint; the label swings round with the arc (a rotation, so it
 * eases with it) and stays upright. A label that would not fit its arc steps out of the way.
 * The global reduced-motion rule removes all of the motion.
 */
export function Donut({ slices, centerLabel, centerValue, size = 190 }: { slices: Slice[]; centerLabel?: string; centerValue?: string; size?: number }) {
  const ref = useSeen<HTMLDivElement>();
  const data = slices.filter((s) => s.value > 0);
  const total = data.reduce((s, x) => s + x.value, 0) || 1;
  const gap = data.length > 1 ? 0.6 : 0;
  const pcts = data.map((s) => (s.value / total) * 100);
  const arcs = data.map((s, i) => {
    const dash = Math.max(pcts[i] - gap, 0);
    const start = pcts.slice(0, i).reduce((a, b) => a + b, 0);
    return { ...s, pct: pcts[i], dash, start, mid: start + dash / 2 };
  });
  const labelled = size >= 140 && data.length > 1;
  const ringPx = 2 * Math.PI * R * (size / BOX);
  const labelTop = `${((C - R) / BOX) * 100}%`;
  return (
    <div ref={ref} className="donut relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${BOX} ${BOX}`} width={size} height={size} role="img" aria-label={data.map((s, i) => `${s.name} ${formatINR(s.value)} (${pcts[i].toFixed(1)}%)`).join(", ")}>
        <circle className="donut-track" cx={C} cy={C} r={R} fill="none" strokeWidth={RING} />
        {arcs.map((a) => (
          <circle
            key={a.name}
            className="donut-arc"
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth={RING}
            strokeDasharray={`${a.dash} ${100 - a.dash}`}
            strokeDashoffset={25 - a.start}
            style={{ transition: `stroke-dasharray ${EASE}, stroke-dashoffset ${EASE}` }}
          >
            <title>{`${a.name}: ${formatINR(a.value)}`}</title>
          </circle>
        ))}
      </svg>
      {labelled
        ? arcs.map((a) => {
            const text = share(a.pct);
            const fits = (a.dash / 100) * ringPx >= text.length * 6.6 + 8;
            const deg = a.mid * 3.6;
            return (
              <span key={a.name} aria-hidden className="cx-donut-spoke" style={{ transform: `rotate(${deg}deg)` }}>
                <span className="cx-donut-label" data-hidden={fits ? undefined : ""} style={{ top: labelTop, color: textOn(a.color), transform: `translate(-50%, -50%) rotate(${-deg}deg)` }}>
                  {text}
                </span>
              </span>
            );
          })
        : null}
      {centerLabel ? (
        <div className="cx-donut-center">
          <span className="kicker text-muted">{centerLabel}</span>
          {centerValue ? <span className={`mt-0.5 font-semibold leading-tight text-ink tabular ${size >= 180 ? "text-xl" : "text-lg"}`}>{centerValue}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function DonutWithLegend({ slices, centerLabel, centerValue }: { slices: Slice[]; centerLabel?: string; centerValue?: string }) {
  const total = slices.reduce((s, x) => s + Math.max(x.value, 0), 0) || 1;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
      <Donut slices={slices} centerLabel={centerLabel} centerValue={centerValue} />
      <ul className="w-full divide-y divide-rule border-y border-rule">
        {slices.map((s) => (
          <li key={s.name} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm">
            <span className="flex items-center gap-2 leading-snug text-ink-2">
              <span aria-hidden className="cx-swatch size-3" style={{ background: s.color }} />
              {s.name}
            </span>
            <span className="shrink-0 whitespace-nowrap text-right tabular">
              <span className="font-semibold text-ink">{formatINR(s.value)}</span>
              <span className="ml-2 inline-block min-w-12 text-xs text-muted">{((Math.max(s.value, 0) / total) * 100).toFixed(1)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
