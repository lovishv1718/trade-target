"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** How long a tick's tint shows. Matches --duration-base and the dx-flash animation in data.css. */
const FLASH_MS = 180;

/**
 * A figure that updates in place. When `value` differs from the one it last rendered, the up or
 * down tint flashes behind it once (data-flash, drawn by .dx-tick::after in data.css). Never on
 * first render, so a still board stays still. The attribute is set on the element directly, so
 * the flash costs no re-render. `fit` lays the tint exactly over a boxed child, such as a change chip.
 */
export function TickValue({
  value,
  children,
  className = "",
  style,
  fit = false,
}: {
  value: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  fit?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    const before = prev.current;
    prev.current = value;
    const el = ref.current;
    if (!el || before === value || !Number.isFinite(before) || !Number.isFinite(value)) return;
    el.removeAttribute("data-flash");
    void el.offsetWidth; // restart the tint when a second tick lands mid-flash
    el.setAttribute("data-flash", value > before ? "up" : "down");
    const t = window.setTimeout(() => el.removeAttribute("data-flash"), FLASH_MS);
    return () => window.clearTimeout(t);
  }, [value]);

  return (
    <span ref={ref} className={`dx-tick${fit ? " dx-tick-fit" : ""} ${className}`} style={style}>
      {children}
    </span>
  );
}
