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
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="7" r="5.2" />
      <path d="M11 11l3.8 3.8" strokeLinecap="square" />
    </svg>
  );
}

/**
 * One bar, as in the reference design: the mark and wordmark, the section links in mono capitals,
 * search and the writers button. It sticks to the top. Below 1280px the links move into a drawer.
 */
export function SiteNav({ items, menu }: { items: NavItem[]; menu: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) menuButton.current?.focus();
  }, []);

  // Drawer: focus moves in, Tab stays inside, Esc closes and focus returns to the menu button
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
        <nav aria-label="Main" className="wrap flex h-[4.5rem] items-center gap-4">
          <Link href="/" aria-label="TradeTarget home" className="flex shrink-0 items-center gap-2.5">
            <LogoArt variant="mark" height={22} eager alt="" />
            <span className="pm-wordmark">tradetarget</span>
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
          <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
            <button type="button" onClick={openSearch} aria-label="Search stories, IPOs and calculators" className="pm-icon-btn">
              <SearchIcon />
            </button>
            <Link prefetch={false} href="/hire-writers/" className="btn hidden min-h-11 sm:inline-flex">
              Hire our writers
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label="Open menu"
              className="pm-icon-btn xl:hidden"
            >
              <svg aria-hidden width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M0 1h18M0 6h18M0 11h18" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Always mounted so it can animate both ways; hidden and inert while closed. Outside the
          frosted bar, whose backdrop filter would otherwise become this fixed layer's frame. */}
      <div id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" inert={!open} className={`fixed inset-0 z-50 flex justify-end overflow-hidden ${open ? "visible" : "invisible transition-[visibility] duration-200"}`}>
        <div aria-hidden onClick={() => close()} className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out ${open ? "opacity-100" : "opacity-0"}`} />
        <div
          ref={panel}
          className={`relative flex h-full w-[min(380px,88vw)] flex-col bg-white text-ink shadow-overlay transition-transform duration-200 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-rule py-3 pl-5 pr-3">
            <span className="pm-wordmark">tradetarget</span>
            <button ref={closeButton} type="button" onClick={() => close()} aria-label="Close menu" className="pm-icon-btn">
              <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6">
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
                  className="flex min-h-11 items-center font-serif text-lg font-bold tracking-tight text-ink"
                >
                  {m.label}
                </Link>
                {m.children.length ? (
                  <ul className="grid grid-cols-2 gap-x-4 pb-2">
                    {m.children.map((c) => (
                      <li key={c.href}>
                        <Link prefetch={false} href={c.href} onClick={() => close(false)} className="link-soft flex min-h-9 items-center py-1 text-sm leading-snug pointer-coarse:min-h-11">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="border-t border-rule p-5">
            <Link prefetch={false} href="/hire-writers/" onClick={() => close(false)} className="btn btn-block">
              Hire our writers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
