import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs } from "../breadcrumbs";
import { ACCENT_VAR } from "../kicker";

const KICKER_TONE: Record<string, string> = { ink: "text-ink", ipo: "text-ipo", company: "text-company", money: "text-money", learn: "text-learn" };

/**
 * Page head, the same on every section and index page: breadcrumbs, then a paper-2 masthead band
 * with a 3px rule in the section colour, an optional kicker, the display title and the deck. On
 * the right sits either the story count, set as a ledger figure, or any `aside` (figures, a
 * directory). `children` run full width under the title (topic tabs).
 */
export function SectionMasthead({
  title,
  description,
  accent = "ink",
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
        <header className="mt-3 border-t-3 border-(--rule-color) pt-4 pb-6 md:pb-8" style={{ "--rule-color": ACCENT_VAR[accent] ?? ACCENT_VAR.ink } as CSSProperties}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="min-w-0">
              {kicker ? <p className={`kicker mb-2 ${KICKER_TONE[accent] ?? "text-ink"}`}>{kicker}</p> : null}
              <h1 className="headline max-w-[24ch] text-balance text-4xl md:text-5xl">{title}</h1>
              {description ? <p className="deck mt-3 max-w-2xl text-lg leading-normal md:text-xl">{description}</p> : null}
            </div>
            {aside ??
              (count !== undefined ? (
                <p className="tabular shrink-0 border-l border-rule-strong pl-4 md:text-right">
                  <span className="block text-3xl font-semibold leading-none text-ink">{count}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-caps text-muted">{count === 1 ? "story" : "stories"}</span>
                </p>
              ) : null)}
          </div>
          {children ? <div className="mt-6">{children}</div> : null}
        </header>
      </div>
    </div>
  );
}
