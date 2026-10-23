import type { ReactNode } from "react";

// One thin line set for tiles and tools: 24px grid, 1.5 stroke, square ends, drawn in currentColor.
const PATHS: Record<string, ReactNode> = {
  growth: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5L5 19" />
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16v-5a6 6 0 0112 0v5l1.5 2h-15L6 16z" />
      <path d="M10 21h4" />
    </>
  ),
  bars: (
    <>
      <path d="M4 20h16" />
      <path d="M7 16v-5M12 16V7M17 16v-3" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-4h6v4M9 12h.01M15 12h.01" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7h18v13H3z" />
      <path d="M3 7l13-3v3" />
      <path d="M16 13.5h2" />
    </>
  ),
  calculator: (
    <>
      <path d="M5 3h14v18H5z" />
      <path d="M8 7h8v3H8z" />
      <path d="M8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17.5h.01M12 17.5h.01M15.5 17.5h.01" />
    </>
  ),
  columns: (
    <>
      <path d="M4 20V14h3.5v6zM10.25 20V9h3.5v11zM16.5 20V4H20v16z" />
    </>
  ),
  card: (
    <>
      <path d="M3 5.5h18v13H3z" />
      <path d="M3 9.5h18M6.5 14.5h5" />
    </>
  ),
  piggy: (
    <>
      <path d="M5 11.5c0-3 2.9-5 6.5-5 1.4 0 2.6.3 3.6.8L18 6v3l1.5 1.5H21v4h-2l-1.6 2V19h-3v-1.5h-3V19h-3v-2.3C6.2 15.8 5 14 5 11.5z" />
      <path d="M5 11.5H3M15.5 10.5h.01" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4M5 9.5v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4M5 13.5v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8.5L19 7.5V21H6z" />
      <path d="M14.5 3v4.5H19M9 11h7M9 14.5h7M9 18h5" />
    </>
  ),
  pie: (
    <>
      <path d="M11 4.5a8 8 0 108.5 8.5H11z" />
      <path d="M14 2.5a7.5 7.5 0 017.5 7.5H14z" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={className}>
      {PATHS[name]}
    </svg>
  );
}
