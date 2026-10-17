"use client";

export const OPEN_SEARCH_EVENT = "tt:open-search";

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}

function Glass({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="7" cy="7" r="5.2" />
      <path d="M11 11l3.8 3.8" strokeLinecap="square" />
    </svg>
  );
}

export function SearchTrigger({ variant }: { variant: "box" | "icon" }) {
  if (variant === "icon") {
    return (
      <button type="button" onClick={openSearch} aria-label="Search" className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-2 hover:text-ink">
        <Glass />
      </button>
    );
  }
  // Drawn as a .field so it reads as the search input it opens
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search stories, IPOs and calculators"
      className="field mt-0 hidden w-64 items-center gap-2.5 text-left text-sm text-muted md:flex lg:w-72 xl:w-80"
    >
      <Glass className="shrink-0 text-ink" />
      <span className="min-w-0 flex-1 truncate">Search stories, IPOs, calculators</span>
      <kbd className="shrink-0 border border-rule-strong bg-paper px-1.5 font-sans text-2xs font-semibold leading-normal text-muted">/</kbd>
    </button>
  );
}
