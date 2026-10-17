"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * A row of stories that does not fit: native horizontal scroll with snap (swipe on touch),
 * arrow buttons from tablet up, Left/Right keys when the row has focus, and a position rule
 * underneath that shows how much more there is. It never moves on its own.
 */
export function Scroller({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  // Before measuring, assume the row overflows: the controls are always rendered, so nothing shifts
  const [state, setState] = useState({ prev: false, next: true, size: 0.4, pos: 0 });

  const measure = useCallback(() => {
    frame.current = null;
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const size = el.scrollWidth ? el.clientWidth / el.scrollWidth : 1;
    setState({ prev: el.scrollLeft > 4, next: el.scrollLeft < max - 4, size, pos: max > 0 ? el.scrollLeft / max : 0 });
  }, []);

  const schedule = useCallback(() => {
    if (frame.current === null) frame.current = requestAnimationFrame(measure);
  }, [measure]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [schedule]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const by = first ? first.offsetWidth + gap : el.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * by, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={className}>
      <div
        ref={track}
        id={id}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={schedule}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-1 focus-visible:outline-offset-4 md:mx-0 md:scroll-px-0 md:px-0 lg:gap-6 [&>*]:shrink-0 [&>*]:snap-start"
      >
        {children}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {/* Position rule: the thumb's width is the share in view; it slides as the row scrolls */}
        <div aria-hidden className="relative h-px flex-1 bg-rule-strong">
          <div
            className="absolute -top-px left-0 h-0.75 bg-ink transition-transform duration-150 ease-out motion-reduce:transition-none"
            style={{ width: `${state.size * 100}%`, transform: `translateX(${state.pos * (1 / state.size - 1) * 100}%)` }}
          />
        </div>
        <div className="hidden shrink-0 gap-2 md:flex">
          <button type="button" className="btn btn-secondary btn-sm w-9 px-0 pointer-coarse:w-11" aria-controls={id} aria-label={`Scroll ${label} back`} disabled={!state.prev} onClick={() => step(-1)}>
            <svg aria-hidden width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M13 6H1.5M6 1L1 6l5 5" />
            </svg>
          </button>
          <button type="button" className="btn btn-secondary btn-sm w-9 px-0 pointer-coarse:w-11" aria-controls={id} aria-label={`Scroll ${label} forward`} disabled={!state.next} onClick={() => step(1)}>
            <svg aria-hidden width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M1 6h11.5M8 1l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
