"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { ArticleCard } from "@/lib/content";
import { kickerColor } from "../kicker";
import { StoryRow } from "../story";
import { Pagination } from "./paginated-stories";

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

  return (
    <div ref={top} className="scroll-mt-20">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter by topic">
        {["All", ...topics.filter((t) => counts[t])].map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={topic === t}
            onClick={() => {
              setTopic(t);
              setPage(1);
              sync(t, 1);
            }}
            className={`shrink-0 border px-3.5 py-1.5 text-sm font-semibold ${topic === t ? "border-navy bg-navy text-white" : `border-rule bg-white hover:border-navy/50 ${t === "All" ? "" : kickerColor(t)}`}`}
          >
            {t}
            <span className={`ml-1.5 font-normal ${topic === t ? "text-white/70" : "text-muted"}`}>{t === "All" ? stories.length : counts[t]}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)} of {filtered.length} stories
        {topic !== "All" ? ` in ${topic}` : ""}
      </p>
      <div className="mt-1 divide-y divide-rule">
        {shown.map((s) => (
          <StoryRow key={s.slug} story={s} standfirst />
        ))}
      </div>
      <Pagination
        page={current}
        total={total}
        onChange={(p) => {
          setPage(p);
          sync(topic, p);
          top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </div>
  );
}
