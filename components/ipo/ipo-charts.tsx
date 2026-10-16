"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDayMonth } from "@/lib/format";
import type { Subscription } from "@/lib/ipo";

const LABELS: Record<keyof Subscription, string> = { qib: "QIB", nii: "NII", retail: "Retail", employee: "Employee", total: "Total" };

export function SubscriptionChart({ subscription }: { subscription: Subscription }) {
  const data = (Object.keys(LABELS) as (keyof Subscription)[])
    .filter((k) => subscription[k] !== null && subscription[k] !== undefined)
    .map((k) => ({ name: LABELS[k], value: subscription[k] as number, total: k === "total" }));
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 4 }}>
          <CartesianGrid stroke="#ece7de" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: "#5a6475" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
          <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 13, fill: "#17202d", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(16,40,74,0.05)" }} formatter={(v) => [`${Number(v).toFixed(2)} times`, "Subscribed"]} contentStyle={{ fontSize: 13, borderColor: "#e3ddd2" }} />
          <Bar dataKey="value" maxBarSize={26} isAnimationActive={false} fill="#1c5fb8" shape={(props: { x?: number; y?: number; width?: number; height?: number; payload?: { total: boolean } }) => (
            <rect x={props.x} y={props.y} width={Math.max(props.width ?? 0, 0)} height={props.height} fill={props.payload?.total ? "#10284a" : "#1c5fb8"} />
          )}>
            <LabelList dataKey="value" position="right" formatter={(v) => `${Number(v).toFixed(2)}x`} style={{ fontSize: 12, fontWeight: 600, fill: "#17202d" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GmpChart({ history }: { history: { date: string; gmp: number }[] }) {
  const data = history.map((h) => ({ ...h, label: formatDayMonth(h.date) }));
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gmpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c5fb8" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#1c5fb8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ece7de" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#5a6475" }} tickLine={false} axisLine={{ stroke: "#d8d1c4" }} />
          <YAxis tick={{ fontSize: 12, fill: "#5a6475" }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `₹${v}`} />
          <ReferenceLine y={0} stroke="#9aa3b2" />
          <Tooltip formatter={(v) => [`₹${v}`, "GMP"]} contentStyle={{ fontSize: 13, borderColor: "#e3ddd2" }} />
          <Area type="monotone" dataKey="gmp" stroke="#1c5fb8" strokeWidth={2.5} fill="url(#gmpFill)" dot={{ r: 3, fill: "#1c5fb8" }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
