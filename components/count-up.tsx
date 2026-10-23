"use client";

import { useEffect, useRef, useState } from "react";

const pad = (n: number, width: number) => String(n).padStart(width, "0");

/**
 * A figure that counts up from zero the first time it scrolls into view. The server renders the
 * final value, a figure already on screen when the page loads stays put, and under reduced motion
 * nothing moves.
 */
export function CountUp({ value, width = 2, duration = 900, className = "" }: { value: number; width?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) return;
    setShown(0);
    let frame = 0;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);
  return (
    <span ref={ref} className={`tabular ${className}`}>
      <span aria-hidden>{pad(shown, width)}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
