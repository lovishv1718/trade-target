import Link from "next/link";
import { getSubsections } from "@/lib/content";

export function SubsectionTabs({ active }: { active?: string }) {
  const subs = getSubsections();
  return (
    <nav aria-label="Personal Finance topics" className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1.5 md:flex-wrap">
        <li>
          <Link prefetch={false}
            href="/personal-finance/"
            aria-current={!active ? "page" : undefined}
            className={`block whitespace-nowrap border px-3.5 py-1.5 text-sm font-semibold ${!active ? "border-funds bg-funds text-white" : "border-rule bg-white hover:border-funds"}`}
          >
            All
          </Link>
        </li>
        {subs.map((s) => (
          <li key={s.slug}>
            <Link prefetch={false}
              href={s.path}
              aria-current={active === s.slug ? "page" : undefined}
              className={`block whitespace-nowrap border px-3.5 py-1.5 text-sm font-semibold ${active === s.slug ? "border-funds bg-funds text-white" : "border-rule bg-white hover:border-funds"}`}
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
