"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo, logoWidth } from "../logo";
import { SearchTrigger } from "../search/search-trigger";

type NavItem = { label: string; href: string };
type MenuItem = NavItem & { children: NavItem[] };

const BAR_H = 44;
const MARK_H = 24;
// The slot is always reserved, so revealing the mark never moves the nav items
const MARK_SLOT = logoWidth(MARK_H, "mark") + 12;

/** Tighter padding at lg so all eight sections fit beside the mark at 1024. Bar item: white/80 at rest, white on hover with a faint bar, white with a 3px white bar when current. */
function barItem(on: boolean) {
  return `relative flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 text-sm font-semibold focus-visible:-outline-offset-2 after:absolute after:inset-x-3 after:bottom-0 lg:px-2 lg:after:inset-x-2 xl:px-3 xl:after:inset-x-3 after:h-0.75 ${
    on ? "text-white after:bg-white" : "text-white/80 hover:text-white hover:after:bg-white/40"
  }`;
}

export function MainNav({ items, menu }: { items: NavItem[]; menu: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
    <nav aria-label="Main" className="sticky top-0 z-40">
      <div className="surface-ink">
        <div className="wrap flex h-11 items-stretch">
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
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label="Open menu"
            className="relative -ml-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 px-2 text-sm font-semibold text-white focus-visible:-outline-offset-2 after:absolute after:inset-x-2 after:bottom-0 after:h-0.75 hover:after:bg-white/40 sm:ml-0 xl:pr-3"
          >
            <svg aria-hidden width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
              <rect width="18" height="2" />
              <rect y="6" width="18" height="2" />
              <rect y="12" width="18" height="2" />
            </svg>
            <span className="sr-only xl:not-sr-only">Menu</span>
          </button>
          <span aria-hidden className="my-3 w-px shrink-0 bg-rule" />
          <Link prefetch={false} href="/" aria-current={pathname === "/" ? "page" : undefined} className={barItem(pathname === "/")}>
            Home
          </Link>
          <ul className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto">
            {items.map((item) => (
              <li key={item.href} className="flex">
                <Link prefetch={false} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={barItem(!!active(item.href))}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="-mr-3.5 flex shrink-0 items-center border-l border-rule md:hidden">
            <SearchTrigger variant="icon" />
          </div>
        </div>
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
          className={`relative flex h-full w-[min(360px,88vw)] flex-col bg-white text-ink shadow-overlay transition-transform duration-200 ease-out ${
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
              className="flex min-h-11 min-w-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-muted hover:text-ink"
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
                  className={`flex min-h-11 items-center text-base font-semibold underline-offset-4 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2 ${
                    active(m.href) ? "text-ink" : "text-ink-2"
                  }`}
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
                          className="flex min-h-9 items-center py-1 text-sm leading-snug text-muted underline-offset-4 hover:text-ink hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-ink pointer-coarse:min-h-11"
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
