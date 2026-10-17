import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
    <div className="wrap pb-16 pt-5 md:pb-20 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="Photo credits" />
      <header className="mt-6 grid gap-4 border-b border-ink pb-6 md:mt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div className="max-w-3xl">
          <h1 className="headline text-3xl md:text-4xl">Photo credits</h1>
          <p className="mt-3 max-w-[66ch] text-lg leading-normal text-ink-2">
            Photographs below come from Wikimedia Commons and are used under the licence shown. Graphics on other stories are TradeTarget’s own, carried over from
            tradetarget.in. Team photos and client logos belong to TradeTarget and the respective companies.
          </p>
        </div>
        <p className="text-sm tabular-nums text-muted">
          <span className="font-semibold text-ink">{credits.length}</span> photographs credited
        </p>
      </header>
      {/* Scrolls sideways on phones; focusable so keyboard users can scroll it too */}
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0" role="region" aria-label="Photo credits table" tabIndex={0}>
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm tabular-nums">
          <caption className="sr-only">Photographs used on TradeTarget, with photographer, licence and the pages they appear on</caption>
          <thead>
            <tr className="border-b border-rule-strong text-xs text-muted">
              <th scope="col" className="w-36 py-3 pr-5 font-semibold">
                Photo
              </th>
              <th scope="col" className="py-3 pr-5 font-semibold">
                Subject and source
              </th>
              <th scope="col" className="py-3 pr-5 font-semibold">
                Photographer
              </th>
              <th scope="col" className="py-3 pr-5 font-semibold">
                Licence
              </th>
              <th scope="col" className="py-3 font-semibold">
                Used on
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {credits.map((c) => {
              const uses = [
                ...c.usedOn.map((p) => ({ label: p.replace(/^\/|\/$/g, "").split("/").at(-1)!.replace(/-/g, " "), href: p })),
                ...ipos.filter((i) => i.photo === c.id).map((i) => ({ label: `${i.name} IPO`, href: `/ipo/${i.slug}/` })),
                ...(SITE_USES[c.id] ?? []),
              ];
              return (
                <tr key={c.id} className="align-top">
                  <td className="py-4 pr-5">
                    <Image
                      src={c.src}
                      alt={c.subject}
                      width={112}
                      height={Math.round((112 * c.height) / c.width)}
                      className="img-fade h-auto w-28 bg-paper-2 object-cover"
                    />
                  </td>
                  <td className="py-4 pr-5">
                    <span className="block text-md font-semibold leading-snug text-ink">{c.subject}</span>
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="link mt-1 inline-block text-xs text-ink-2">
                      {c.title}
                    </a>
                  </td>
                  <td className="py-4 pr-5 text-ink-2">{c.author}</td>
                  <td className="whitespace-nowrap py-4 pr-5">
                    {c.licenseUrl ? (
                      <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="link">
                        {c.license}
                      </a>
                    ) : (
                      <span className="text-ink-2">{c.license}</span>
                    )}
                  </td>
                  <td className="py-4">
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
  );
}
