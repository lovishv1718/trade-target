"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Marks an element `data-seen` the first time it comes into view, then stops watching.
 * The attribute is set directly, so nothing re-renders; CSS decides what "seen" means.
 */
export function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-seen", "");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.setAttribute("data-seen", "");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Draws its contents in once, with a quick left-to-right wipe (transform only), when first seen. */
export function Wipe({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useSeen<HTMLSpanElement>();
  return (
    <span ref={ref} className={`wipe ${className}`}>
      <span className="wipe-inner">{children}</span>
    </span>
  );
}
