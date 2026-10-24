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
    <svg aria-hidden viewBox="0 0 22 21" fill="none" stroke="currentColor">
      <circle cx="9.5" cy="9" r="8" strokeWidth="1.5" />
      <path d="M15.2 14.7L21.4 20.5" strokeWidth="1.4" />
    </svg>
  );
}

function LinkArrow() {
  return (
    <svg aria-hidden viewBox="0 0 14 11" className="hm-bar-arrow pm-arrow" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M0 5.5H12.8M8.2 0.8l4.7 4.7-4.7 4.7" />
    </svg>
  );
}

/**
 * One bar, as in the reference design: TradeTarget's own logo, the section links in mono capitals,
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

  // The bar turns to frosted glass once the page has moved under it
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      <div className="pm-header" data-scrolled={scrolled || undefined}>
        <nav aria-label="Main" className="hm-bar flex h-[85px] items-center">
          <Link href="/" aria-label="TradeTarget home" className="hm-bar-logo flex shrink-0 items-center">
            <LogoArt variant="clear" height={64} eager alt="" />
          </Link>
          <ul className="hm-bar-links hidden items-center xl:flex">
            {items.map((item) => (
              <li key={item.href}>
                <Link prefetch={false} href={item.href} aria-current={active(item.href) ? "page" : undefined} className="pm-nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hm-bar-end flex shrink-0 items-center">
            <button type="button" onClick={openSearch} aria-label="Search stories, IPOs and calculators" className="hm-bar-search">
              <SearchIcon />
            </button>
            <span aria-hidden className="hm-bar-rule hidden sm:block" />
            <Link prefetch={false} href="/hire-writers/" className="hm-bar-link hidden sm:inline-flex">
              Hire our writers
              <span aria-hidden className="hm-bar-chip">
                <LinkArrow />
              </span>
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label="Open menu"
              className="pm-icon-btn ml-2 xl:hidden"
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
            <LogoArt variant="clear" height={44} alt="TradeTarget" />
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
