"use client";

export const OPEN_SEARCH_EVENT = "tt:open-search";

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}

function Glass({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="7" cy="7" r="5.2" />
      <path d="M11 11l3.8 3.8" strokeLinecap="round" />
    </svg>
  );
}

export function SearchTrigger({ variant }: { variant: "box" | "icon" }) {
  if (variant === "icon") {
    return (
      <button type="button" onClick={openSearch} aria-label="Search" className="flex h-11 w-11 items-center justify-center hover:bg-white/10">
        <Glass />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search stories, IPOs and calculators"
      className="hidden w-64 items-center gap-2 border border-rule bg-paper px-3 py-2 text-left text-sm text-muted hover:border-navy/40 md:flex lg:w-80"
    >
      <Glass className="text-navy" />
      <span className="flex-1">Search stories, IPOs, calculators</span>
      <kbd className="border border-rule bg-white px-1.5 text-[0.7rem] text-muted">/</kbd>
    </button>
  );
}
