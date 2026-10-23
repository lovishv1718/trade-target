"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ArticleImage } from "@/lib/content";
import { Photo } from "../photo";

type Item = { title: string; path: string; readTime: number };
type Feature = Item & { kicker: string; summary: string; date: string; dateLabel: string; image: ArticleImage | null };
export type LearnGroup = { name: string; href: string; items: Item[]; feature: Feature };

/**
 * Learn: the section's sets of explainers as an accordion, one open at a time, with the open set's
 * lead story beside it. Opening another set brings its own lead into the card.
 */
export function LearnAccordion({ groups, intro }: { groups: LearnGroup[]; intro: ReactNode }) {
  const [open, setOpen] = useState(0);
  const f = groups[open].feature;
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
      <div>
        {intro}
        <div className="mt-10 border-t border-rule">
          {groups.map((g, i) => (
            <div key={g.href} className="border-b border-rule">
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={`learn-${i}`} onClick={() => setOpen(i)} className="hm-acc-btn px-1 md:px-5">
                  {g.name}
                  <span className="hm-acc-sign" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d={open === i ? "M2 8h12" : "M2 8h12M8 2v12"} />
                    </svg>
                  </span>
                </button>
              </h3>
              <ul id={`learn-${i}`} hidden={open !== i} className="px-1 pb-3 md:px-5">
                {g.items.map((it) => (
                  <li key={it.path} className="border-t border-rule">
                    <Link prefetch={false} href={it.path} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-4">
                      <span className="text-[0.9375rem] leading-snug text-ink group-hover:text-accent">{it.title}</span>
                      <span className="flex items-center gap-3">
                        <span className="pm-meta">{it.readTime} min</span>
                        <span className="pm-arrow text-accent-bright" aria-hidden>
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <article className="group self-start border border-rule bg-white" aria-live="polite">
        <Link prefetch={false} href={f.path} className="block">
          <Photo image={f.image} sizes="(min-width: 1024px) 640px, 100vw" crop="standard" />
          <div className="px-6 pb-7 pt-7 md:px-9">
            <p className="hm-label">{f.kicker}</p>
            <h3 className="mt-4 font-serif text-[1.875rem] leading-[1.1] tracking-[-0.02em] text-ink group-hover:text-accent md:text-[2.25rem]">{f.title}</h3>
            <p className="hm-quote mt-6 line-clamp-3">{f.summary}</p>
            <div className="mt-6 flex items-center justify-between gap-6">
              <p className="pm-meta">
                <time dateTime={f.date}>{f.dateLabel}</time> · {f.readTime} min read
              </p>
              <span className="hm-round" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 11h15M12 5l6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </article>
    </div>
  );
}
