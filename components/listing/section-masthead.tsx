import type { ReactNode } from "react";
import { Breadcrumbs } from "../breadcrumbs";

/**
 * Page head, the same on every section and index page: breadcrumbs, then a paper-2 masthead band
 * with one ink hairline, an optional bracketed kicker, the display title and the deck. On the
 * right sits either the story count, set as a figure, or any `aside` (figures, a directory).
 * `children` run full width under the title (topic tabs). Every section shares the one look, so
 * `accent` is accepted from callers but no longer changes the colour.
 */
export function SectionMasthead({
  title,
  description,
  crumbs,
  crumb,
  kicker,
  count,
  aside,
  children,
}: {
  title: string;
  description?: ReactNode;
  accent?: string;
  crumbs: { label: string; href: string }[];
  /** The breadcrumb for this page, when it differs from the title */
  crumb?: string;
  kicker?: string;
  count?: number;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="surface-paper-2 border-b border-rule">
      <div className="wrap pt-4 md:pt-6">
        <Breadcrumbs items={crumbs} current={crumb ?? title} />
        <header className="mt-3 border-t border-ink pt-5 pb-6 md:pb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="min-w-0">
              {kicker ? <p className="eyebrow mb-3">{kicker}</p> : null}
              <h1 className="headline max-w-[24ch] text-balance text-4xl md:text-5xl">{title}</h1>
              {description ? <p className="deck mt-3 max-w-2xl text-lg leading-normal md:text-xl">{description}</p> : null}
            </div>
            {aside ??
              (count !== undefined ? (
                <p className="shrink-0 border-l border-rule-strong pl-4 md:text-right">
                  <span className="pm-figure block text-3xl leading-none">{String(count).padStart(2, "0")}</span>
                  <span className="pm-meta mt-1.5 block">{count === 1 ? "story" : "stories"}</span>
                </p>
              ) : null)}
          </div>
          {children ? <div className="mt-6">{children}</div> : null}
        </header>
      </div>
    </div>
  );
}
