"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/format";

const PALETTE = ["#10284a", "#d9480f", "#0c7c8c", "#f2b233", "#1c5fb8", "#7a8699"];

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

  return (
    <figure className="not-prose border border-rule bg-white p-3 pt-4 md:p-5">
      <div className="h-[280px] w-full md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#ece7de" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5a6475" }} tickLine={false} axisLine={{ stroke: "#d8d1c4" }} />
              <YAxis tick={{ fontSize: 12, fill: "#5a6475" }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => (isPct ? `${v}%` : fmt(v))} />
              <Tooltip formatter={(v) => (isPct ? `${fmt(Number(v))}%` : fmt(Number(v)))} contentStyle={{ fontSize: 13, borderColor: "#e3ddd2" }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              {keys.map((k, i) => (
                <Line key={k} type="monotone" dataKey={k} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2.5} dot={{ r: 3.5 }} isAnimationActive={false} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} layout={type === "share" ? "vertical" : "horizontal"}>
              <CartesianGrid stroke="#ece7de" vertical={type === "share"} horizontal={type !== "share"} />
              {type === "share" ? (
                <>
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#5a6475" }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#5a6475" }} width={80} axisLine={false} tickLine={false} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5a6475" }} tickLine={false} axisLine={{ stroke: "#d8d1c4" }} interval={0} />
                  <YAxis tick={{ fontSize: 12, fill: "#5a6475" }} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => (isPct ? `${v}%` : fmt(v))} />
                </>
              )}
              <Tooltip cursor={{ fill: "rgba(16,40,74,0.06)" }} formatter={(v) => (isPct ? `${fmt(Number(v))}%` : fmt(Number(v)))} contentStyle={{ fontSize: 13, borderColor: "#e3ddd2" }} />
              {!single ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
              {keys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} maxBarSize={56} isAnimationActive={false}>
                  {single && hasNegative
                    ? data.map((d, j) => <Cell key={j} fill={Number(d[k]) < 0 ? "#c3282c" : "#10284a"} />)
                    : null}
                </Bar>
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-xs text-muted">Chart data as published in the original article.</figcaption>
    </figure>
  );
}
