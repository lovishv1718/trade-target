"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { amountInWords, formatINR, formatNumber } from "@/lib/format";

// ---------------------------------------------------------------------------
// Animated numbers
// A result eases to its new value in at most 240ms (ease-out), so a change reads
// as movement from the old figure. Under reduced motion it jumps straight there.

function useAnimatedNumber(target: number, duration = 240) {
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
  disabled = false,
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
  disabled?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
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
    <div className="calc-field py-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-md font-semibold leading-snug text-ink">
          {label}
        </label>
        <div className="calc-num shrink-0">
          {unit === "inr" ? <span className="calc-num-affix">₹</span> : null}
          <input
            id={id}
            inputMode="decimal"
            disabled={disabled}
            aria-describedby={hint ? hintId : undefined}
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
            className="calc-num-input"
          />
          {suffix ? <span className="calc-num-affix">{suffix}</span> : null}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        aria-valuetext={unit === "inr" ? `₹${formatNumber(value)}` : `${value}${suffix ? ` ${suffix}` : ""}`}
        className="calc-range mt-1"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
      <div className="flex justify-between gap-2 text-xs text-muted tabular">
        <span>{unit === "inr" ? `₹${amountInWords(min)}` : `${min}${suffix && ` ${suffix}`}`}</span>
        {words ? <span className="text-center font-semibold text-ink-2">{unit === "inr" ? `₹${words}` : words}</span> : null}
        <span className="text-right">{unit === "inr" ? `₹${amountInWords(max)}` : `${max}${suffix && ` ${suffix}`}`}</span>
      </div>
      {hint ? (
        <p id={hintId} className="mt-2 text-xs leading-normal text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="calc-field py-4">
      <p className="text-md font-semibold leading-snug text-ink">{label}</p>
      <div role="radiogroup" aria-label={label} className="calc-seg mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className="chip aria-checked:border-ink aria-checked:bg-ink aria-checked:text-paper">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange, description, disabled = false }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string; disabled?: boolean }) {
  return (
    <label className="calc-toggle flex min-h-11 items-center justify-between gap-4 py-3.5">
      <span>
        <span className="block text-md font-semibold leading-snug text-ink">{label}</span>
        {description ? <span className="mt-0.5 block text-sm leading-normal text-muted">{description}</span> : null}
      </span>
      <span className="calc-switch">
        <input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="calc-switch-input sr-only" />
        <span aria-hidden className="calc-switch-track" />
        <span aria-hidden className="calc-switch-thumb" />
      </span>
    </label>
  );
}

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <div className="calc-field py-4">
      <label htmlFor={id} className="block text-md font-semibold leading-snug text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field mt-2 font-semibold">
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

/**
 * Inputs beside the result on wide screens, the result column sticky.
 * Below lg the result column and panel dissolve (display: contents) so the black
 * result band becomes a grid item that sticks to the bottom of the screen while
 * the inputs scroll past: the number stays in view, under the thumb, while dragging.
 */
export function CalcLayout({ inputs, results }: { inputs: ReactNode; results: ReactNode }) {
  return (
    <div className="grid items-start lg:grid-cols-2 lg:gap-x-6 xl:gap-x-8">
      <div className="border border-rule bg-white px-4 py-1 md:px-6">{inputs}</div>
      <div className="max-lg:contents lg:sticky lg:top-16">{results}</div>
    </div>
  );
}

export function ResultPanel({ label, value, format = "inr", decimals = 0, sub, children }: { label: string; value: number; format?: "inr" | "pct" | "num"; decimals?: number; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="max-lg:contents">
      <div className="surface-ink z-10 px-4 py-4 max-lg:sticky max-lg:bottom-0 max-lg:z-[45] md:px-6 lg:py-5">
        <p className="text-sm font-semibold leading-snug text-muted">{label}</p>
        <p className="mt-1.5 text-4xl font-semibold leading-none text-ink lg:text-5xl">
          <AnimatedValue value={value} format={format} decimals={decimals} />
        </p>
        {sub ? <div className="mt-2 text-sm leading-normal text-ink-2">{sub}</div> : null}
      </div>
      {children ? <div className="border border-t-0 border-rule bg-white px-4 py-5 md:px-6">{children}</div> : null}
    </div>
  );
}

export function StatRows({ rows }: { rows: { label: string; value: number; format?: "inr" | "pct" | "num"; decimals?: number; swatch?: string; strong?: boolean; suffix?: string }[] }) {
  return (
    <dl className="divide-y divide-rule">
      {rows.map((r) => (
        <div key={r.label} className="flex min-h-11 items-center justify-between gap-3 py-2">
          <dt className={`flex items-center gap-2 text-sm leading-snug ${r.strong ? "font-semibold text-ink" : "text-ink-2"}`}>
            {r.swatch ? <span aria-hidden className="inline-block h-2.5 w-2.5 shrink-0" style={{ background: r.swatch }} /> : null}
            {r.label}
          </dt>
          <dd className={`shrink-0 text-right text-ink ${r.strong ? "text-lg font-bold" : "text-md font-semibold"}`}>
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
    <section className="mt-12 md:mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-ink pt-3">
        <h2 className="headline text-xl md:text-2xl">{title}</h2>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Insight({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl border-l-2 border-ink bg-white px-4 py-3 text-md leading-relaxed text-ink-2">{children}</p>;
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
  const tableId = useId();
  const shown = expanded ? rows : rows.slice(0, initial);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted tabular">
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
          className="btn btn-secondary btn-sm"
        >
          <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M7 1v8M3.5 5.5L7 9l3.5-3.5M1.5 12.5h11" />
          </svg>
          Download as CSV
        </button>
      </div>
      {/* Scrolls sideways on narrow screens; focusable so the keyboard can scroll it too */}
      <div id={tableId} className="table-wrap" role="region" aria-label={`${unitLabel[0].toUpperCase()}${unitLabel.slice(1)}-by-${unitLabel} breakdown`} tabIndex={0}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={c.label} scope="col" className={i === 0 ? "" : "text-right"}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i}>
                {columns.map((c, j) => (
                  <td key={c.label} className={`whitespace-nowrap tabular ${j === 0 ? "font-semibold text-ink" : "text-right"}`}>
                    {cell(c.value(r), c.format, c.decimals)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > initial ? (
        <button type="button" aria-expanded={expanded} aria-controls={tableId} onClick={() => setExpanded((e) => !e)} className="btn btn-secondary btn-block mt-3">
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
    <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
      <div>
        <p className="kicker text-muted">Formula</p>
        <div className="mt-2 overflow-x-auto border border-rule bg-white px-4 py-4 font-serif text-xl italic text-ink md:px-5">{formula}</div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm leading-normal">
          {legend.map(([sym, desc]) => (
            <div key={sym} className="contents">
              <dt className="font-serif font-semibold italic text-ink">{sym}</dt>
              <dd className="text-ink-2">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <p className="kicker text-learn">With your numbers</p>
        <ol className="mt-2 divide-y divide-rule border-y border-rule">
          {steps.map((s) => (
            <li key={s.label} className="py-2.5">
              <span className="block text-sm leading-snug text-muted">{s.label}</span>
              <span className="mt-0.5 block overflow-x-auto whitespace-nowrap text-md font-semibold text-ink tabular">{s.expr}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export const inr = (n: number) => formatINR(n);
/** Chart and swatch colours (literal hex: SVG attributes cannot read CSS variables). */
export const COLORS = { invested: "#000000", returns: "#d99a12", interest: "#5a37a3", other: "#0b6676", muted: "#c8c0b0" };
