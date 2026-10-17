import Link from "next/link";
import type { CSSProperties } from "react";
import site from "@/content/site.json";
import { getArticleCards, getArticlesBySection, getCalculators, getEditorial, getSections, toCard, type ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getIpos, istToday, priceBandLabel } from "@/lib/ipo";
import { Logo, logoClearSpace } from "../logo";
import type { MegaColumn, MegaIpo, MegaPanelData, MegaStory } from "./mega-menu";
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

const story = (a: ArticleCard): MegaStory => ({ kicker: a.kicker, title: a.title, href: a.path, date: formatDate(a.date) });
const link = (a: ArticleCard, strip?: RegExp) => ({ label: strip ? a.title.replace(strip, "") : a.title, href: a.path });

/** Split a list into two columns of at most `per` links each. */
function twoColumns(title: string, links: { label: string; href: string }[], per = 5): MegaColumn[] {
  const first = links.slice(0, per);
  const second = links.slice(per, per * 2);
  return second.length ? [{ title, links: first }, { title: `${title}, continued`, links: second }] : [{ title, links: first }];
}

/** What each top-level section holds, for the mega menu. Built at build time from the content. */
function megaMenu(): Record<string, MegaPanelData> {
  const sections = Object.fromEntries(getSections().map((s) => [s.slug, s]));
  const bySection = (slug: string) => getArticlesBySection(slug).map(toCard);
  const topics = getEditorial().newsTopics;
  const news = getArticleCards().filter((a) => a.section === "news" || topics.includes(a.kicker));
  const calcs = getCalculators();
  const categories = [...new Set(calcs.map((c) => c.category))];
  const pf = sections["personal-finance"];
  const pfStories = bySection("personal-finance");
  const latest = (list: ArticleCard[]) => ({ kind: "stories" as const, title: "Latest", stories: list.slice(0, 3).map(story) });

  return {
    "/news/": {
      title: "News", description: sections.news.description, href: "/news/", cta: "All news", rule: "var(--color-ink)", tone: "text-ink",
      columns: [{ title: "Topics", links: topics.map((t) => ({ label: t, href: `/news/?topic=${encodeURIComponent(t)}` })) }, { title: "Recent", links: news.slice(3, 8).map((a) => link(a)) }],
      strip: latest(news),
    },
    "/ipo/": {
      title: "IPO", description: sections.ipo.description, href: "/ipo/", cta: "IPO dashboard", rule: "var(--color-ipo)", tone: "text-ipo",
      columns: [
        { title: "Dashboard", links: [{ label: "All IPOs", href: "/ipo/" }, { label: "Mainboard IPOs", href: "/ipo/?board=mainboard" }, { label: "SME IPOs", href: "/ipo/?board=sme" }, { label: "IPO allotment status", href: "/ipo/nse-ipo-allotment-status/" }] },
        { title: "Coverage", links: bySection("ipo").slice(0, 5).map((a) => link(a)) },
      ],
      strip: { kind: "ipos" },
    },
    "/share-analysis/": {
      title: "Share Analysis", description: sections["share-analysis"].description, href: "/share-analysis/", cta: "All share analysis", rule: "var(--color-company-mark)", tone: "text-company",
      columns: twoColumns("Companies covered", bySection("share-analysis").map((a) => link(a, / Fundamental Analysis$/i))),
      strip: latest(bySection("share-analysis")),
    },
    "/stock-market-iq/": {
      title: "Stock Market IQ", description: sections["stock-market-iq"].description, href: "/stock-market-iq/", cta: "All explainers", rule: "var(--color-learn)", tone: "text-learn",
      columns: twoColumns("Explainers", bySection("stock-market-iq").map((a) => link(a))),
      strip: latest(bySection("stock-market-iq")),
    },
    "/personal-finance/": {
      title: "Personal Finance", description: pf.description, href: "/personal-finance/", cta: "All personal finance", rule: "var(--color-money)", tone: "text-money",
      columns: (pf.subsections ?? []).map((sub) => ({
        title: sub.name,
        href: sub.path,
        links: pfStories.filter((a) => a.subsection === sub.slug).slice(0, 2).map((a) => link(a)),
      })),
      strip: latest(pfStories),
    },
    "/blog-junction/": {
      title: "Blog Junction", description: sections["blog-junction"].description, href: "/blog-junction/", cta: "All of Blog Junction", rule: "var(--color-money)", tone: "text-money",
      columns: twoColumns("Reads", bySection("blog-junction").map((a) => link(a))),
      strip: latest(bySection("blog-junction")),
    },
    "/calculators/": {
      title: "Calculators", description: `${calcs.length} calculators for ${categories.join(", ").toLowerCase()}.`, href: "/calculators/", cta: "All calculators", rule: "var(--color-learn)", tone: "text-learn",
      columns: categories.map((cat) => ({ title: cat, links: calcs.filter((c) => c.category === cat).map((c) => ({ label: c.name.replace(" Calculator", ""), href: `/calculators/${c.slug}/` })) })),
      // The same three the calculators index leads with
      strip: {
        kind: "calcs",
        title: "Most used",
        calcs: ["sip-calculator", "income-tax-calculator", "home-loan-emi-calculator"]
          .map((slug) => calcs.find((c) => c.slug === slug))
          .filter((c) => c !== undefined)
          .map((c) => ({ label: c.name, href: `/calculators/${c.slug}/`, note: c.short })),
      },
    },
  };
}

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
  const ipos: MegaIpo[] = getIpos().map((i) => ({ slug: i.slug, name: i.name, dates: i.dates, band: priceBandLabel(i) }));
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
      <MainNav items={site.nav} menu={menu} mega={megaMenu()} ipos={ipos} buildDate={istToday()} />
      <Ticker />
    </>
  );
}
