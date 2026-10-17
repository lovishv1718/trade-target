import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ACCENT_VAR } from "./kicker";

/** Text colour for the "More" link, by section. company-mark is a fill colour, so Share Analysis links use company. */
const LINK_TONE: Record<string, string> = {
  ink: "text-ink",
  news: "text-ink",
  ipo: "text-ipo",
  company: "text-company",
  money: "text-money",
  learn: "text-learn",
  navy: "text-ink",
  accent: "text-ink",
  results: "text-company",
  commodities: "text-ink",
  funds: "text-money",
};

const ruleStyle = (accent: string) => ({ "--rule-color": ACCENT_VAR[accent] ?? accent }) as CSSProperties;

/**
 * Section header: a 3px rule in the section colour, a serif title, an optional dek and an optional
 * "More" link. It pins under the navigation bar while its section is on screen (md and up).
 * Pass `pin={false}` where a header sits in a short aside.
 */
export function SectionHeader({
  title,
  href,
  accent = "ink",
  linkLabel = "More",
  as: Tag = "h2",
  more = true,
  pin = true,
  dek,
  children,
}: {
  title: string;
  href?: string;
  accent?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
  /** Hide the right-hand link when a SectionEnd closes the section with the same destination */
  more?: boolean;
  pin?: boolean;
  /** One line on what the section is, set beside the title */
  dek?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="section-head" style={ruleStyle(accent)} data-pin={pin || undefined}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <Tag className="section-title">
          {href ? (
            <Link prefetch={false} href={href}>
              {title}
            </Link>
          ) : (
            title
          )}
        </Tag>
        {dek ? <p className="section-dek hidden sm:block">{dek}</p> : null}
        {children}
      </div>
      {href && more ? (
        <Link prefetch={false} href={href} className={`link-more shrink-0 ${LINK_TONE[accent] ?? "text-ink"}`}>
          {linkLabel} <span className="arrow" aria-hidden>→</span>
        </Link>
      ) : null}
    </header>
  );
}

/**
 * The other half of SectionHeader, in three weights:
 *   quiet     a hairline, a note on what is left, a text link
 *   standard  a rule in the section colour, the note, a secondary button
 *   strong    a full-width bar in the section colour, for the destinations that matter most
 */
export function SectionEnd({
  href,
  label,
  accent = "ink",
  note,
  weight = "standard",
}: {
  href: string;
  label: string;
  accent?: string;
  note?: ReactNode;
  weight?: "quiet" | "standard" | "strong";
}) {
  if (weight === "strong") {
    return (
      <div className="section-end" data-weight="strong" style={ruleStyle(accent)}>
        <Link prefetch={false} href={href} className="end-bar">
          <span className="end-bar-text">
            <span className="end-bar-label">{label}</span>
            {note ? <span className="end-bar-note">{note}</span> : null}
          </span>
          <span className="end-bar-go" aria-hidden>
            <span className="arrow">→</span>
          </span>
        </Link>
      </div>
    );
  }
  return (
    <div className="section-end" data-weight={weight} style={ruleStyle(accent)}>
      {note ? <p className="section-end-note">{note}</p> : null}
      {weight === "quiet" ? (
        <Link prefetch={false} href={href} className="link-more ml-auto">
          {label} <span className="arrow" aria-hidden>→</span>
        </Link>
      ) : (
        <Link prefetch={false} href={href} className="btn btn-secondary btn-sm ml-auto">
          {label} <span className="arrow" aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
