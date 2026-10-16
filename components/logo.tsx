import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

// The supplied logo files, used exactly as delivered. Each has wide built-in margins, so the
// component frames the artwork box (measured in the file's own pixels) instead of the whole file.
//   full: bull above the black wordmark. Delivered on a near-white ground, so it belongs on white.
//   mark: the bull alone, transparent. Used for compact placements, on black, and as the favicon.
// A white-wordmark file for dark bands has not arrived yet; until it does, `inverse` shows the mark.
const ASSETS = {
  full: { src: "/brand/trade-target-logo.webp", file: { w: 1254, h: 1254 }, box: { x: 148, y: 296, w: 976, h: 681 }, clear: 85 },
  mark: { src: "/brand/trade-target-mark.webp", file: { w: 1270, h: 1239 }, box: { x: 47, y: 269, w: 1198, h: 726 }, clear: 109 },
};

type Variant = keyof typeof ASSETS;

type Props = {
  variant?: Variant;
  /** Rendered height of the artwork in px; width follows from its proportions. */
  height: number;
  /** For black or dark bands. */
  inverse?: boolean;
  /** Above-the-fold placements load eagerly. */
  eager?: boolean;
  className?: string;
};

/** Rendered width for a given height, for layouts that reserve the logo's space. */
export function logoWidth(height: number, variant: Variant = "full") {
  const { box } = ASSETS[variant];
  return Math.round((box.w * height) / box.h);
}

/** Clear space on every side (the wordmark's cap height), for a given rendered height. */
export function logoClearSpace(height: number, variant: Variant = "full") {
  const a = ASSETS[variant];
  return Math.round((a.clear * height) / a.box.h);
}

export function Logo({ variant = "full", height, inverse = false, eager = false, className = "" }: Props) {
  const a = ASSETS[inverse ? "mark" : variant];
  const scale = height / a.box.h;
  const frame: CSSProperties = { width: Math.round(a.box.w * scale), height };
  const img: CSSProperties = {
    position: "absolute",
    maxWidth: "none",
    width: a.file.w * scale,
    height: a.file.h * scale,
    left: -a.box.x * scale,
    top: -a.box.y * scale,
  };
  return (
    <Link href="/" className={`inline-block shrink-0 align-middle ${className}`}>
      {/* The frame reserves the exact box before the image arrives, so nothing shifts */}
      <span className="relative block overflow-hidden" style={frame}>
        <Image src={a.src} alt="TradeTarget home" width={a.file.w} height={a.file.h} unoptimized loading={eager ? "eager" : "lazy"} style={img} />
      </span>
    </Link>
  );
}
