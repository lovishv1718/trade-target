import Link from "next/link";
import site from "@/content/site.json";
import { getCalculators, getSubsections } from "@/lib/content";
import { Logo } from "../logo";

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
    <footer className="mt-16 bg-navy-900 text-white/80">
      <div className="wrap py-10">
        <div className="flex flex-col gap-6 border-b border-white/15 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo height={64} inverse />
            <p className="mt-2 max-w-md text-sm text-white/65">{site.tagline}. Finance content writing for brokers, AMCs and fintechs.</p>
          </div>
          <div>
            <p className="kicker text-white/55">Follow us</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {site.socials.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-gold">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-b border-white/15 py-5">
          <p className="text-sm">
            <span className="kicker mr-3 text-gold">Trending</span>
            {site.trending.map((t, i) => (
              <span key={t.href}>
                <Link prefetch={false} href={t.href} className="hover:text-white hover:underline">
                  {t.label}
                </Link>
                {i < site.trending.length - 1 ? <span className="mx-2 text-white/30">|</span> : null}
              </span>
            ))}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-[0.95rem] font-semibold text-white">{col.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link prefetch={false} href={l.href} className="hover:text-white hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 pt-6 text-[0.8rem] leading-relaxed text-white/60">
          <p>
            <strong className="text-white/85">Disclaimer:</strong> TradeTarget is a financial news and education platform. It is not registered with the
            Securities and Exchange Board of India (SEBI) as an investment adviser or research analyst, and nothing on this site is a recommendation to buy,
            sell or hold any security, fund or other product. Investments in the securities market are subject to market risks; read all related documents
            carefully before investing. Past performance does not indicate future returns. Grey market premium (GMP) figures are unofficial, come from market
            sources and can change quickly; they are reported for information only. Calculator results are estimates based on the inputs and assumptions you
            enter. Consult a SEBI-registered investment adviser before making investment decisions.{" "}
            <Link prefetch={false} href="/disclaimer/" className="underline hover:text-white">
              Read the full disclaimer
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} TradeTarget, Mumbai. All rights reserved.</p>
            <p className="flex flex-wrap gap-x-4">
              <Link prefetch={false} href="/privacy-policy/" className="hover:text-white">Privacy</Link>
              <Link prefetch={false} href="/terms-and-conditions/" className="hover:text-white">Terms</Link>
              <Link prefetch={false} href="/disclaimer/" className="hover:text-white">Disclaimer</Link>
              <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
