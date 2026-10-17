import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionMasthead } from "@/components/listing/section-masthead";
import { getPhotoCredits } from "@/lib/content";
import { getIpos } from "@/lib/ipo";

export const metadata: Metadata = {
  title: "Photo Credits",
  description: "Credits and licences for the third-party photographs used on TradeTarget.",
  alternates: { canonical: "/photo-credits/" },
};

const SITE_USES: Record<string, { label: string; href: string }[]> = {
  "mumbai-skyline-night": [{ label: "About us", href: "/about/" }],
  "writer-laptop": [{ label: "Hire our writers", href: "/hire-writers/" }],
};

export default function PhotoCreditsPage() {
  const credits = getPhotoCredits();
  const ipos = getIpos();
  return (
    <>
      <SectionMasthead
        title="Photo credits"
        crumbs={[{ label: "Home", href: "/" }]}
        description="Photographs below come from Wikimedia Commons and are used under the licence shown. Graphics on other stories are TradeTarget’s own, carried over from tradetarget.in. Team photos and client logos belong to TradeTarget and the respective companies."
        aside={
          <p className="tabular shrink-0 border-l border-rule-strong pl-4 md:text-right">
            <span className="block text-3xl font-semibold leading-none text-ink">{credits.length}</span>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-caps text-muted">photographs credited</span>
          </p>
        }
      />
    <div className="wrap pt-8">
      <p className="scroll-hint mb-3">Swipe the table sideways for every column</p>
      {/* Scrolls sideways on phones; focusable so keyboard users can scroll it too */}
      <div className="table-wrap" role="region" aria-label="Photo credits table" tabIndex={0}>
        <table className="data-table min-w-[56rem]">
          <caption className="sr-only">Photographs used on TradeTarget, with photographer, licence and the pages they appear on</caption>
          <thead>
            <tr>
              <th scope="col" className="w-36">
                Photo
              </th>
              <th scope="col">Subject and source</th>
              <th scope="col">Photographer</th>
              <th scope="col">Licence</th>
              <th scope="col">Used on</th>
            </tr>
          </thead>
          <tbody>
            {credits.map((c) => {
              const uses = [
                ...c.usedOn.map((p) => ({ label: p.replace(/^\/|\/$/g, "").split("/").at(-1)!.replace(/-/g, " "), href: p })),
                ...ipos.filter((i) => i.photo === c.id).map((i) => ({ label: `${i.name} IPO`, href: `/ipo/${i.slug}/` })),
                ...(SITE_USES[c.id] ?? []),
              ];
              return (
                <tr key={c.id}>
                  <td>
                    <div className="photo-frame w-28" style={{ aspectRatio: `${c.width} / ${c.height}` }}>
                      <div className="photo-wipe">
                        <div className="photo-wipe-inner">
                          <Image src={c.src} alt={c.subject} width={112} height={Math.round((112 * c.height) / c.width)} className="h-full w-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="block text-md font-semibold leading-snug text-ink">{c.subject}</span>
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="link mt-1 inline-block text-xs text-ink-2">
                      {c.title}
                    </a>
                  </td>
                  <td className="text-ink-2">{c.author}</td>
                  <td className="whitespace-nowrap">
                    {c.licenseUrl ? (
                      <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="link">
                        {c.license}
                      </a>
                    ) : (
                      <span className="text-ink-2">{c.license}</span>
                    )}
                  </td>
                  <td>
                    {uses.length ? (
                      <ul className="space-y-1">
                        {uses.map((u) => (
                          <li key={u.href}>
                            <Link href={u.href} className="link capitalize">
                              {u.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
