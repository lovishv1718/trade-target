import Link from "next/link";
import site from "@/content/site.json";
import { getPhoto } from "@/lib/content";
import { LogoArt } from "../logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Coverage",
    links: [
      { label: "News", href: "/news/" },
      { label: "IPO", href: "/ipo/" },
      { label: "Share Analysis", href: "/share-analysis/" },
      { label: "Stock Market IQ", href: "/stock-market-iq/" },
      { label: "Personal Finance", href: "/personal-finance/" },
      { label: "Blog Junction", href: "/blog-junction/" },
      { label: "Calculators", href: "/calculators/" },
    ],
  },
  {
    title: "IPO desk",
    links: [
      { label: "All IPOs", href: "/ipo/" },
      { label: "Open now", href: "/ipo/?status=open" },
      { label: "Upcoming", href: "/ipo/?status=upcoming" },
      { label: "Recently listed", href: "/ipo/?status=listed" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Content services", href: "/hire-writers/" },
      { label: "Work with us", href: "/hire-writers/#brief" },
      { label: "About", href: "/about/" },
      { label: "Editorial policy", href: "/editorial-policy/" },
      { label: "Contact", href: "/contact-us/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy/" },
      { label: "Disclaimer", href: "/disclaimer/" },
      { label: "Terms and conditions", href: "/terms-and-conditions/" },
    ],
  },
];

/**
 * The footer: a closing line with the two ways to stay, the site's map in a ruled grid set in the
 * serif, the disclaimer, and the photo credits folded away. Room is left under the last row for
 * the assistant button.
 */
export function Footer() {
  const hero = getPhoto("bse-building");
  return (
    <footer className="surface-ink">
      <div className="wrap pb-24 pt-20 md:pt-28">
        <p className="font-serif text-[3.5rem] leading-[0.95] tracking-[-0.03em] text-white md:text-[6rem]">
          <span className="block">Read the market</span>
          <em className="block text-[#8d8983]">clearly.</em>
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link prefetch={false} href="/#newsletter" className="btn min-h-16 px-9 text-sm">
            Get the daily brief
          </Link>
          <Link prefetch={false} href="/hire-writers/" className="btn btn-secondary min-h-16 px-9 text-sm">
            Content services <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-16 grid border border-[#2f2d2a] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          <div className="border-b border-[#2f2d2a] px-8 py-9 sm:col-span-2 lg:col-span-1 lg:border-b-0 lg:border-r">
            <Link href="/" aria-label="TradeTarget home" className="inline-flex flex-col gap-3">
              <LogoArt variant="mark" height={30} alt="" />
              <span className="font-serif text-[2.125rem] leading-none tracking-[-0.03em] text-white">tradetarget</span>
            </Link>
            <p className="mt-5 max-w-[22rem] font-serif text-lg leading-relaxed text-[#a6a29b]">
              Indian markets, IPOs and personal finance, explained in plain language by the team behind TradeTarget’s content services.
            </p>
          </div>
          {COLUMNS.map((col, i) => (
            <nav key={col.title} aria-label={col.title} className={`px-8 py-9 ${i ? "border-t border-[#2f2d2a] sm:border-t-0 sm:border-l lg:border-l" : ""} ${i === 2 ? "sm:border-l-0 sm:border-t lg:border-t-0 lg:border-l" : ""} ${i === 3 ? "sm:border-t lg:border-t-0" : ""}`}>
              <h2 className="hm-foot-head">{col.title}</h2>
              <ul className="mt-5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link prefetch={false} href={l.href} className="hm-foot-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {col.title === "Legal" ? (
                  <li>
                    <a href={`mailto:${site.email}`} className="hm-foot-link">
                      {site.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 max-w-[72rem] font-serif text-lg leading-relaxed text-[#a6a29b]">
          TradeTarget publishes information for education only. Nothing on this site is investment advice or a recommendation to buy, sell or hold any security. Grey market premium is
          unofficial and indicative, and is not a guarantee of listing price. Consult a SEBI-registered adviser before making investment decisions.{" "}
          <Link prefetch={false} href="/disclaimer/" className="underline decoration-[#5a5753] underline-offset-4 hover:text-white">
            Read the full disclaimer
          </Link>
          .
        </p>
        <div className="mt-8 flex flex-wrap justify-between gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.16em] text-[#8d8983]">
          <p>© {new Date().getFullYear()} TradeTarget · All rights reserved</p>
          <p>Market values are indicative and may be delayed</p>
        </div>
        <details className="group mt-5">
          <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-white [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="text-[0.625rem] transition-transform group-open:rotate-90">
              ▶
            </span>
            Photo credits
          </summary>
          <p className="mt-3 max-w-[60rem] text-sm leading-relaxed text-[#a6a29b]">
            {hero ? <>Home page photograph: {hero.credit}. </> : null}
            Pictures are TradeTarget’s own or used under the licences listed on the{" "}
            <Link prefetch={false} href="/photo-credits/" className="underline underline-offset-4 hover:text-white">
              photo credits page
            </Link>
            .
          </p>
        </details>
      </div>
    </footer>
  );
}
