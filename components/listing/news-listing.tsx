"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { ArticleCard } from "@/lib/content";
import { StoryRow } from "../story";
import { Stagger } from "./stagger";
import { Pagination, scrollToList } from "./paginated-stories";

const PER_PAGE = 8;

export function NewsListing({ stories, topics }: { stories: ArticleCard[]; topics: string[] }) {
  const params = useSearchParams();
  const initialTopic = params.get("topic");
  const [topic, setTopic] = useState<string>(initialTopic && topics.includes(initialTopic) ? initialTopic : "All");
  const [page, setPage] = useState(Math.max(Number(params.get("page")) || 1, 1));
  const top = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => Object.fromEntries(topics.map((t) => [t, stories.filter((s) => s.kicker === t).length])), [stories, topics]);
  const filtered = topic === "All" ? stories : stories.filter((s) => s.kicker === topic);
  const total = Math.max(Math.ceil(filtered.length / PER_PAGE), 1);
  const current = Math.min(page, total);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const sync = (t: string, p: number) => {
    const q = new URLSearchParams();
    if (t !== "All") q.set("topic", t);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const choose = (t: string) => {
    setTopic(t);
    setPage(1);
    sync(t, 1);
  };

  return (
    <div ref={top} className="scroll-mt-20">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" aria-label="Filter by topic">
        {["All", ...topics.filter((t) => counts[t])].map((t) => {
          const on = topic === t;
          return (
            <button key={t} type="button" aria-pressed={on} onClick={() => choose(t)} className="chip shrink-0">
              {t}
              <span className="chip-count">{t === "All" ? stories.length : counts[t]}</span>
            </button>
          );
        })}
      </div>

      {filtered.length ? (
        <>
          <p aria-live="polite" className="tabular mt-4 border-b border-ink pb-2 text-sm text-muted">
            Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)} of {filtered.length} stories
            {topic !== "All" ? (
              <>
                {" "}
                in <span className="font-semibold text-ink-2">{topic}</span>
              </>
            ) : null}
          </p>
          <Stagger className="divide-y divide-rule">
            {shown.map((s) => (
              <StoryRow key={s.slug} story={s} standfirst />
            ))}
          </Stagger>
        </>
      ) : (
        <div role="status" className="empty mt-4">
          <p className="empty-title">No stories in this topic yet</p>
          <p className="empty-text">{topic !== "All" ? `Nothing filed under ${topic} so far.` : "Nothing has been filed here so far."}</p>
          {topic !== "All" ? (
            <button type="button" onClick={() => choose("All")} className="btn btn-secondary btn-sm mt-4">
              Show all stories
            </button>
          ) : null}
        </div>
      )}

      <Pagination
        page={current}
        total={total}
        onChange={(p) => {
          setPage(p);
          sync(topic, p);
          scrollToList(top.current);
        }}
      />
    </div>
  );
}
