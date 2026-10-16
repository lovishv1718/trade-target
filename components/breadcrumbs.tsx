import Link from "next/link";
import { JsonLd } from "./json-ld";

export function Breadcrumbs({ items, current }: { items: { label: string; href: string }[]; current?: string }) {
  const all = current ? [...items, { label: current, href: "" }] : items;
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted sm:text-sm">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2">
        {items.map((c) => (
          <li key={c.href} className="flex items-center gap-2">
            <Link
              prefetch={false}
              href={c.href}
              className="inline-flex items-center py-1 underline-offset-2 hover:text-ink hover:underline pointer-coarse:min-h-11"
            >
              {c.label}
            </Link>
            <span aria-hidden className="text-faint">
              /
            </span>
          </li>
        ))}
        {current ? (
          <li aria-current="page" className="min-w-0 max-w-full truncate py-1 text-ink-2 sm:max-w-[60ch]">
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
