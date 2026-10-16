import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ACCENT_VAR } from "./kicker";

export function SectionHeader({
  title,
  href,
  accent = "navy",
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
    <div className="section-rule flex items-baseline justify-between gap-4 pt-2.5" style={style}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <Tag className="headline text-[1.45rem] leading-tight md:text-[1.6rem]">
          {href ? (
            <Link prefetch={false} href={href} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </Tag>
        {children}
      </div>
      {href ? (
        <Link prefetch={false} href={href} className="shrink-0 text-sm font-semibold text-accent-ink hover:underline">
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
