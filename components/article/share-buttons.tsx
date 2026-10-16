"use client";

import { useState } from "react";

const PATHS: Record<string, string> = {
  X: "M13.6 2h2.5l-5.4 6.2L17 18h-5l-3.9-5.1L3.6 18H1.1l5.8-6.6L1 2h5.1l3.5 4.7L13.6 2zm-.9 14.5h1.4L5.4 3.4H3.9l8.8 13.1z",
  Facebook: "M11 18v-7h2.4l.4-2.8H11V6.4c0-.8.2-1.4 1.4-1.4H14V2.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.1H5.8V11h2.4v7H11z",
  LinkedIn: "M3 6.5h3V17H3V6.5zM4.5 2a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zM8 6.5h2.9v1.4c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7V17h-3v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V17H8V6.5z",
  WhatsApp: "M10 2a8 8 0 00-6.9 12l-1 3.9 4-1A8 8 0 1010 2zm0 14.6c-1.2 0-2.4-.3-3.4-1l-.2-.1-2.4.6.6-2.3-.2-.3A6.6 6.6 0 1110 16.6zm3.6-4.9c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.6.8c-.1.1-.2.2-.4.1a5.4 5.4 0 01-2.7-2.4c-.2-.3.2-.3.6-1 .1-.1 0-.3 0-.4l-.6-1.5c-.2-.4-.3-.3-.5-.3h-.4a.8.8 0 00-.6.3 2.4 2.4 0 00-.8 1.8 4.2 4.2 0 00.9 2.2 9.5 9.5 0 003.6 3.2c1.3.6 1.9.6 2.5.5.4 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1l-.6-.3z",
};

export function ShareButtons({ title, path, compact = false }: { title: string; path: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = `https://tradetarget.in${path}`;
  const links = [
    { name: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=tradetarget3` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {!compact ? <span className="mr-1 text-sm font-semibold text-muted">Share</span> : null}
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.name}`}
          className="flex h-9 w-9 items-center justify-center border border-rule bg-white text-navy hover:border-navy hover:bg-navy hover:text-white"
        >
          <svg aria-hidden width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
            <path d={PATHS[l.name]} />
          </svg>
        </a>
      ))}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        className="h-9 border border-rule bg-white px-3 text-sm font-semibold text-navy hover:border-navy"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
