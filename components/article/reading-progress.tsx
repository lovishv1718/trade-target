"use client";

import { useEffect, useRef } from "react";

/**
 * Thin progress rule in the accent, fixed along the bottom edge of the sticky nav bar and filled
 * by how far the reader is through the element with `targetId`. Transform only (scaleX), one
 * write per frame.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const el = bar.current;
    if (!target || !el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? -rect.top / travel : rect.bottom <= window.innerHeight ? 1 : 0;
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div
      ref={bar}
      aria-hidden
      className="pointer-events-none fixed left-0 top-[calc(var(--nav-h)-1px)] z-[45] h-[2px] w-full origin-left bg-accent transition-transform duration-100 ease-out will-change-transform motion-reduce:transition-none print:hidden"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
