"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAxisINR, formatINR } from "@/lib/format";

type SeriesDef = { key: string; name: string; color: string };

// SVG attributes cannot read CSS variables, so the palette is literal hex:
// grid = rule, axis = rule-strong, ticks = muted, labels = ink-2.
const GRID = "#dbe3ee";
const AXIS = "#bccadc";
const TICK = "#586a85";
const LABEL = "#2b3b55";

// Animation stays off: easing a whole series on every slider step reads as jitter.
// The donut and the result figure carry the motion instead.
const HEIGHT = "h-75 w-full md:h-85";
const MARGIN = { top: 8, right: 12, left: 4, bottom: 0 };
const axisProps = { tick: { fontSize: 12, fill: TICK }, tickLine: false };
const xAxisLine = { stroke: AXIS };
const tooltipProps = {
  contentStyle: { fontSize: 14, borderRadius: 10, border: `1px solid ${GRID}`, background: "#ffffff", padding: "8px 10px", boxShadow: "none" },
  labelStyle: { color: "#0b1b33", fontWeight: 600, marginBottom: 4 },
  itemStyle: { padding: 0 },
};
const legendProps = {
  iconSize: 10,
  wrapperStyle: { fontSize: 12, paddingTop: 8 },
  formatter: (value: string) => <span style={{ color: LABEL }}>{value}</span>,
};

/** Stacked area, e.g. invested amount underneath returns. */
export function StackedArea({ data, xKey, series, xLabel = (v: number | string) => `Yr ${v}` }: { data: Record<string, number>[]; xKey: string; series: SeriesDef[]; xLabel?: (v: number | string) => string }) {
  return (
    <div className={HEIGHT}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={MARGIN}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} axisLine={xAxisLine} tickFormatter={xLabel} minTickGap={16} />
          <YAxis {...axisProps} axisLine={false} width={64} tickFormatter={formatAxisINR} />
          <Tooltip cursor={{ stroke: AXIS }} labelFormatter={(v) => xLabel(v as number)} formatter={(v, n) => [formatINR(Number(v)), n]} {...tooltipProps} />
          <Legend {...legendProps} />
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stackId="1" stroke={s.color} fill={s.color} fillOpacity={0.9} strokeWidth={1.5} legendType="square" isAnimationActive={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Stacked bars per year, e.g. principal and interest paid. */
export function StackedBars({ data, xKey, series, xLabel = (v: number | string) => `Yr ${v}` }: { data: Record<string, number>[]; xKey: string; series: SeriesDef[]; xLabel?: (v: number | string) => string }) {
  return (
    <div className={HEIGHT}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={MARGIN}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} axisLine={xAxisLine} tickFormatter={xLabel} minTickGap={8} />
          <YAxis {...axisProps} axisLine={false} width={64} tickFormatter={formatAxisINR} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} labelFormatter={(v) => xLabel(v as number)} formatter={(v, n) => [formatINR(Number(v)), n]} {...tooltipProps} />
          <Legend {...legendProps} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} maxBarSize={36} legendType="square" isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Line comparison, e.g. two scenarios or old vs new regime. */
export function Lines({ data, xKey, series, xLabel = (v: number | string) => `Yr ${v}`, yFormat = formatAxisINR }: { data: Record<string, number>[]; xKey: string; series: (SeriesDef & { dashed?: boolean })[]; xLabel?: (v: number | string) => string; yFormat?: (v: number) => string }) {
  return (
    <div className={HEIGHT}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={MARGIN}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} axisLine={xAxisLine} tickFormatter={xLabel} minTickGap={16} />
          <YAxis {...axisProps} axisLine={false} width={64} tickFormatter={yFormat} />
          <Tooltip cursor={{ stroke: AXIS }} labelFormatter={(v) => xLabel(v as number)} formatter={(v, n) => [formatINR(Number(v)), n]} {...tooltipProps} />
          <Legend {...legendProps} />
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? "6 4" : undefined} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
