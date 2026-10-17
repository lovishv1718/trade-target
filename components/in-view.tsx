"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders `children` only once the placeholder is near the viewport, so heavy chart code loads on
 * demand. The placeholder is the designed lazy slot (globals.css): a still frame of axes at the
 * chart's exact size, labelled, never a shimmer.
 */
export function InView({ children, placeholderClass, margin = "300px", label = "Chart" }: { children: ReactNode; placeholderClass: string; margin?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: margin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);
  if (visible) return <>{children}</>;
  // A calm, still block that reserves the chart's height: no shimmer or looping animation, hidden from assistive tech.
  const calm = placeholderClass
    .split(/\s+/)
    .filter((c) => c && !/(^|:)animate-/.test(c))
    .join(" ");
  return <div ref={ref} aria-hidden="true" data-placeholder="" data-label={label} className={`lazy-slot ${calm}`} />;
}
