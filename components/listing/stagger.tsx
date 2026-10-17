"use client";

import type { ReactNode } from "react";
import { useSeen } from "../reveal";

/**
 * A news list whose rows arrive in sequence the first time it scrolls into view: each row rises
 * 12px as it fades in, 50ms after the one before, capped at the fifth row so a long list never
 * crawls. It plays once; rows added later (a new page, a new topic) simply appear.
 */
export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={`stagger ${className}`}>
      {children}
    </div>
  );
}

/** Marks a block `data-seen` once in view, for the one-off arrivals of the commercial and closing bands. */
export function Seen({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
