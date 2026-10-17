import Link from "next/link";
import { getSubsections } from "@/lib/content";

/** Personal Finance topic tabs. Scrolls sideways on phones with a hard edge; wraps from tablet up. */
export function SubsectionTabs({ active }: { active?: string }) {
  const subs = getSubsections();
  const tabs = [{ slug: "", name: "All", path: "/personal-finance/" }, ...subs];
  return (
    <nav aria-label="Personal Finance topics" className="no-scrollbar -mx-4 overflow-x-auto px-4 py-1 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex gap-2 md:flex-wrap">
        {tabs.map((s) => {
          const current = s.slug ? active === s.slug : !active;
          return (
            <li key={s.path} className="shrink-0">
              <Link prefetch={false} href={s.path} aria-current={current ? "page" : undefined} className="chip">
                {s.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
