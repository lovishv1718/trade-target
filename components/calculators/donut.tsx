import { formatINR } from "@/lib/format";

export type Slice = { name: string; value: number; color: string };

// A circle with r = 15.9155 has a circumference of 100, so dash lengths are percentages.
const R = 15.9155;

/** Lightweight SVG donut; slices animate through a CSS transition on the dash array. */
export function Donut({ slices, centerLabel, centerValue, size = 190 }: { slices: Slice[]; centerLabel?: string; centerValue?: string; size?: number }) {
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
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label={data.map((s) => `${s.name} ${formatINR(s.value)}`).join(", ")}>
        <circle cx="21" cy="21" r={R} fill="none" stroke="#ece7de" strokeWidth="6" />
        {arcs.map((a) => (
          <circle
            key={a.name}
            cx="21"
            cy="21"
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth="6"
            strokeDasharray={`${a.dash} ${100 - a.dash}`}
            strokeDashoffset={25 - a.start}
            style={{ transition: "stroke-dasharray 450ms ease, stroke-dashoffset 450ms ease" }}
          >
            <title>{`${a.name}: ${formatINR(a.value)}`}</title>
          </circle>
        ))}
      </svg>
      {centerLabel ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-muted">{centerLabel}</span>
          <span className="headline text-lg">{centerValue}</span>
        </div>
      ) : null}
    </div>
  );
}

export function DonutWithLegend({ slices, centerLabel, centerValue }: { slices: Slice[]; centerLabel?: string; centerValue?: string }) {
  const total = slices.reduce((s, x) => s + Math.max(x.value, 0), 0) || 1;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <Donut slices={slices} centerLabel={centerLabel} centerValue={centerValue} />
      <ul className="w-full space-y-2.5">
        {slices.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-3 w-3" style={{ background: s.color }} />
              {s.name}
            </span>
            <span className="text-right">
              <span className="font-semibold tabular">{formatINR(s.value)}</span>
              <span className="ml-2 text-xs text-muted">{((Math.max(s.value, 0) / total) * 100).toFixed(1)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
