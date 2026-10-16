"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchDocs, type SearchDoc } from "@/lib/search";
import { OPEN_SEARCH_EVENT } from "./search-trigger";

const GROUPS: { type: SearchDoc["type"]; title: string; limit: number }[] = [
  { type: "story", title: "Stories", limit: 7 },
  { type: "ipo", title: "IPOs", limit: 4 },
  { type: "calculator", title: "Calculators", limit: 4 },
];

let indexPromise: Promise<SearchDoc[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/search-index.json").then((r) => r.json());
  return indexPromise;
}

export function SearchOverlay({ trending }: { trending: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const show = useCallback(() => {
    setOpen(true);
    loadIndex().then(setDocs);
  }, []);

  useEffect(() => {
    const onOpen = () => show();
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable=true]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
      document.removeEventListener("keydown", onKey);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const grouped = useMemo(() => {
    if (!docs || !query.trim()) return [];
    const hits = searchDocs(docs, query);
    return GROUPS.map((g) => ({ ...g, items: hits.filter((h) => h.type === g.type).slice(0, g.limit) })).filter((g) => g.items.length);
  }, [docs, query]);
  const flat = grouped.flatMap((g) => g.items);

  const close = () => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-[60] flex items-start justify-center bg-navy-950/70 px-3 pt-[8vh] md:pt-[12vh]" onClick={close}>
      <div className="w-full max-w-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b-2 border-navy px-4">
          <svg aria-hidden width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-navy">
            <circle cx="7" cy="7" r="5.2" />
            <path d="M11 11l3.8 3.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, Math.max(flat.length - 1, 0)));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              }
              if (e.key === "Enter" && flat[cursor]) {
                router.push(flat[cursor].href);
                close();
              }
            }}
            type="search"
            placeholder="Search stories, IPOs and calculators"
            aria-label="Search"
            className="h-14 flex-1 bg-transparent text-lg outline-none placeholder:text-muted/70"
          />
          <button type="button" onClick={close} className="text-sm font-semibold text-muted hover:text-ink">
            Esc
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-4 py-3">
          {!query.trim() ? (
            <div>
              <p className="kicker text-muted">Trending searches</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {trending.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} onClick={close} className="inline-block border border-rule px-3 py-1.5 text-sm hover:border-navy hover:text-navy">
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : docs === null ? (
            <p className="py-6 text-center text-sm text-muted">Loading…</p>
          ) : grouped.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No results for “{query}”. Try a company name, a scheme or a calculator.</p>
          ) : (
            grouped.map((g) => (
              <section key={g.type} className="py-2">
                <h2 className="kicker text-muted">{g.title}</h2>
                <ul className="mt-1">
                  {g.items.map((item) => {
                    const i = flat.indexOf(item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          onMouseEnter={() => setCursor(i)}
                          className={`flex items-baseline justify-between gap-4 px-2 py-2 ${i === cursor ? "bg-paper-2" : ""}`}
                        >
                          <span className="headline text-[1.02rem] leading-snug">{item.title}</span>
                          <span className="shrink-0 text-xs text-muted">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
