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

export function SearchTrigger({ variant }: { variant: "box" | "icon" | "field" }) {
  if (variant === "icon") {
    return (
      <button type="button" onClick={openSearch} aria-label="Search" className="btn btn-text btn-icon shrink-0">
        <Glass />
      </button>
    );
  }
  if (variant === "field") {
    // Full width at every size: the 404 page's search box on phones
    return (
      <button type="button" onClick={openSearch} className="field mt-0 flex h-12 items-center gap-2.5 text-left text-base text-muted">
        <Glass className="shrink-0 text-ink" />
        <span className="min-w-0 flex-1 truncate">Search stories, IPOs, calculators</span>
      </button>
    );
  }
  // Drawn as a .field so it reads as the search input it opens
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search stories, IPOs and calculators"
      className="field mt-0 hidden h-12 w-64 items-center gap-3 rounded-2xl border-white/90 bg-white/80 px-4 text-left text-base text-muted shadow-card backdrop-blur-xl hover:border-white hover:bg-white md:flex lg:w-80 xl:w-96"
    >
      <Glass className="size-5 shrink-0 text-ink" />
      <span className="min-w-0 flex-1 truncate">Search stories, IPOs, calculators</span>
      <kbd className="shrink-0 rounded-md border border-rule-strong bg-white px-2 font-sans text-xs font-semibold leading-relaxed text-muted">/</kbd>
    </button>
  );
}
