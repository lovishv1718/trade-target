import { getCalculators, getSections } from "@/lib/content";
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

// Groups the full-screen menu lists beside the section names, alongside each section's own subsections
const IPO_LINKS = [
  { label: "IPO dashboard", href: "/ipo/" },
  { label: "Mainboard IPOs", href: "/ipo/?board=mainboard" },
  { label: "SME IPOs", href: "/ipo/?board=sme" },
  { label: "IPO allotment status", href: "/ipo/nse-ipo-allotment-status/" },
];
const ABOUT_LINKS = [
  { label: "About us", href: "/about/" },
  { label: "Board of Directors", href: "/board-of-directors/" },
  { label: "Editorial policy", href: "/editorial-policy/" },
  { label: "Contact us", href: "/contact-us/" },
];

export function Header() {
  const sections = getSections();
  const calcs = getCalculators();
  const menu = [
    ...sections.map((s) => ({
      label: s.name,
      href: s.path,
      children: "subsections" in s && s.subsections ? s.subsections.map((c) => ({ label: c.name, href: c.path })) : s.path === "/ipo/" ? IPO_LINKS : [],
    })),
    { label: "Calculators", href: "/calculators/", children: calcs.slice(0, 8).map((c) => ({ label: c.name.replace(" Calculator", ""), href: `/calculators/${c.slug}/` })) },
    { label: "About us", href: "/about/", children: ABOUT_LINKS },
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
