"use client";

import { useRef, useState } from "react";
import type { ArticleCard } from "@/lib/content";
import { StoryRow } from "../story";

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (current > 3) out.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) out.push(p);
  if (current < total - 2) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const btn = "flex h-10 min-w-10 items-center justify-center border px-3 text-sm font-semibold";
  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center gap-1.5">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className={`${btn} border-rule bg-white disabled:opacity-40`}>
        ← Newer
      </button>
      {pageList(page, total).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={`${btn} ${p === page ? "border-navy bg-navy text-white" : "border-rule bg-white hover:border-navy/50"}`}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" disabled={page === total} onClick={() => onChange(page + 1)} className={`${btn} border-rule bg-white disabled:opacity-40`}>
        Older →
      </button>
    </nav>
  );
}

/** Story list with client-side pagination. */
export function PaginatedStories({ stories, perPage = 8 }: { stories: ArticleCard[]; perPage?: number }) {
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);
  const total = Math.ceil(stories.length / perPage);
  const shown = stories.slice((page - 1) * perPage, page * perPage);
  return (
    <div ref={top} className="scroll-mt-20">
      <div className="divide-y divide-rule">
        {shown.map((s) => (
          <StoryRow key={s.slug} story={s} standfirst />
        ))}
      </div>
      <Pagination
        page={page}
        total={total}
        onChange={(p) => {
          setPage(p);
          top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </div>
  );
}
