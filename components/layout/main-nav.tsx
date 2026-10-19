"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Logo, logoWidth } from "../logo";
import { SearchTrigger } from "../search/search-trigger";
import { MegaPanel, type MegaIpo, type MegaPanelData } from "./mega-menu";

type NavItem = { label: string; href: string };
type MenuItem = NavItem & { children: NavItem[] };

// The bar is a 56px pill floating 8px below the top edge
const BAR_H = 64;
const MARK_H = 24;
// The slot is always reserved, so revealing the mark never moves the nav items
const MARK_SLOT = logoWidth(MARK_H, "mark") + 12;
// Hover intent: a pointer passing over the bar does not flash a panel open
const OPEN_DELAY = 140;
const CLOSE_DELAY = 180;


export function MainNav({
  items,
  menu,
  mega,
  ipos,
  buildDate,
}: {
  items: NavItem[];
  menu: MenuItem[];
  mega: Record<string, MegaPanelData>;
  ipos: MegaIpo[];
  buildDate: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Mega menu: which section is open, and the last one shown so its content stays put while fading out
  const [megaKey, setMegaKey] = useState<string | null>(null);
  const [shownKey, setShownKey] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Record<string, HTMLAnchorElement | null>>({});
  const timer = useRef<number | null>(null);
  const pointer = useRef<string>("mouse");

  const clearTimer = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };
  const showMega = useCallback((key: string | null) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setMegaKey(key);
    if (key) setShownKey(key);
  }, []);
  const closeMega = useCallback(
    (focusTrigger = false) => {
      const key = megaKey;
      showMega(null);
      if (focusTrigger && key) triggers.current[key]?.focus();
    },
    [megaKey, showMega],
  );
  // Keyboard opening moves focus into the panel once it has rendered and is no longer inert
  const wantsFocus = useRef(false);
  const focusIntoPanel = () => {
    wantsFocus.current = true;
  };
  useEffect(() => {
    if (!megaKey || !wantsFocus.current) return;
    wantsFocus.current = false;
    megaRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
  }, [megaKey]);

  // Close on navigation (adjusted during render, not in an effect), on a tap or click outside the nav, and on Escape
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    setMegaKey(null);
  }
  useEffect(() => {
    if (!megaKey) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) showMega(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMega(navRef.current?.contains(document.activeElement) ?? false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaKey, showMega, closeMega]);
  useEffect(() => () => clearTimer(), []);
  const [stuck, setStuck] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) menuButton.current?.focus();
  }, []);

  // Reveal the bull mark once the masthead has gone under the bar
  useEffect(() => {
    const masthead = document.getElementById("masthead");
    if (!masthead || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { rootMargin: `-${BAR_H}px 0px 0px 0px` });
    io.observe(masthead);
    return () => io.disconnect();
  }, []);

  // Drawer: focus moves in, Tab stays inside, Esc closes and focus returns to the Menu button
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="sticky top-0 z-40"
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onKeyDown={() => (pointer.current = "keyboard")}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse" || !megaKey) return clearTimer();
        clearTimer();
        timer.current = window.setTimeout(() => showMega(null), CLOSE_DELAY);
      }}
      onBlur={(e) => {
        if (megaKey && !e.currentTarget.contains(e.relatedTarget as Node | null)) showMega(null);
      }}
    >
      <div className="wrap pt-2">
        <div className="hdr-nav glass flex h-14 items-stretch gap-0.5 rounded-2xl px-3">
          <div
            inert={!stuck}
            className={`hidden shrink-0 items-center transition-[opacity,translate] duration-200 ease-out sm:flex ${
              stuck ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0"
            }`}
            style={{ width: MARK_SLOT }}
          >
            <Logo variant="mark" inverse height={MARK_H} />
          </div>
          <button
            ref={menuButton}
            type="button"
            onClick={() => {
              showMega(null);
              setOpen(true);
            }}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label="Open menu"
            className="nav-item min-w-11 justify-center gap-2 rounded-xl px-2.5 text-ink"
          >
            <svg aria-hidden width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 2h20M1 8h20M1 14h13" />
            </svg>
            <span className="sr-only">Menu</span>
          </button>
          <span aria-hidden className="mx-1 my-4 w-px shrink-0 bg-rule-strong" />
          <Link
            prefetch={false}
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="nav-item gap-2"
            onPointerEnter={(e) => e.pointerType === "mouse" && megaKey && showMega(null)}
          >
            <svg aria-hidden width="17" height="16" viewBox="0 0 17 16" fill="currentColor" className="hidden sm:block">
              <path d="M8.5.6a1 1 0 0 1 .66.25l7 6.1a.8.8 0 0 1-.52 1.4H14.5V15a1 1 0 0 1-1 1h-3v-4.5h-4V16h-3a1 1 0 0 1-1-1V8.35H1.36A.8.8 0 0 1 .84 6.95l7-6.1A1 1 0 0 1 8.5.6z" />
            </svg>
            Home
          </Link>
          <ul className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto">
            {items.map((item) => {
              const panel = mega[item.href];
              const expanded = megaKey === item.href;
              return (
                <li
                  key={item.href}
                  className="relative flex"
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    clearTimer();
                    if (!panel) return megaKey ? showMega(null) : undefined;
                    // Once a panel is open, moving along the bar switches at once
                    if (megaKey) return showMega(item.href);
                    timer.current = window.setTimeout(() => showMega(item.href), OPEN_DELAY);
                  }}
                >
                  <Link
                    ref={(el) => {
                      triggers.current[item.href] = el;
                    }}
                    prefetch={false}
                    href={item.href}
                    aria-current={active(item.href) ? "page" : undefined}
                    className="nav-item"
                    data-open={expanded || undefined}
                    onClick={(e) => {
                      // Touch: the first tap opens the panel; a second tap on the same item follows the link
                      if (panel && (pointer.current === "touch" || pointer.current === "pen") && !expanded) {
                        e.preventDefault();
                        showMega(item.href);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (panel && e.key === "ArrowDown") {
                        e.preventDefault();
                        showMega(item.href);
                        focusIntoPanel();
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                  {panel ? (
                    // Keyboard route into the panel; only visible while focused, positioned so it never moves the bar
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls="mega-panel"
                      aria-label={`${item.label} menu`}
                      onClick={() => {
                        if (expanded) return showMega(null);
                        showMega(item.href);
                        focusIntoPanel();
                      }}
                      className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-1 focus-visible:right-0 focus-visible:z-10 focus-visible:flex focus-visible:size-5 focus-visible:items-center focus-visible:justify-center focus-visible:bg-white focus-visible:text-black"
                    >
                      <svg aria-hidden width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M1 1l4 4 4-4" />
                      </svg>
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="flex shrink-0 items-center md:hidden">
            <SearchTrigger variant="icon" />
          </div>
        </div>
      </div>

      {/* Mega menu: lies over the page below the bar, so opening it never moves anything */}
      <div
        id="mega-panel"
        ref={megaRef}
        role="region"
        aria-label={shownKey ? `${mega[shownKey]?.title} menu` : "Section menu"}
        inert={!megaKey}
        onPointerEnter={clearTimer}
        onKeyDown={(e) => {
          if (e.key !== "Tab" || !megaKey) return;
          // Tab out of either end returns to the bar instead of dropping into the page
          // Only controls that are actually shown (the touch-only Close button is hidden on desktop)
          const links = Array.from(megaRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []).filter((el) => el.offsetParent !== null);
          if (!links.length) return;
          const trigger = triggers.current[megaKey];
          if (e.shiftKey && document.activeElement === links[0]) {
            e.preventDefault();
            trigger?.focus();
          } else if (!e.shiftKey && document.activeElement === links[links.length - 1]) {
            e.preventDefault();
            const order = items.map((i) => i.href);
            const next = triggers.current[order[order.indexOf(megaKey) + 1]];
            showMega(null);
            (next ?? trigger)?.focus();
          }
        }}
        className={`absolute inset-x-0 top-full mx-auto mt-2 max-h-[calc(100dvh-5rem)] w-[calc(100%-2rem)] max-w-[calc(1240px-3rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white bg-white/95 text-ink shadow-overlay backdrop-blur-xl transition-[opacity,translate,visibility] duration-150 ease-out motion-reduce:transition-none md:w-[calc(100%-3rem)] ${
          megaKey ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
        }`}
      >
        {shownKey && mega[shownKey] ? (
          <div className="border-t-[3px] border-(--rule-color)" style={{ "--rule-color": mega[shownKey].rule } as CSSProperties}>
            <MegaPanel data={mega[shownKey]} ipos={ipos} buildDate={buildDate} onNavigate={() => showMega(null)} />
            <div className="wrap flex justify-end pb-3 pointer-fine:hidden">
              <button type="button" onClick={() => closeMega(false)} className="btn btn-text btn-sm">
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Always mounted so it can animate both ways; hidden and inert while closed */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        className={`fixed inset-0 z-50 flex ${open ? "visible" : "invisible transition-[visibility] duration-200"}`}
      >
        <div
          aria-hidden
          onClick={() => close()}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ease-out ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          ref={panel}
          className={`relative flex h-full w-[min(360px,88vw)] flex-col rounded-r-2xl bg-white text-ink shadow-overlay transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-rule py-3 pl-5 pr-2">
            {/* The logo navigates home, so the drawer closes with it */}
            <div onClick={() => close(false)}>
              <Logo height={36} />
            </div>
            <button
              ref={closeButton}
              type="button"
              onClick={() => close()}
              aria-label="Close menu"
              className="btn btn-text"
            >
              Close
              <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>
          </div>
          <ul className="flex-1 divide-y divide-rule overflow-y-auto overscroll-contain px-5 pb-8">
            {menu.map((m) => (
              <li key={m.href} className="py-2">
                <Link
                  prefetch={false}
                  href={m.href}
                  onClick={() => close(false)}
                  aria-current={pathname === m.href ? "page" : undefined}
                  className={`link-quiet flex min-h-11 items-center text-base font-semibold ${active(m.href) ? "text-ink" : "text-ink-2"}`}
                >
                  {m.label}
                </Link>
                {m.children.length ? (
                  <ul className="grid grid-cols-2 gap-x-4 pb-2">
                    {m.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          prefetch={false}
                          href={c.href}
                          onClick={() => close(false)}
                          aria-current={pathname === c.href ? "page" : undefined}
                          className="link-soft flex min-h-9 items-center py-1 text-sm leading-snug aria-[current=page]:font-semibold pointer-coarse:min-h-11"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
