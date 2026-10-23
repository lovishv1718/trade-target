import { getSections } from "@/lib/content";
import { SiteNav } from "./site-nav";
import { Ticker } from "./ticker";

// Short labels in the bar, as in the reference design; the drawer uses the full section names.
const NAV = [
  { label: "News", href: "/news/" },
  { label: "IPO", href: "/ipo/" },
  { label: "Analysis", href: "/share-analysis/" },
  { label: "Market IQ", href: "/stock-market-iq/" },
  { label: "Personal Finance", href: "/personal-finance/" },
  { label: "Calculators", href: "/calculators/" },
  { label: "Blog", href: "/blog-junction/" },
];

export function Header() {
  const sections = getSections();
  const menu = [
    ...sections.map((s) => ({
      label: s.name,
      href: s.path,
      children: "subsections" in s && s.subsections ? s.subsections.map((c) => ({ label: c.name, href: c.path })) : [],
    })),
    { label: "Calculators", href: "/calculators/", children: [] },
    { label: "About us", href: "/about/", children: [] },
  ];
  return (
    <>
      <a href="#main" className="btn sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:px-4">
        Skip to content
      </a>
      <header>
        <Ticker />
      </header>
      {/* Outside <header> so the bar stays sticky for the whole page */}
      <SiteNav items={NAV} menu={menu} />
    </>
  );
}
