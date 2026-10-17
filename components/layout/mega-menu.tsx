"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { formatDayMonth } from "@/lib/format";
import { ipoStatus, type IpoDates } from "@/lib/ipo";
import { useIstToday } from "@/lib/use-ist-today";

export type MegaLink = { label: string; href: string };
export type MegaColumn = { title: string; href?: string; links: MegaLink[] };
export type MegaStory = { kicker: string; title: string; href: string; date: string };
export type MegaCalc = { label: string; href: string; note: string };
export type MegaIpo = { slug: string; name: string; dates: IpoDates; band: string };
export type MegaPanelData = {
  title: string;
  description: string;
  href: string;
  cta: string;
  /** Section colour: a CSS colour for the top rule, and a text utility for the kicker */
  rule: string;
  tone: string;
  columns: MegaColumn[];
  strip?: { kind: "stories"; title: string; stories: MegaStory[] } | { kind: "calcs"; title: string; calcs: MegaCalc[] } | { kind: "ipos" };
};

const columnLink = "link-soft flex min-h-9 items-center py-1 text-sm leading-snug pointer-coarse:min-h-11";

/** IPOs open today; if none, the next to open. Status is worked out in the browser from today's IST date. */
function IpoStrip({ ipos, buildDate }: { ipos: MegaIpo[]; buildDate: string }) {
  const today = useIstToday(buildDate);
  const open = ipos.filter((i) => ipoStatus(i, today) === "open");
  const next = ipos
    .filter((i) => ipoStatus(i, today) === "upcoming" && i.dates.open)
    .sort((a, b) => (a.dates.open! < b.dates.open! ? -1 : 1))
    .slice(0, 3);
  const items = open.length ? open : next;
  return (
    <StripFrame title={open.length ? "Open now" : "Opening next"}>
      {items.length === 0 ? (
        <p className="text-sm text-muted">No mainboard or SME issues are open or scheduled this week.</p>
      ) : (
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
          {items.map((i) => (
            <li key={i.slug}>
              <Link prefetch={false} href={`/ipo/${i.slug}/`} className="link-row block py-1">
                <span className="link-row-label block text-sm">{i.name}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {open.length
                    ? `${i.dates.open ? formatDayMonth(i.dates.open) : ""} – ${i.dates.close ? formatDayMonth(i.dates.close) : ""}`
                    : `Opens ${formatDayMonth(i.dates.open!)}`}
                  {" · "}
                  {i.band}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StripFrame>
  );
}

function StripFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-rule py-4 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:gap-8">
      <p className="kicker pt-0.5 text-muted">{title}</p>
      {children}
    </div>
  );
}

/** The contents of one section's panel: intro, link columns, and a live strip along the bottom. */
export function MegaPanel({ data, ipos, buildDate, onNavigate }: { data: MegaPanelData; ipos: MegaIpo[]; buildDate: string; onNavigate: () => void }) {
  return (
    <div className="wrap" onClick={(e) => (e.target as HTMLElement).closest("a") && onNavigate()} style={{ "--rule-color": data.rule } as CSSProperties}>
      <div className="grid gap-x-8 gap-y-5 py-5 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:py-6">
        <div>
          <p className={`kicker ${data.tone}`}>Section</p>
          <p className="headline mt-1 text-2xl">{data.title}</p>
          <p className="mt-2 hidden text-sm text-ink-2 sm:block">{data.description}</p>
          <Link prefetch={false} href={data.href} className="btn btn-secondary btn-sm mt-4">
            {data.cta} <span className="arrow" aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] lg:gap-x-8">
          {data.columns.map((col) => (
            <div key={col.title} className="min-w-0">
              <p className="border-b border-rule pb-1.5 text-xs font-bold uppercase tracking-caps text-ink">
                {col.href ? (
                  <Link prefetch={false} href={col.href} className="link-quiet">
                    {col.title}
                  </Link>
                ) : (
                  col.title
                )}
              </p>
              <ul className="mt-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link prefetch={false} href={l.href} className={columnLink}>
                      <span className="line-clamp-2">{l.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {data.strip?.kind === "ipos" ? <IpoStrip ipos={ipos} buildDate={buildDate} /> : null}
      {data.strip?.kind === "stories" ? (
        <StripFrame title={data.strip.title}>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
            {data.strip.stories.map((s) => (
              <li key={s.href}>
                <Link prefetch={false} href={s.href} className="story block">
                  <span className="block text-xs text-muted">
                    {s.kicker} · {s.date}
                  </span>
                  <span className="headline mt-0.5 line-clamp-2 block text-md">{s.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </StripFrame>
      ) : null}
      {data.strip?.kind === "calcs" ? (
        <StripFrame title={data.strip.title}>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
            {data.strip.calcs.map((c) => (
              <li key={c.href}>
                <Link prefetch={false} href={c.href} className="link-row block py-1">
                  <span className="link-row-label block text-sm">{c.label}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{c.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </StripFrame>
      ) : null}
    </div>
  );
}
