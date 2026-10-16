"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const show = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) returnTo.current = document.activeElement;
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
      returnTo.current?.focus({ preventScroll: true });
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

  // Keep Tab and Shift+Tab inside the dialog; Esc closes from anywhere in it.
  const onPanelKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled])");
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-3 pt-[6vh] transition-opacity duration-200 ease-out starting:opacity-0 motion-reduce:transition-none md:px-6 md:pt-[12vh]"
      onClick={close}
    >
      <div
        ref={panelRef}
        onKeyDown={onPanelKey}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[86vh] w-full max-w-2xl flex-col border border-ink bg-paper shadow-overlay transition-[opacity,transform] duration-200 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none md:max-h-[76vh]"
      >
        <div className="flex items-center gap-2 border-b border-rule p-3 md:gap-3 md:p-4">
          <div className="relative min-w-0 flex-1">
            <svg aria-hidden width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink">
              <circle cx="7" cy="7" r="5.2" />
              <path d="M11 11l3.8 3.8" strokeLinecap="square" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
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
              autoComplete="off"
              enterKeyHint="search"
              className="field mt-0 h-12 pl-10 text-lg md:h-14 md:pl-11 md:text-xl"
            />
          </div>
          <button type="button" onClick={close} aria-label="Close search" className="btn btn-tertiary min-h-11 min-w-11 shrink-0 gap-2 px-2 no-underline">
            <kbd aria-hidden className="hidden border border-rule-strong px-1.5 font-sans text-2xs font-semibold leading-5 text-muted sm:inline-block">
              Esc
            </kbd>
            <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l10 10M13 3L3 13" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 md:px-4">
          {!query.trim() ? (
            <div className="px-1">
              <h2 className="kicker text-muted">Trending searches</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {trending.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} onClick={close} className="tag bg-white text-sm pointer-coarse:min-h-11 pointer-coarse:px-3">
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : docs === null ? (
            <p role="status" className="px-1 py-8 text-sm text-muted">
              Loading…
            </p>
          ) : grouped.length === 0 ? (
            <div role="status" className="px-1 py-8">
              <p className="headline text-lg">No results for “{query}”.</p>
              <p className="mt-1 text-sm text-ink-2">Try a company name, a scheme or a calculator.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map((g) => (
                <section key={g.type} aria-labelledby={`srch-${g.type}`}>
                  <h2 id={`srch-${g.type}`} className="kicker border-b border-rule px-1 pb-1.5 text-muted">
                    {g.title}
                  </h2>
                  <ul>
                    {g.items.map((item) => {
                      const i = flat.indexOf(item);
                      const active = i === cursor;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            onMouseEnter={() => setCursor(i)}
                            data-active={active || undefined}
                            className="flex min-h-11 items-baseline justify-between gap-4 border-b border-l-2 border-b-rule border-l-transparent px-2.5 py-2.5 data-active:border-l-ink data-active:bg-paper-2"
                          >
                            <span className="headline text-base leading-snug">{item.title}</span>
                            <span className="shrink-0 text-xs text-muted">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
