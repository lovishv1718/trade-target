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

/** Scroll a list back into view, without smooth scrolling for people who asked for less motion. */
export function scrollToList(el: HTMLElement | null) {
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

const pageBtn = "chip tabular min-h-11 min-w-11 px-3";

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-between gap-x-2 gap-y-3 border-t border-ink pt-5 sm:justify-start">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className={pageBtn}>
        <span aria-hidden>←</span> Newer
      </button>
      <ol className="order-first flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto">
        {pageList(page, total).map((p, i) =>
          p === "…" ? (
            <li key={`e${i}`} aria-hidden className="flex w-6 justify-center text-sm text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
                className={pageBtn}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <button type="button" disabled={page === total} onClick={() => onChange(page + 1)} className={pageBtn}>
        Older <span aria-hidden>→</span>
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
  if (!stories.length) {
    return (
      <div role="status" className="empty mt-4">
        <p className="empty-title">No stories here yet.</p>
      </div>
    );
  }
  return (
    <div ref={top} className="scroll-mt-20">
      {total > 1 ? (
        <p aria-live="polite" className="tabular mt-3 text-sm text-muted">
          Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, stories.length)} of {stories.length} stories
        </p>
      ) : null}
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
          scrollToList(top.current);
        }}
      />
    </div>
  );
}
