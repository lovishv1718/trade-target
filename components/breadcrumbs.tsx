import Link from "next/link";
import { JsonLd } from "./json-ld";

export function Breadcrumbs({ items, current }: { items: { label: string; href: string }[]; current?: string }) {
  const all = current ? [...items, { label: current, href: "" }] : items;
  return (
    <nav aria-label="Breadcrumb" className="text-[0.82rem] text-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((c) => (
          <li key={c.href} className="flex items-center gap-1.5">
            <Link prefetch={false} href={c.href} className="hover:text-ink hover:underline">
              {c.label}
            </Link>
            <span aria-hidden className="text-ink/25">
              /
            </span>
          </li>
        ))}
        {current ? (
          <li aria-current="page" className="line-clamp-1 max-w-[50ch] text-ink/70">
            {current}
          </li>
        ) : null}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: `https://tradetarget.in${c.href}` } : {}),
          })),
        }}
      />
    </nav>
  );
}
