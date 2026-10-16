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
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="Photo credits" />
      <header className="mt-4 max-w-3xl">
        <h1 className="headline text-[2.2rem] leading-tight md:text-[2.7rem]">Photo credits</h1>
        <p className="mt-2 text-[1.05rem] text-[#3a4453]">
          Photographs below come from Wikimedia Commons and are used under the licence shown. Graphics on other stories are TradeTarget’s own, carried over from
          tradetarget.in. Team photos and client logos belong to TradeTarget and the respective companies.
        </p>
      </header>
      <div className="table-wrap mt-8">
        <table className="data-table min-w-[880px]">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Subject</th>
              <th>Photographer</th>
              <th>Licence</th>
              <th>Used on</th>
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
                  <td className="w-28">
                    <Image src={c.src} alt={c.subject} width={112} height={Math.round((112 * c.height) / c.width)} className="h-auto w-28 object-cover" />
                  </td>
                  <td>
                    <span className="font-semibold">{c.subject}</span>
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-ipo underline">
                      {c.title}
                    </a>
                  </td>
                  <td>{c.author}</td>
                  <td className="whitespace-nowrap">
                    {c.licenseUrl ? (
                      <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-ipo underline">
                        {c.license}
                      </a>
                    ) : (
                      c.license
                    )}
                  </td>
                  <td className="text-sm">
                    {uses.length ? (
                      <ul className="space-y-0.5">
                        {uses.map((u) => (
                          <li key={u.href}>
                            <Link href={u.href} className="capitalize hover:underline">
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
