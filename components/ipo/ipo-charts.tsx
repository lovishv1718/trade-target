"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDayMonth } from "@/lib/format";
import type { Subscription } from "@/lib/ipo";

// Recharts attributes cannot read CSS variables, so token values are written out here.
const C = {
  grid: "#e0d7c8", // rule
  axis: "#cbbfab", // rule-strong
  tick: "#67635b", // muted
  zero: "#9c978d", // faint: reference rule only
  ink: "#1a1917",
  ipo: "#1a1917",
  cursor: "#efe9de", // paper-2
};
const TICK = { fontSize: 12, fill: C.tick };
const TOOLTIP = { fontSize: 12, border: `1px solid ${C.axis}`, borderRadius: 6, color: C.ink, background: "#fdfbf7" };

const LABELS: Record<keyof Subscription, string> = { qib: "QIB", nii: "NII", retail: "Retail", employee: "Employee", total: "Total" };

export function SubscriptionChart({ subscription }: { subscription: Subscription }) {
  const data = (Object.keys(LABELS) as (keyof Subscription)[])
    .filter((k) => subscription[k] !== null && subscription[k] !== undefined)
    .map((k) => ({ name: LABELS[k], value: subscription[k] as number, total: k === "total" }));
  return (
    <div className="h-[260px] w-full tabular">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={C.grid} horizontal={false} />
          <XAxis type="number" tick={TICK} axisLine={{ stroke: C.axis }} tickLine={false} tickFormatter={(v) => `${v}x`} />
          <YAxis type="category" dataKey="name" width={72} tick={{ ...TICK, fontWeight: 600 }} axisLine={{ stroke: C.axis }} tickLine={false} />
          <Tooltip cursor={{ fill: C.cursor }} formatter={(v) => [`${Number(v).toFixed(2)} times`, "Subscribed"]} contentStyle={TOOLTIP} />
          <Bar
            dataKey="value"
            maxBarSize={22}
            isAnimationActive={false}
            fill={C.ipo}
            shape={(props: { x?: number; y?: number; width?: number; height?: number; payload?: { total: boolean } }) => (
              <rect x={props.x} y={props.y} width={Math.max(props.width ?? 0, 0)} height={props.height} fill={props.payload?.total ? C.ink : C.ipo} />
            )}
          >
            <LabelList dataKey="value" position="right" formatter={(v) => `${Number(v).toFixed(2)}x`} style={{ fontSize: 12, fontWeight: 600, fill: C.ink }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GmpChart({ history }: { history: { date: string; gmp: number }[] }) {
  const data = history.map((h) => ({ ...h, label: formatDayMonth(h.date) }));
  return (
    <div className="h-[240px] w-full tabular">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={{ stroke: C.axis }} />
          <YAxis tick={TICK} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `₹${v}`} />
          <ReferenceLine y={0} stroke={C.zero} />
          <Tooltip cursor={{ stroke: C.axis }} formatter={(v) => [`₹${v}`, "GMP"]} contentStyle={TOOLTIP} />
          <Line type="linear" dataKey="gmp" stroke={C.ink} strokeWidth={2} dot={{ r: 3, fill: C.ink, stroke: C.ink }} activeDot={{ r: 4, fill: C.ipo, stroke: C.ipo }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
