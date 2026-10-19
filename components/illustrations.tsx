/**
 * Small isometric illustrations for story topics, the market icon tiles and the commodities desk.
 * Drawn in SVG with gradients so they stay sharp at any size and cost no image request. Purely
 * decorative: every one is aria-hidden, and the text beside it carries the meaning.
 */

type Art = "document" | "bars" | "trend" | "gold" | "silver" | "coins" | "book" | "lens" | "calc";

/** Which picture a story's section label gets */
const BY_KICKER: Record<string, Art> = {
  IPO: "document",
  Results: "bars",
  Dividends: "coins",
  "Share Analysis": "lens",
  Commodities: "gold",
  News: "trend",
  Markets: "trend",
  Business: "trend",
  Funds: "coins",
  "Personal Finance": "coins",
  "Blog Junction": "book",
  "Stock Market IQ": "book",
  Calculators: "calc",
};

export function artFor(kicker: string): Art {
  return BY_KICKER[kicker] ?? "trend";
}

/** One prism of an isometric bar chart: front, side and top faces */
function Prism({ x, base, w, h, id }: { x: number; base: number; w: number; h: number; id: string }) {
  const dx = 6;
  const dy = -4;
  const top = base - h;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={`url(#${id}-front)`} />
      <path d={`M${x + w} ${top}l${dx} ${dy}V${base + dy}l${-dx} ${-dy}z`} fill={`url(#${id}-side)`} />
      <path d={`M${x} ${top}l${dx} ${dy}h${w}l${-dx} ${-dy}z`} fill={`url(#${id}-top)`} />
    </g>
  );
}

/** One ingot: a bevelled front, a top and a side, in gold or silver */
function Ingot({ x, y, w, h, id }: { x: number; y: number; w: number; h: number; id: string }) {
  const t = 4;
  const dx = 8;
  const dy = -6;
  return (
    <g>
      <path d={`M${x} ${y + h}h${w}l${-t} ${-h}h${-(w - 2 * t)}z`} fill={`url(#${id}-front)`} />
      <path d={`M${x + t} ${y}h${w - 2 * t}l${dx} ${dy}h${-(w - 2 * t)}z`} fill={`url(#${id}-top)`} />
      <path d={`M${x + w} ${y + h}l${dx} ${dy}l${-t} ${-h}l${-dx} ${-dy}z`} fill={`url(#${id}-side)`} />
    </g>
  );
}

function Shadow({ rx = 30 }: { rx?: number }) {
  return <ellipse cx="48" cy="84" rx={rx} ry="6.5" fill="#0b1b33" opacity="0.13" />;
}

/** Gradient stops for a material, keyed by face */
function Material({ id, front, side, top }: { id: string; front: [string, string]; side: [string, string]; top: [string, string] }) {
  return (
    <>
      <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={front[0]} />
        <stop offset="1" stopColor={front[1]} />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={side[0]} />
        <stop offset="1" stopColor={side[1]} />
      </linearGradient>
      <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={top[0]} />
        <stop offset="1" stopColor={top[1]} />
      </linearGradient>
    </>
  );
}

const BLUE = { front: ["#4b93ff", "#1453db"] as [string, string], side: ["#1a4fc4", "#0c2f86"] as [string, string], top: ["#b8d6ff", "#7fb0ff"] as [string, string] };
const GOLD = { front: ["#ffe08a", "#e2a11f"] as [string, string], side: ["#c88a12", "#8f5d06"] as [string, string], top: ["#fff6cf", "#ffd86b"] as [string, string] };
const SILVER = { front: ["#f7f9fc", "#b4bfcf"] as [string, string], side: ["#98a5b8", "#66738a"] as [string, string], top: ["#ffffff", "#dde4ee"] as [string, string] };

