import Link from "next/link";
import site from "@/content/site.json";
import { getCalculators, getSubsections } from "@/lib/content";
import { LogoArt } from "../logo";

// The .link-soft look: ink-2, ink and underlined on hover. Compact on a mouse, 44px tall on touch.
const link = "link-soft";
const tapLink = `flex min-h-7 items-center py-0.5 leading-snug pointer-coarse:min-h-11 ${link}`;

export function Footer() {
  const subs = getSubsections();
  const calcs = getCalculators();
  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Markets",
      links: [
        { label: "News", href: "/news/" },
        { label: "Share Analysis", href: "/share-analysis/" },
        { label: "Stock Market IQ", href: "/stock-market-iq/" },
        { label: "Blog Junction", href: "/blog-junction/" },
      ],
    },
    {
      title: "IPO",
      links: [
        { label: "IPO dashboard", href: "/ipo/" },
        { label: "Mainboard IPOs", href: "/ipo/?board=mainboard" },
        { label: "SME IPOs", href: "/ipo/?board=sme" },
        { label: "IPO allotment status", href: "/ipo/nse-ipo-allotment-status/" },
      ],
    },
    { title: "Personal Finance", links: subs.map((s) => ({ label: s.name, href: s.path })) },
    { title: "Calculators", links: calcs.slice(0, 8).map((c) => ({ label: c.name.replace(" Calculator", ""), href: `/calculators/${c.slug}/` })) },
    {
      title: "TradeTarget",
      links: [
        { label: "About us", href: "/about/" },
        { label: "Board of Directors", href: "/board-of-directors/" },
        { label: "Hire our writers", href: "/hire-writers/" },
        { label: "Editorial policy", href: "/editorial-policy/" },
        { label: "Contact us", href: "/contact-us/" },
        { label: "Photo credits", href: "/photo-credits/" },
      ],
    },
  ];

  return (
    <footer className="surface-ink border-t border-rule text-sm text-ink-2">
      <div className="wrap pb-24 pt-10 md:pt-12">
        {/* Identity: mark, what we are, where to follow */}
        <div className="grid gap-6 border-b border-rule pb-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-8">
          <Link href="/" aria-label="TradeTarget home" className="flex items-center gap-2.5">
            <LogoArt variant="mark" height={26} alt="" />
            <span className="pm-wordmark">tradetarget</span>
          </Link>
          <p className="max-w-md text-md leading-normal text-ink-2">{site.tagline}. Finance content writing for brokers, AMCs and fintechs.</p>
          <div>
            <p className="kicker text-muted">Follow us</p>
            <ul className="mt-1.5 flex flex-wrap gap-x-5">
              {site.socials.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className={`flex min-h-8 items-center font-semibold pointer-coarse:min-h-11 ${link}`}>
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sitemap */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="kicker border-b border-rule pb-2 text-ink">{col.title}</h2>
              <ul className="mt-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link prefetch={false} href={l.href} className={tapLink}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-rule pt-6 text-xs leading-relaxed text-muted">
          <p className="max-w-[100ch]">
            <strong className="font-semibold text-ink">Disclaimer:</strong> TradeTarget is a financial news and education platform, not a SEBI-registered
            investment adviser or research analyst, and nothing here is a recommendation to buy, sell or hold. Investments in the securities market are subject to
            market risks; GMP figures are unofficial and calculator results are estimates.{" "}
            <Link prefetch={false} href="/disclaimer/" className="link">
              Read the full disclaimer
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-col gap-2 border-t border-rule pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} TradeTarget, Mumbai. All rights reserved.</p>
            <ul className="-ml-2 flex flex-wrap sm:-mr-2 sm:ml-0">
              <li>
                <Link prefetch={false} href="/privacy-policy/" className={`flex min-h-8 items-center px-2 pointer-coarse:min-h-11 ${link}`}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/terms-and-conditions/" className={`flex min-h-8 items-center px-2 pointer-coarse:min-h-11 ${link}`}>
                  Terms
                </Link>
              </li>
              <li>
                <Link prefetch={false} href="/disclaimer/" className={`flex min-h-8 items-center px-2 pointer-coarse:min-h-11 ${link}`}>
                  Disclaimer
                </Link>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={`flex min-h-8 items-center px-2 pointer-coarse:min-h-11 ${link}`}>
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
