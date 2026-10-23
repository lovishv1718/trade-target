"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoArt } from "../logo";
import { openSearch } from "../search/search-trigger";

type NavItem = { label: string; href: string };
type MenuItem = NavItem & { children: NavItem[] };

function SearchIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="7" cy="7" r="5.2" />
      <path d="M11 11l3.8 3.8" strokeLinecap="square" />
    </svg>
  );
}

/**
 * One bar, as a fashion house sets it: the menu and the mark on the left, the section links in
 * small capitals, search on an underline and Subscribe on the right. Search is the underlined
 * word from 1440px and an icon below it, never both; the links show from 1280px. The menu button
 * opens the full-screen menu at every width.
 */
export function SiteNav({ items, menu }: { items: NavItem[]; menu: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));
  const groups = menu.filter((m) => m.children.length);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) menuButton.current?.focus();
  }, []);

  // Menu: focus moves in, Tab stays inside, Esc closes and focus returns to the menu button
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
    <>
      <div className="pm-header">
        <nav aria-label="Main" className="wrap flex h-[4.5rem] items-center gap-3">
          <button ref={menuButton} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="site-menu" aria-label="Open menu" className="pm-icon-btn -ml-3">
            <svg aria-hidden width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0 1h22M0 9h22" />
            </svg>
          </button>
          <Link href="/" aria-label="TradeTarget home" className="flex shrink-0 items-center gap-2.5">
            <LogoArt variant="mark" height={22} eager alt="" />
            <span className="pm-wordmark">TradeTarget</span>
          </Link>
          <ul className="mx-auto hidden items-center xl:flex">
            {items.map((item) => (
              <li key={item.href}>
                <Link prefetch={false} href={item.href} aria-current={active(item.href) ? "page" : undefined} className="pm-nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex shrink-0 items-center gap-4 xl:ml-0">
            <button type="button" onClick={openSearch} className="tt-search hidden min-[1440px]:inline-flex">
              Search
              <SearchIcon />
            </button>
            <button type="button" onClick={openSearch} aria-label="Search stories, IPOs and calculators" className="pm-icon-btn min-[1440px]:hidden">
              <SearchIcon />
            </button>
            <Link prefetch={false} href="/#newsletter" className="btn hidden min-h-11 sm:inline-flex">
              Subscribe
            </Link>
          </div>
        </nav>
      </div>

      {/* The full-screen menu. Always mounted so it can fade both ways; hidden and inert while
          closed. Outside the frosted bar, whose backdrop filter would otherwise become its frame. */}
      <div
        id="site-menu"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        className={`fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-white text-ink transition-[opacity,visibility] duration-200 ease-out ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <div className="wrap flex h-[4.5rem] items-center gap-3">
          <button ref={closeButton} type="button" onClick={() => close()} aria-label="Close menu" className="pm-icon-btn -ml-3">
            <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 1l16 16M17 1L1 17" />
            </svg>
          </button>
          <Link href="/" onClick={() => close(false)} aria-label="TradeTarget home" className="flex items-center gap-2.5">
            <LogoArt variant="mark" height={22} alt="" />
            <span className="pm-wordmark">TradeTarget</span>
          </Link>
        </div>
        <div className="wrap grid gap-12 pb-16 pt-8 md:pt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-20">
          <ul>
            {menu.map((m) => (
              <li key={m.href}>
                <Link prefetch={false} href={m.href} onClick={() => close(false)} aria-current={pathname === m.href ? "page" : undefined} className="tt-menu-main block py-1">
                  {m.label}
                </Link>
              </li>
            ))}
            <li className="mt-6">
              <Link prefetch={false} href="/hire-writers/" onClick={() => close(false)} className="tt-menu-main block py-1">
                Hire our writers
              </Link>
            </li>
          </ul>
          <div className="grid content-start gap-x-10 gap-y-10 sm:grid-cols-2">
            {groups.map((g, i) => (
              <section key={g.href} aria-label={g.label}>
                <p className="tt-label border-b border-ink pb-3">
                  <b>[{String(i + 1).padStart(2, "0")}]</b> {g.label}
                </p>
                <ul className="mt-3">
                  {g.children.map((c) => (
                    <li key={c.href}>
                      <Link prefetch={false} href={c.href} onClick={() => close(false)} className="flex min-h-9 items-center text-xs font-medium uppercase tracking-[0.12em] text-ink-2 hover:text-accent pointer-coarse:min-h-11">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <div className="sm:col-span-2">
              <Link prefetch={false} href="/#newsletter" onClick={() => close(false)} className="btn">
                Subscribe to the morning brief
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
