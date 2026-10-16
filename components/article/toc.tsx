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

  const list = (
    <ol className="space-y-0.5">
      {headings.map((h, i) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={`flex gap-2 border-l-2 py-1.5 pl-3 text-[0.9rem] leading-snug ${
              active === h.id ? "border-accent font-semibold text-ink" : "border-transparent text-muted hover:border-rule hover:text-ink"
            } ${h.level === 3 ? "pl-6" : ""}`}
          >
            {variant === "rail" && h.level === 2 ? <span className="tabular text-ink/35">{String(i + 1).padStart(2, "0")}</span> : null}
            <span>{h.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="group border border-rule bg-white lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold">
          In this article
          <span aria-hidden className="text-accent-ink transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="border-t border-rule px-2 py-2">{list}</div>
      </details>
    );
  }
  return (
    <nav aria-label="In this article">
      <p className="kicker mb-2 text-muted">In this article</p>
      {list}
    </nav>
  );
}
