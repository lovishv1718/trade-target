"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAxisINR, formatINR } from "@/lib/format";

type SeriesDef = { key: string; name: string; color: string };

const axisProps = { tick: { fontSize: 12, fill: "#5a6475" }, tickLine: false };

/** Stacked area, e.g. invested amount underneath returns. */
export function StackedArea({ data, xKey, series, xLabel = (v: number | string) => `Yr ${v}` }: { data: Record<string, number>[]; xKey: string; series: SeriesDef[]; xLabel?: (v: number | string) => string }) {
  return (
    <div className="h-[300px] w-full md:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="#ece7de" vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} axisLine={{ stroke: "#d8d1c4" }} tickFormatter={xLabel} minTickGap={16} />
          <YAxis {...axisProps} axisLine={false} width={64} tickFormatter={formatAxisINR} />
          <Tooltip labelFormatter={(v) => xLabel(v as number)} formatter={(v, n) => [formatINR(Number(v)), n]} contentStyle={{ fontSize: 13, borderColor: "#e3ddd2" }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stackId="1" stroke={s.color} fill={s.color} fillOpacity={0.85} strokeWidth={1.5} isAnimationActive={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Stacked bars per year, e.g. principal and interest paid. */
export function StackedBars({ data, xKey, series, xLabel = (v: number | string) => `Yr ${v}` }: { data: Record<string, number>[]; xKey: string; series: SeriesDef[]; xLabel?: (v: number | string) => string }) {
  return (
    <div className="h-[300px] w-full md:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="#ece7de" vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} axisLine={{ stroke: "#d8d1c4" }} tickFormatter={xLabel} minTickGap={8} />
          <YAxis {...axisProps} axisLine={false} width={64} tickFormatter={formatAxisINR} />
          <Tooltip cursor={{ fill: "rgba(16,40,74,0.05)" }} labelFormatter={(v) => xLabel(v as number)} formatter={(v, n) => [formatINR(Number(v)), n]} contentStyle={{ fontSize: 13, borderColor: "#e3ddd2" }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} maxBarSize={36} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Line comparison, e.g. two scenarios or old vs new regime. */
export function Lines({ data, xKey, series, xLabel = (v: number | string) => `Yr ${v}`, yFormat = formatAxisINR }: { data: Record<string, number>[]; xKey: string; series: (SeriesDef & { dashed?: boolean })[]; xLabel?: (v: number | string) => string; yFormat?: (v: number) => string }) {
  return (
    <div className="h-[300px] w-full md:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="#ece7de" vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} axisLine={{ stroke: "#d8d1c4" }} tickFormatter={xLabel} minTickGap={16} />
          <YAxis {...axisProps} axisLine={false} width={64} tickFormatter={yFormat} />
          <Tooltip labelFormatter={(v) => xLabel(v as number)} formatter={(v, n) => [formatINR(Number(v)), n]} contentStyle={{ fontSize: 13, borderColor: "#e3ddd2" }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} strokeDasharray={s.dashed ? "6 4" : undefined} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
