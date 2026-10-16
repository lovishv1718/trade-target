import Link from "next/link";
import type { CSSProperties } from "react";
import site from "@/content/site.json";
import { getSections } from "@/lib/content";
import { Logo, logoClearSpace } from "../logo";
import { SearchTrigger } from "../search/search-trigger";
import { MainNav } from "./main-nav";
import { Ticker } from "./ticker";
import { UtilityBar } from "./utility-bar";

// The stacked lockup at two sizes: compact on phones, full masthead from tablet up.
const LOGO_SM = 44;
const LOGO_LG = 64;
// Vertical breathing room never drops below the lockup's own clear space.
const mastheadPad = {
  "--hdr-pad-sm": `${Math.max(10, logoClearSpace(LOGO_SM))}px`,
  "--hdr-pad-lg": `${Math.max(12, logoClearSpace(LOGO_LG))}px`,
} as CSSProperties;

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
        <a href="#main" className="btn sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:px-4">
          Skip to content
        </a>
        <UtilityBar />
        {/* Observed by the main nav: once this row has scrolled away, the nav shows the bull mark */}
        <div id="masthead" className="bg-white">
          <div className="wrap flex items-center justify-between gap-4 py-(--hdr-pad-sm) md:py-(--hdr-pad-lg)" style={mastheadPad}>
            <div className="flex min-w-0 items-center gap-5">
              <span className="flex md:hidden">
                <Logo height={LOGO_SM} eager />
              </span>
              <span className="hidden md:flex">
                <Logo height={LOGO_LG} eager />
              </span>
              <p className="hidden max-w-52 border-l border-rule py-1 pl-5 text-sm leading-snug text-muted lg:block">
                Markets, IPOs and personal finance from Mumbai
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <SearchTrigger variant="box" />
              <Link href="/#newsletter" className="btn btn-secondary btn-sm">
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
