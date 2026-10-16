"use client";

import { useEffect, useRef } from "react";

/**
 * Thin progress rule fixed to the top of the viewport, filled by how far the reader
 * is through the element with `targetId`. Transform only (scaleX), one write per frame.
 * White with difference blending reads as ink on paper and stays visible over the black nav.
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
      className="pointer-events-none fixed left-0 top-0 z-[45] h-[3px] w-full origin-left bg-white mix-blend-difference transition-transform duration-100 ease-out will-change-transform motion-reduce:transition-none print:hidden"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
