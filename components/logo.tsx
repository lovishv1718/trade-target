import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

// The supplied logo file, used exactly as delivered. It is 1536 × 1024 with wide built-in
// margins, so each variant frames a region of the same file rather than using a second asset.
const SRC = "/brand/trade-target-logo.webp";
const FILE = { w: 1536, h: 1024 };

// Regions of the file, in its own pixels.
//   full: bull and wordmark, the stacked lockup as supplied
//   mark: the bull alone, stopping just above the wordmark
const REGION = {
  full: { x: 148, y: 96, w: 1240, h: 792 },
  mark: { x: 148, y: 96, w: 1240, h: 678 },
};

// Clear space on every side: the cap height of the wordmark (108px in the file).
const CLEAR = 108;

type Props = {
  variant?: keyof typeof REGION;
  /** Rendered height of the artwork in px; width follows from the region's proportions. */
  height: number;
  /** On dark backgrounds the black wordmark disappears, so the logo sits on a paper plate. */
  inverse?: boolean;
  /** Above-the-fold placements load eagerly. */
  eager?: boolean;
  className?: string;
};

export function Logo({ variant = "full", height, inverse = false, eager = false, className = "" }: Props) {
  const r = REGION[variant];
  const scale = height / r.h;
  const width = Math.round(r.w * scale);
  const frame: CSSProperties = { width, height };
  const img: CSSProperties = {
    position: "absolute",
    maxWidth: "none",
    width: FILE.w * scale,
    height: FILE.h * scale,
    left: -r.x * scale,
    top: -r.y * scale,
  };
  return (
    <Link
      href="/"
      className={`inline-block shrink-0 align-middle ${inverse ? "bg-paper" : ""} ${className}`}
      style={inverse ? { padding: Math.round(CLEAR * scale) } : undefined}
    >
      {/* The frame reserves the exact box before the image arrives, so nothing shifts */}
      <span className="relative block overflow-hidden" style={frame}>
        <Image src={SRC} alt="TradeTarget home" width={FILE.w} height={FILE.h} unoptimized loading={eager ? "eager" : "lazy"} style={img} />
      </span>
    </Link>
  );
}
