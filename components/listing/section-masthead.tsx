import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs } from "../breadcrumbs";
import { ACCENT_VAR } from "../kicker";

/** Listing page head: breadcrumbs, a 3px rule in the section colour, serif title, standfirst and story count. */
export function SectionMasthead({
  title,
  description,
  accent = "ink",
  crumbs,
  count,
  children,
}: {
  title: string;
  description: string;
  accent?: string;
  crumbs: { label: string; href: string }[];
  count?: number;
  children?: ReactNode;
}) {
  return (
    <div className="wrap pt-4 md:pt-6">
      <Breadcrumbs items={crumbs} current={title} />
      <header className="section-rule mt-3 border-b border-rule pt-4 pb-5 md:pb-6" style={{ "--rule-color": ACCENT_VAR[accent] ?? ACCENT_VAR.ink } as CSSProperties}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="min-w-0">
            <h1 className="headline text-3xl md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-md leading-normal text-ink-2 md:text-lg md:leading-normal">{description}</p>
          </div>
          {count !== undefined ? (
            <p className="tabular shrink-0 text-sm text-muted">
              <span className="font-semibold text-ink">{count}</span> {count === 1 ? "story" : "stories"}
            </p>
          ) : null}
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
      </header>
    </div>
  );
}
