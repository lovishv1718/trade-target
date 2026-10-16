"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchTrigger } from "../search/search-trigger";

type NavItem = { label: string; href: string };
type MenuItem = NavItem & { children: NavItem[] };

export function MainNav({ items, menu }: { items: NavItem[]; menu: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav aria-label="Main" className="sticky top-0 z-40 bg-navy text-white shadow-[0_1px_0_rgba(0,0,0,0.2)]">
      <div className="wrap flex h-11 items-stretch">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Open menu"
          className="-ml-2 mr-1 flex shrink-0 items-center gap-2 px-2 text-sm font-semibold hover:bg-white/10"
        >
          <svg aria-hidden width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
            <rect width="18" height="2" />
            <rect y="6" width="18" height="2" />
            <rect y="12" width="18" height="2" />
          </svg>
          <span className="sr-only md:not-sr-only">Menu</span>
        </button>
        <Link prefetch={false} href="/" className={`flex shrink-0 items-center px-3 text-[0.92rem] font-semibold hover:bg-white/10 ${pathname === "/" ? "bg-white/10" : ""}`}>
          Home
        </Link>
        <ul className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto">
          {items.map((item) => (
            <li key={item.href} className="flex">
              <Link prefetch={false}
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
                className={`relative flex items-center whitespace-nowrap px-3 text-[0.92rem] font-semibold hover:bg-white/10 ${
                  active(item.href) ? "text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-accent-ink" : "text-white/85"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center md:hidden">
          <SearchTrigger variant="icon" />
        </div>
      </div>

      {open ? (
        <div id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[min(360px,88vw)] flex-col overflow-y-auto bg-white text-ink shadow-xl">
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <span className="font-serif text-xl font-bold">
                <span className="text-navy">Trade</span>
                <span className="text-accent-ink">Target</span>
              </span>
              <button type="button" onClick={() => setOpen(false)} className="px-2 py-1 text-sm font-semibold text-muted hover:text-ink">
                Close
              </button>
            </div>
            <ul className="divide-y divide-rule px-5">
              {menu.map((m) => (
                <li key={m.href} className="py-3">
                  <Link prefetch={false} href={m.href} onClick={() => setOpen(false)} className="font-serif text-[1.1rem] font-semibold hover:text-accent-ink">
                    {m.label}
                  </Link>
                  {m.children.length ? (
                    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {m.children.map((c) => (
                        <li key={c.href}>
                          <Link prefetch={false} href={c.href} onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">
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
      ) : null}
    </nav>
  );
}
