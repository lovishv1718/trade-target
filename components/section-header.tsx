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

/** Section header: a 3px rule in the section colour, a serif title, and an optional "More" link on the right. */
export function SectionHeader({
  title,
  href,
  accent = "ink",
  linkLabel = "More",
  as: Tag = "h2",
  children,
}: {
  title: string;
  href?: string;
  accent?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
  children?: ReactNode;
}) {
  const style = { "--rule-color": ACCENT_VAR[accent] ?? accent } as CSSProperties;
  return (
    <div className="section-rule flex items-baseline justify-between gap-4 pt-2" style={style}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <Tag className="headline text-2xl">
          {href ? (
            <Link prefetch={false} href={href} className="decoration-1 underline-offset-4 hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </Tag>
        {children}
      </div>
      {href ? (
        <Link prefetch={false} href={href} className={`link-more shrink-0 ${LINK_TONE[accent] ?? "text-ink"}`}>
          {linkLabel} <span className="arrow" aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
