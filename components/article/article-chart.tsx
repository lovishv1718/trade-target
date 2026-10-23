"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/format";

// Literal hex: Recharts attributes can't read CSS variables. Mirrors the site tokens.
const PALETTE = ["#121212", "#ee5622", "#a19c95", "#f4a07c", "#6b6762", "#e2d8ca"];
const GRID = "#ebe6df";
const AXIS = "#d8d1c7";
const TICK = { fontSize: 12, fill: "#6b6762" };
const UP = "#0f8048";
const DOWN = "#c83a2b";
const TOOLTIP = { fontSize: 14, border: "1px solid #ebe6df", borderRadius: 4, background: "#ffffff", color: "#121212", padding: "6px 10px" };
const LEGEND = { fontSize: 12, color: "#34322f", paddingTop: 8 };

/** Total height of the figure; the lazy placeholder reserves exactly this. */
export const CHART_FIGURE_CLASS = "h-[324px] md:h-[364px]";

type Series = { name: string; data: number[] };

function fmt(v: number) {
  const a = Math.abs(v);
  if (a >= 100000) return formatNumber(v);
  if (Number.isInteger(v)) return formatNumber(v);
  return v.toFixed(2);
}

/** Charts carried over from the original articles (Graphina widgets), drawn with the original data. */
export function ArticleChart({ type, categories, series }: { type: "bar" | "line" | "share"; categories: string[]; series: Series[] }) {
  const data = categories.map((c, i) => {
    const row: Record<string, number | string> = { name: c };
    series.forEach((s, j) => (row[s.name || `s${j}`] = s.data[i] ?? 0));
    return row;
  });
  const keys = series.map((s, j) => s.name || `s${j}`);
  const single = series.length === 1;
  const hasNegative = series.some((s) => s.data.some((d) => d < 0));
  const isPct = keys.some((k) => /%|growth|roe|roce|share/i.test(k)) || type === "share";

  const tickFmt = (v: number) => (isPct ? `${v}%` : fmt(v));
  const tipFmt = (v: unknown) => (isPct ? `${fmt(Number(v))}%` : fmt(Number(v)));

  return (
    <figure className={`art-chart not-prose flex w-full flex-col border-t border-ink pt-3 ${CHART_FIGURE_CLASS}`}>
      <div className="tabular min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={TICK} tickLine={false} axisLine={{ stroke: AXIS }} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} width={48} tickFormatter={tickFmt} />
              <Tooltip formatter={tipFmt} contentStyle={TOOLTIP} cursor={{ stroke: AXIS }} />
              <Legend wrapperStyle={LEGEND} iconType="plainline" />
              {keys.map((k, i) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: PALETTE[i % PALETTE.length] }}
                  activeDot={{ r: 4.5, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} layout={type === "share" ? "vertical" : "horizontal"}>
              <CartesianGrid stroke={GRID} vertical={type === "share"} horizontal={type !== "share"} />
              {type === "share" ? (
                <>
                  <XAxis type="number" tick={TICK} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={TICK} width={80} axisLine={{ stroke: AXIS }} tickLine={false} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={TICK} tickLine={false} axisLine={{ stroke: AXIS }} interval={0} />
                  <YAxis tick={TICK} tickLine={false} axisLine={false} width={56} tickFormatter={tickFmt} />
                </>
              )}
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} formatter={tipFmt} contentStyle={TOOLTIP} />
              {!single ? <Legend wrapperStyle={LEGEND} iconType="square" iconSize={10} /> : null}
              {keys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} maxBarSize={56} isAnimationActive={false}>
                  {single && hasNegative ? data.map((d, j) => <Cell key={j} fill={Number(d[k]) < 0 ? DOWN : UP} />) : null}
                </Bar>
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 shrink-0 text-xs leading-snug text-muted">Chart data as published in the original article.</figcaption>
    </figure>
  );
}
