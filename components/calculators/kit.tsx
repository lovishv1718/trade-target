"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { amountInWords, formatINR, formatNumber } from "@/lib/format";

// ---------------------------------------------------------------------------
// Animated numbers

function useAnimatedNumber(target: number, duration = 450) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const frame = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const initial = from.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !Number.isFinite(target) || !Number.isFinite(initial)) {
      from.current = target;
      frame.current = requestAnimationFrame(() => setValue(target));
      return () => {
        if (frame.current) cancelAnimationFrame(frame.current);
      };
    }
    const step = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = initial + (target - initial) * eased;
      from.current = v;
      setValue(v);
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);
  return value;
}

export function AnimatedValue({ value, format = "inr", decimals = 0, className = "" }: { value: number; format?: "inr" | "pct" | "num"; decimals?: number; className?: string }) {
  const v = useAnimatedNumber(value);
  const text = format === "inr" ? formatINR(v, decimals) : format === "pct" ? `${v.toFixed(decimals || 2)}%` : formatNumber(v, decimals);
  return (
    <span className={`tabular ${className}`} aria-live="polite">
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inputs

type Unit = "inr" | "pct" | "years" | "months" | "none";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function display(value: number, unit: Unit, decimals: number) {
  if (unit === "inr") return formatNumber(value);
  return decimals ? value.toFixed(decimals).replace(/\.?0+$/, "") : String(value);
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "inr",
  decimals = 0,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: Unit;
  decimals?: number;
  hint?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;
  const suffix = unit === "pct" ? "%" : unit === "years" ? (value === 1 ? "yr" : "yrs") : unit === "months" ? "mo" : "";

  const commit = (raw: string) => {
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n) && raw.trim() !== "") onChange(clamp(Number(n.toFixed(decimals)), min, max));
    setDraft(null);
  };

  const words =
    unit === "inr" ? amountInWords(value) : unit === "years" ? `${value} ${value === 1 ? "year" : "years"}` : unit === "months" ? `${value} months${value >= 12 ? ` (${(value / 12).toFixed(value % 12 ? 1 : 0)} yrs)` : ""}` : null;

  return (
    <div className="py-3.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[0.95rem] font-semibold text-ink">
          {label}
        </label>
        <div className="flex items-center border border-rule bg-paper focus-within:border-navy">
          {unit === "inr" ? <span className="pl-2.5 text-muted">₹</span> : null}
          <input
            id={id}
            inputMode="decimal"
            value={draft ?? display(value, unit, decimals)}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => {
              setDraft(String(value));
              requestAnimationFrame(() => e.target.select());
            }}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="w-[7.5rem] bg-transparent px-2 py-1.5 text-right text-[1rem] font-semibold tabular outline-none"
          />
          {suffix ? <span className="pr-2.5 text-sm text-muted">{suffix}</span> : null}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        className="tt-range mt-3 w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
      <div className="mt-1 flex justify-between text-[0.75rem] text-muted">
        <span>{unit === "inr" ? `₹${amountInWords(min)}` : `${min}${suffix && ` ${suffix}`}`}</span>
        {words ? <span className="font-semibold text-accent-ink">{unit === "inr" ? `₹${words}` : words}</span> : null}
        <span>{unit === "inr" ? `₹${amountInWords(max)}` : `${max}${suffix && ` ${suffix}`}`}</span>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="py-3">
      <p className="text-[0.95rem] font-semibold">{label}</p>
      <div role="radiogroup" aria-label={label} className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`border px-3 py-1.5 text-sm font-semibold ${value === o.value ? "border-navy bg-navy text-white" : "border-rule bg-white hover:border-navy/50"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-[0.95rem] font-semibold">{label}</span>
        {description ? <span className="block text-xs text-muted">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 bg-rule transition-colors peer-checked:bg-navy peer-focus-visible:outline-2 peer-focus-visible:outline-accent" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <div className="py-3">
      <label htmlFor={id} className="text-[0.95rem] font-semibold">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 block w-full border border-rule bg-white px-3 py-2 text-[0.95rem] font-semibold outline-none focus:border-navy">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout

export function CalcLayout({ inputs, results }: { inputs: ReactNode; results: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-8">
      <div className="border border-rule bg-white px-5 py-2 md:px-6">{inputs}</div>
      <div className="lg:sticky lg:top-16">{results}</div>
    </div>
  );
}

export function ResultPanel({ label, value, format = "inr", decimals = 0, sub, children }: { label: string; value: number; format?: "inr" | "pct" | "num"; decimals?: number; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="bg-navy text-white">
      <div className="px-5 pb-5 pt-5 md:px-6">
        <p className="text-[0.9rem] font-semibold text-white/75">{label}</p>
        <p className="mt-1 font-serif text-[2.4rem] font-semibold leading-none md:text-[2.9rem]">
          <AnimatedValue value={value} format={format} decimals={decimals} />
        </p>
        {sub ? <div className="mt-2 text-sm text-white/75">{sub}</div> : null}
      </div>
      {children ? <div className="border-t border-white/10 bg-white px-5 py-4 text-ink md:px-6">{children}</div> : null}
    </div>
  );
}

export function StatRows({ rows }: { rows: { label: string; value: number; format?: "inr" | "pct" | "num"; decimals?: number; swatch?: string; strong?: boolean; suffix?: string }[] }) {
  return (
    <dl className="divide-y divide-rule">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3 py-2">
          <dt className="flex items-center gap-2 text-[0.92rem] text-muted">
            {r.swatch ? <span aria-hidden className="inline-block h-2.5 w-2.5" style={{ background: r.swatch }} /> : null}
            {r.label}
          </dt>
          <dd className={`text-right ${r.strong ? "text-[1.05rem] font-bold" : "font-semibold"}`}>
            <AnimatedValue value={r.value} format={r.format ?? "inr"} decimals={r.decimals ?? 0} />
            {r.suffix ? <span className="ml-1 text-sm font-normal text-muted">{r.suffix}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CalcSection({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-2">
        <h2 className="headline text-[1.45rem]">{title}</h2>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Insight({ children }: { children: ReactNode }) {
  return <p className="border-l-4 border-gold bg-white px-4 py-3 text-[0.95rem] leading-relaxed">{children}</p>;
}

// ---------------------------------------------------------------------------
// Breakdown table with CSV

export type Column<T> = { label: string; value: (row: T) => number | string; format?: "inr" | "num" | "pct" | "text"; decimals?: number };

function cell(v: number | string, format: Column<unknown>["format"], decimals = 0) {
  if (typeof v === "string") return v;
  if (format === "inr") return formatINR(v, decimals);
  if (format === "pct") return `${v.toFixed(decimals || 2)}%`;
  if (format === "num") return formatNumber(v, decimals);
  return String(v);
}

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : v;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function BreakdownTable<T>({ rows, columns, filename, initial = 6, unitLabel = "year" }: { rows: T[]; columns: Column<T>[]; filename: string; initial?: number; unitLabel?: string }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? rows : rows.slice(0, initial);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {rows.length} {unitLabel}
          {rows.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              filename,
              columns.map((c) => c.label),
              rows.map((r) => columns.map((c) => c.value(r))),
            )
          }
          className="inline-flex items-center gap-2 border border-navy px-3 py-1.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white"
        >
          <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M7 1v8M3.5 5.5L7 9l3.5-3.5M1.5 12.5h11" />
          </svg>
          Download as CSV
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={c.label} className={i === 0 ? "" : "text-right"}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i}>
                {columns.map((c, j) => (
                  <td key={c.label} className={j === 0 ? "font-semibold" : "text-right"}>
                    {cell(c.value(r), c.format, c.decimals)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > initial ? (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-3 w-full border border-rule bg-white py-2.5 text-sm font-semibold text-navy hover:border-navy">
          {expanded ? "Show fewer rows" : `Show all ${rows.length} ${unitLabel}s`}
        </button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formula block

export function Formula({ formula, legend, steps }: { formula: string; legend: [string, string][]; steps: { label: string; expr: string }[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="overflow-x-auto border border-rule bg-white px-5 py-4 font-serif text-[1.25rem] italic text-navy">{formula}</div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {legend.map(([sym, desc]) => (
            <div key={sym} className="contents">
              <dt className="font-serif font-semibold italic text-navy">{sym}</dt>
              <dd className="text-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="border-l-4 border-accent bg-white px-5 py-4">
        <p className="kicker text-accent-ink">With your numbers</p>
        <ol className="mt-2 space-y-2 text-[0.95rem]">
          {steps.map((s) => (
            <li key={s.label}>
              <span className="text-muted">{s.label}</span>
              <span className="block overflow-x-auto whitespace-nowrap font-semibold tabular">{s.expr}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export const inr = (n: number) => formatINR(n);
export const COLORS = { invested: "#10284a", returns: "#f2b233", interest: "#d9480f", other: "#0c7c8c", muted: "#c9c2b5" };
