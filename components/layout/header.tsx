import Link from "next/link";
import site from "@/content/site.json";
import { getSections } from "@/lib/content";
import { Logo } from "../logo";
import { SearchTrigger } from "../search/search-trigger";
import { MainNav } from "./main-nav";
import { Ticker } from "./ticker";
import { UtilityBar } from "./utility-bar";

export function Header() {
  const sections = getSections();
  const menu = [
    ...sections.map((s) => ({
      label: s.name,
      href: s.path,
      children: "subsections" in s && s.subsections ? s.subsections.map((c) => ({ label: c.name, href: c.path })) : [],
    })),
    { label: "Calculators", href: "/calculators/", children: [] },
    { label: "Hire Writers", href: "/hire-writers/", children: [] },
    { label: "About us", href: "/about/", children: [] },
  ];
  return (
    <>
    <header>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <UtilityBar />
      <div className="bg-white">
        <div className="wrap flex items-center justify-between gap-4 py-4 md:py-5">
          <div className="flex min-w-0 flex-col">
            <Logo size="lg" />
            <p className="mt-1 hidden text-[0.8rem] text-muted md:block">Markets, IPOs and personal finance from Mumbai</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <SearchTrigger variant="box" />
            <Link
              href="/#newsletter"
              className="hidden border border-navy px-3.5 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white lg:inline-block"
            >
              Newsletter
            </Link>
          </div>
        </div>
      </div>
    </header>
    {/* Outside <header> so the nav stays sticky for the whole page */}
    <MainNav items={site.nav} menu={menu} />
    <Ticker />
    </>
  );
}
