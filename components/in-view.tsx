"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Renders `children` only once the placeholder is near the viewport, so heavy chart code loads on demand. */
export function InView({ children, placeholderClass, margin = "300px" }: { children: ReactNode; placeholderClass: string; margin?: string }) {
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
  return <div ref={ref} aria-hidden className={placeholderClass} />;
}