export function Illustration({ art, id, className = "" }: { art: Art; id: string; className?: string }) {
  const k = `il-${id}`;
  return (
    <svg aria-hidden viewBox="0 0 96 96" className={`block ${className}`}>
      <defs>
        <Material id={`${k}-b`} {...BLUE} />
        <Material id={`${k}-g`} {...GOLD} />
        <Material id={`${k}-s`} {...SILVER} />
        <linearGradient id={`${k}-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6eefb" />
        </linearGradient>
        <linearGradient id={`${k}-navy`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#24406e" />
          <stop offset="1" stopColor="#0d1b33" />
        </linearGradient>
        <linearGradient id={`${k}-purple`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b6bff" />
          <stop offset="1" stopColor="#4d2fc4" />
        </linearGradient>
        <radialGradient id={`${k}-lens`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#cfe2ff" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      {art === "document" ? (
        <g>
          <Shadow rx={28} />
          <rect x="29" y="18" width="46" height="60" rx="7" fill="#9db7e6" />
          <rect x="23" y="13" width="46" height="60" rx="7" fill={`url(#${k}-paper)`} stroke="#c5d5ee" />
          <path d="M23 20a7 7 0 0 1 7-7h32a7 7 0 0 1 7 7v7H23z" fill={`url(#${k}-b-front)`} />
          <rect x="37" y="8" width="18" height="9" rx="3.5" fill="#7d9ccf" />
          <text x="46" y="24.5" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="800" fill="#ffffff" letterSpacing="0.5">
            IPO
          </text>
          <rect x="30" y="34" width="30" height="3.2" rx="1.6" fill="#c5d4ec" />
          <rect x="30" y="41" width="22" height="3.2" rx="1.6" fill="#c5d4ec" />
          <rect x="30" y="58" width="5" height="9" rx="1" fill="#7fb0ff" />
          <rect x="38" y="53" width="5" height="14" rx="1" fill="#4b93ff" />
          <rect x="46" y="49" width="5" height="18" rx="1" fill="#1d5fd6" />
          <path d="M55 60l5-6 4 3 4-7" fill="none" stroke="#22b573" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {art === "bars" ? (
        <g>
          <Shadow rx={34} />
          <path d="M14 80l40 -8l30 6l-40 8z" fill="#dbe5f4" />
          <Prism x={18} base={80} w={11} h={18} id={`${k}-b`} />
          <Prism x={33} base={78} w={11} h={30} id={`${k}-b`} />
          <Prism x={48} base={76} w={11} h={42} id={`${k}-b`} />
          <Prism x={63} base={74} w={11} h={56} id={`${k}-b`} />
          <path d="M16 54l16 -10l14 4l24 -26" fill="none" stroke="#22b573" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M63 20l8 -2l-1 8" fill="none" stroke="#22b573" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {art === "trend" ? (
        <g>
          <Shadow rx={32} />
          <path d="M20 26l58 -6v46l-58 6z" fill="#0a1527" />
          <path d="M16 24l58 -6v46l-58 6z" fill={`url(#${k}-navy)`} />
          <path d="M22 60l10 -9l8 4l10 -14l8 5l10 -16" fill="none" stroke="#22d17c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 60l10 -9l8 4l10 -14l8 5l10 -16v34l-46 5z" fill="#22d17c" opacity="0.18" />
          <rect x="22" y="28" width="16" height="3" rx="1.5" fill="#ffffff" opacity="0.45" transform="rotate(-6 22 28)" />
        </g>
      ) : null}
      {art === "gold" || art === "silver" ? (
        <g>
          <Shadow rx={32} />
          <Ingot x={14} y={64} w={34} h={14} id={`${k}-${art === "gold" ? "g" : "s"}`} />
          <Ingot x={44} y={64} w={34} h={14} id={`${k}-${art === "gold" ? "g" : "s"}`} />
          <Ingot x={29} y={46} w={34} h={14} id={`${k}-${art === "gold" ? "g" : "s"}`} />
          <path d="M37 50l4 -3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </g>
      ) : null}
      {art === "coins" ? (
        <g>
          <Shadow rx={28} />
          {[0, 1, 2, 3].map((i) => {
            const cy = 72 - i * 9;
            return (
              <g key={i}>
                <path d={`M24 ${cy}v6a22 8 0 0 0 44 0v-6`} fill={`url(#${k}-g-side)`} />
                <ellipse cx="46" cy={cy} rx="22" ry="8" fill={`url(#${k}-g-top)`} stroke="#e2a11f" strokeWidth="1" />
              </g>
            );
          })}
          <text x="46" y="48" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="800" fill="#b47a0a">
            ₹
          </text>
          <ellipse cx="72" cy="30" rx="9" ry="9" fill={`url(#${k}-g-front)`} stroke="#e2a11f" />
          <text x="72" y="33.5" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800" fill="#8f5d06">
            ₹
          </text>
        </g>
      ) : null}
      {art === "book" ? (
        <g>
          <Shadow rx={30} />
          <path d="M20 62l30 10l28 -12l-30 -10z" fill="#e9eef7" stroke="#c9d6ea" />
          <path d="M20 62v6l30 10v-6z" fill="#cdd9eb" />
          <path d="M50 72v6l28 -12v-6z" fill="#b9c8e0" />
          <path d="M20 54l30 10l28 -12l-30 -10z" fill={`url(#${k}-purple)`} />
          <path d="M20 54v8l30 10v-8z" fill="#3a2296" />
          <path d="M50 64v8l28 -12v-8z" fill="#ffffff" />
          <path d="M53 65l22 -9.5M53 68l22 -9.5" stroke="#d9e2f0" strokeWidth="1" />
          <circle cx="56" cy="30" r="10" fill="#ffd34d" />
          <circle cx="56" cy="30" r="15" fill="#ffd34d" opacity="0.25" />
          <rect x="52" y="39" width="8" height="5" rx="1.5" fill="#8a96ab" />
        </g>
      ) : null}
      {art === "lens" ? (
        <g>
          <Shadow rx={30} />
          <rect x="18" y="22" width="48" height="40" rx="6" fill={`url(#${k}-paper)`} stroke="#c5d5ee" />
          <rect x="24" y="44" width="6" height="12" rx="1" fill="#7fb0ff" />
          <rect x="33" y="36" width="6" height="20" rx="1" fill="#4b93ff" />
          <rect x="42" y="30" width="6" height="26" rx="1" fill="#1d5fd6" />
          <path d="M66 66l12 12" stroke="#8a5a00" strokeWidth="7" strokeLinecap="round" />
          <circle cx="58" cy="56" r="15" fill={`url(#${k}-lens)`} stroke={`url(#${k}-g-front)`} strokeWidth="5" />
          <path d="M51 51a9 9 0 0 1 8 -4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : null}
      {art === "calc" ? (
        <g>
          <Shadow rx={26} />
          <rect x="32" y="16" width="38" height="62" rx="8" fill="#0a1527" />
          <rect x="27" y="12" width="38" height="62" rx="8" fill={`url(#${k}-navy)`} />
          <rect x="32" y="18" width="28" height="12" rx="3" fill="#bfe9d3" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={32 + c * 10} y={36 + r * 11} width="7.5" height="8" rx="2" fill={c === 2 && r === 2 ? "#ff8a3d" : "#4b93ff"} opacity={c === 2 && r === 2 ? 1 : 0.85} />),
          )}
        </g>
      ) : null}
    </svg>
  );
}

/** Rounded gradient tiles with a white glyph, one per index on the markets board */
const TILE: Record<string, { from: string; to: string; glyph: string }> = {
  nifty50: { from: "#8b6bff", to: "#ff4d8d", glyph: "M5 15V9M9 15V6M13 15V10M17 15V4" },
  sensex: { from: "#2f8bff", to: "#12c2ff", glyph: "M4 15l5-5 3 3 6-7M14 6h4v4" },
  niftybank: { from: "#5a7bff", to: "#2b3fd1", glyph: "M3 8l8-4 8 4M5 9v6M9 9v6M13 9v6M17 9v6M3 17h16" },
  niftyit: { from: "#ff9a3d", to: "#ff3d6e", glyph: "M8 6l-4 4 4 4M14 6l4 4-4 4M12.5 4l-3 12" },
  midcap: { from: "#3b82f6", to: "#1e3fae", glyph: "M11 3l7 4v8l-7 4-7-4V7z M11 3v8M4 7l7 4 7-4" },
  smallcap: { from: "#19c2b0", to: "#0b7a8a", glyph: "M11 4l6 3.5v7L11 18l-6-3.5v-7zM11 11l6-3.5M11 11v7M11 11L5 7.5" },
  usdinr: { from: "#22b573", to: "#0b7a4a", glyph: "M7 5h8M7 9h8M10 5c4 0 4 4 0 4H7l6 7" },
};

export function IndexTile({ id, className = "" }: { id: string; className?: string }) {
  const t = TILE[id] ?? TILE.sensex;
  return (
    <span
      aria-hidden
      className={`grid size-9 shrink-0 place-items-center rounded-xl shadow-[0_6px_14px_-6px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.35)] ${className}`}
      style={{ backgroundImage: `linear-gradient(145deg, ${t.from}, ${t.to})` }}
    >
      <svg viewBox="0 0 22 20" width="20" height="18" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={t.glyph} />
      </svg>
    </span>
  );
}
