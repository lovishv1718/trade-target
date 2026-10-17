"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

export function TableOfContents({ headings, variant }: { headings: Heading[]; variant: "rail" | "inline" }) {
  const active = useActiveHeading(headings.map((h) => h.id));
  if (headings.length < 2) return null;

  const rail = variant === "rail";
  // Number top-level sections only, so h3s don't leave gaps in the count
  const nums = headings.map((h, i) => (h.level === 2 ? String(headings.slice(0, i + 1).filter((x) => x.level === 2).length).padStart(2, "0") : null));
  const list = (
    <ol className="border-l border-rule">
      {headings.map((h, i) => {
        const on = active === h.id;
        const num = nums[i];
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={on ? "location" : undefined}
              className={`-ml-px flex gap-2.5 border-l-2 pr-2 leading-snug ${rail ? "py-1.5 text-sm" : "min-h-11 items-center py-2 text-md"} ${
                h.level === 3 ? "pl-7" : "pl-3"
              } ${on ? "border-ink text-ink" : "border-transparent text-muted hover:border-rule-strong hover:text-ink"}`}
            >
              {rail && num ? <span className={`tabular w-5 shrink-0 ${on ? "text-ink" : "text-faint"}`}>{num}</span> : null}
              <span className="min-w-0">{h.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="art-disclosure group border-y border-rule lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 [&::-webkit-details-marker]:hidden">
          <span className="kicker text-ink">In this article</span>
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 14 14"
            className="shrink-0 text-ink transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none"
          >
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </summary>
        <div className="art-disclosure-body pb-3">{list}</div>
      </details>
    );
  }
  return (
    <nav aria-label="In this article">
      <p className="kicker mb-3 text-ink">In this article</p>
      {list}
    </nav>
  );
}
