"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { amountInWords, formatINR, formatINRCompact, formatNumber } from "@/lib/format";

// ---------------------------------------------------------------------------
// Live numbers
// A result changes in place: tabular figures, never wrapping, so the new value replaces the old
// one without counting through the numbers in between and without moving anything around it.

export function LiveValue({ value, format = "inr", decimals = 0, className = "", live = false }: { value: number; format?: "inr" | "pct" | "num"; decimals?: number; className?: string; live?: boolean }) {
  const text = format === "inr" ? formatINR(value, decimals) : format === "pct" ? `${value.toFixed(decimals || 2)}%` : formatNumber(value, decimals);
  return (
    <span className={`tabular whitespace-nowrap ${className}`} aria-live={live ? "polite" : undefined}>
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

/** A value with its unit, short form: the fader's end labels, the tag riding the cap, the presets. */
function short(n: number, unit: Unit, decimals: number, compact = false) {
  if (unit === "inr") return compact ? formatINRCompact(n) : formatINR(n);
  const s = display(n, unit, decimals);
  if (unit === "pct") return `${s}%`;
  if (unit === "years") return `${s} ${n === 1 ? "yr" : "yrs"}`;
  if (unit === "months") return `${s} mo`;
  return s;
}

/** A value with its unit as it is said: the out-of-range message. */
function spoken(n: number, unit: Unit, decimals: number) {
  if (unit === "inr") return `₹${amountInWords(n)}`;
  const s = formatNumber(n, Number.isInteger(n) ? 0 : decimals);
  if (unit === "pct") return `${s}%`;
  if (unit === "years") return `${s} ${n === 1 ? "year" : "years"}`;
  if (unit === "months") return `${s} ${n === 1 ? "month" : "months"}`;
  return s;
}

/**
 * One control, not two: the label, the number box and the fader share a single frame, and focus
 * on either rings the whole unit. The fader is drawn (track, a fill scaled by --ratio, ticks at
 * the quartiles, a slim cap) under a transparent native range, so keyboard, touch and assistive
 * tech all get the real control. The unit carries its state as data attributes: data-at at
 * either end of the scale, data-drag while a pointer holds the cap (the value rides on a tag
 * above it), data-invalid while a typed number sits outside the scale.
 */
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
  presets,
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
  /** Quick values shown as quiet chips under the fader; only values inside min..max are used. */
  presets?: number[];
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const [draft, setDraft] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const v = clamp(value, min, max);
  const ratio = max > min ? (v - min) / (max - min) : 0;
  const at = value <= min ? "min" : value >= max ? "max" : undefined;
  const suffix = unit === "pct" ? "%" : unit === "years" ? (value === 1 ? "yr" : "yrs") : unit === "months" ? "mo" : "";

  // A drag ends wherever the pointer is let go, not only over the fader
  useEffect(() => {
    if (!drag) return;
    const end = () => setDrag(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [drag]);

  const parse = (raw: string) => Number(raw.replace(/[^0-9.]/g, ""));
  const commit = (raw: string) => {
    const n = parse(raw);
    if (Number.isFinite(n) && raw.trim() !== "") onChange(clamp(Number(n.toFixed(decimals)), min, max));
    setDraft(null);
  };

  // While a typed number sits outside the scale, say so, and say where it will land on blur
  const typed = draft !== null && draft.trim() !== "" ? Number(parse(draft).toFixed(decimals)) : NaN;
  const invalid = Number.isFinite(typed) && (typed < min || typed > max);
  const message = invalid ? `Between ${spoken(min, unit, decimals)} and ${spoken(max, unit, decimals)}. It will be set to ${spoken(typed < min ? min : max, unit, decimals)}.` : null;

  const words =
    unit === "inr" ? amountInWords(value) : unit === "years" ? `${value} ${value === 1 ? "year" : "years"}` : unit === "months" ? `${value} months${value >= 12 ? ` (${(value / 12).toFixed(value % 12 ? 1 : 0)} yrs)` : ""}` : null;
  const end = (n: number) => (unit === "inr" ? `₹${amountInWords(n)}` : short(n, unit, decimals));
  const quick = (presets ?? []).filter((p) => p >= min && p <= max);

  return (
    <div className="cx-field">
      <div
        className="cx-unit"
        data-at={at}
        data-drag={drag ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={{ ["--ratio" as string]: ratio }}
      >
        <div className="cx-unit-head">
          <label htmlFor={id} className="cx-unit-label">
            {label}
          </label>
          <div className="cx-num">
            {unit === "inr" ? <span className="cx-num-affix">₹</span> : null}
            <input
              id={id}
              inputMode="decimal"
              disabled={disabled}
              aria-invalid={invalid || undefined}
              aria-describedby={hint ? `${hintId} ${errId}` : errId}
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
              className="cx-num-input"
            />
            {suffix ? <span className="cx-num-affix">{suffix}</span> : null}
          </div>
        </div>
        {/* The fader: the native range sits on top, transparent; everything under it is drawn */}
        <div className="cx-fader">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={v}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            onPointerDown={() => {
              if (!disabled) setDrag(true);
            }}
            onBlur={() => setDrag(false)}
            aria-label={`${label} slider`}
            aria-valuetext={unit === "inr" ? `₹${formatNumber(value)}` : `${value}${suffix ? ` ${suffix}` : ""}`}
            className="cx-range"
          />
          <span aria-hidden className="cx-rail">
            <span className="cx-track">
              <span className="cx-fill" />
            </span>
            <span className="cx-ticks">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="cx-stop cx-stop-min" />
            <span className="cx-stop cx-stop-max" />
            <span className="cx-thumb" />
            <span className="cx-tag">{short(v, unit, decimals)}</span>
          </span>
        </div>
        <div className="cx-scale">
          <span className="cx-end cx-end-min">{end(min)}</span>
          <span className="cx-words">{words ? (unit === "inr" ? `₹${words}` : words) : null}</span>
          <span className="cx-end cx-end-max">{end(max)}</span>
        </div>
        {quick.length ? (
          <div role="group" aria-label={`${label}: quick values`} className="cx-presets">
            {quick.map((p) => (
              <button key={p} type="button" aria-pressed={value === p} disabled={disabled} onClick={() => onChange(p)} className="cx-preset">
                {short(p, unit, decimals, true)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div id={errId} aria-live="polite">
        {message ? <p className="cx-error">{message}</p> : null}
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
      <div role="radiogroup" aria-label={label} className="calc-seg mt-2.5">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className="chip">
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
 * One instrument: inputs on a frosted card and the readout on a navy card. From lg the
 * results column sits beside the inputs and sticks. Below lg the results column and panel
 * dissolve (display: contents), and the navy readout moves to the top of the block (CSS order)
 * and pins under the nav, compact, so the number stays in view while the inputs below it are
 * worked, and nothing is left behind where it would otherwise have sat.
 */
export function CalcLayout({ inputs, results }: { inputs: ReactNode; results: ReactNode }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
      <div className="glass px-4 py-1 md:px-6">{inputs}</div>
      <div className="max-lg:contents lg:sticky lg:top-20">{results}</div>
    </div>
  );
}

export type SplitPart = { label: string; value: number; color: string };

/**
 * A single proportion bar: each part's share drawn with transform, so it eases as the inputs move,
 * and under it each part's label, rupee value and share. Compact (a thin bar, small type) while
 * the readout is pinned on a phone; full size from lg in a ResultPanel and from md in MiniSip.
 */
export function SplitBar({ split, className = "" }: { split: SplitPart[]; className?: string }) {
  const parts = split.map((s) => ({ ...s, v: Math.max(s.value, 0) }));
  const total = parts.reduce((a, p) => a + p.v, 0) || 1;
  const segs = parts.map((p, i) => ({ ...p, start: parts.slice(0, i).reduce((a, q) => a + q.v, 0) / total, frac: p.v / total }));
  return (
    <div className={`cx-split ${className}`}>
      <div aria-hidden className="cx-split-bar">
        {segs.map((s) => (
          <span key={s.label} className="cx-split-seg" style={{ background: s.color, transform: `translateX(${s.start * 100}%) scaleX(${s.frac})` }} />
        ))}
        {segs.slice(1).map((s) => (
          <span key={`cut-${s.label}`} className="cx-split-cut" style={{ transform: `translateX(${s.start * 100}%)` }}>
            <i />
          </span>
        ))}
      </div>
      <dl className="cx-split-legend" style={{ gridTemplateColumns: `repeat(${segs.length}, minmax(0, 1fr))` }}>
        {segs.map((s) => (
          <div key={s.label} className="cx-split-item">
            <dt className="cx-split-label">
              <span aria-hidden className="cx-swatch" style={{ background: s.color }} />
              <span className="cx-split-name">{s.label}</span>
            </dt>
            <dd className="cx-split-value">
              <span className="cx-split-amt">{formatINRCompact(s.value)}</span>
              <span className="cx-split-pct">{(s.frac * 100).toFixed(1)}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ResultPanel({
  label,
  value,
  format = "inr",
  decimals = 0,
  sub,
  children,
  split,
}: {
  label: string;
  value: number;
  format?: "inr" | "pct" | "num";
  decimals?: number;
  sub?: ReactNode;
  children?: ReactNode;
  /** Parts of the result (invested and returns, say), drawn as one proportion bar under the number. */
  split?: SplitPart[];
}) {
  return (
    <div className="max-lg:contents">
      <div className="surface-ink cx-readout">
        <p className="kicker text-muted">{label}</p>
        <p className="cx-figure mt-1 lg:mt-2">
          <LiveValue value={value} format={format} decimals={decimals} live />
        </p>
        {split && split.length ? <SplitBar split={split} /> : null}
        {sub ? <div className="cx-readout-sub">{sub}</div> : null}
      </div>
      {children ? <div className="glass px-4 py-5 md:px-6 lg:mt-4">{children}</div> : null}
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
            <LiveValue value={r.value} format={r.format ?? "inr"} decimals={r.decimals ?? 0} />
            {r.suffix ? <span className="ml-1 text-sm font-normal text-muted">{r.suffix}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A section of the calculator page: the site's section header in the calculators colour, without the pin. */
export function CalcSection({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="mt-12 md:mt-14">
      <div className="section-head items-center" style={{ ["--rule-color" as string]: "var(--color-learn)" }}>
        <h2 className="section-title">{title}</h2>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Insight({ children }: { children: ReactNode }) {
  return <p className="note max-w-3xl text-md leading-relaxed">{children}</p>;
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
export const COLORS = { invested: "#d2c9b8", returns: "#0f4d36", interest: "#c8402f", other: "#a8834f", muted: "#cbbfab" };
