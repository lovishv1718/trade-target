import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs } from "../breadcrumbs";
import { ACCENT_VAR } from "../kicker";

export function SectionMasthead({
  title,
  description,
  accent = "navy",
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
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={crumbs} current={title} />
      <header className="section-rule mt-4 pt-3" style={{ "--rule-color": ACCENT_VAR[accent] } as CSSProperties}>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="headline text-[2.2rem] leading-tight md:text-[2.8rem]">{title}</h1>
            <p className="mt-1.5 max-w-2xl text-[1.05rem] text-[#3a4453]">{description}</p>
          </div>
          {count !== undefined ? <p className="shrink-0 text-sm text-muted">{count} stories</p> : null}
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </header>
    </div>
  );
}
