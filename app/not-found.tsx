import Link from "next/link";
import { getArticleCards, getSections } from "@/lib/content";
import { SearchTrigger } from "@/components/search/search-trigger";
import { SectionHeader } from "@/components/section-header";
import { StoryLink } from "@/components/story";

export default function NotFound() {
  const latest = getArticleCards().slice(0, 5);
  const sections = [...getSections().map((s) => ({ label: s.name, href: s.path })), { label: "Calculators", href: "/calculators/" }];
  return (
    <div className="wrap pt-8 md:pt-12">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Set like a printed correction notice: a boxed, ruled panel rather than a centred hero */}
        <section aria-labelledby="nf-title" className="max-w-3xl self-start border border-ink bg-white">
          <p className="surface-ink kicker flex items-center justify-between gap-4 px-5 py-2.5 md:px-7">
            <span className="tabular">Error 404</span>
            <span className="font-semibold normal-case tracking-normal text-muted">Page not found</span>
          </p>
          <div className="px-5 pb-6 pt-5 md:px-7 md:pb-8 md:pt-6">
            <h1 id="nf-title" className="headline text-balance text-4xl md:text-5xl">
              We couldn’t find that page
            </h1>
            <p className="deck mt-3 max-w-[60ch] text-xl leading-normal">
              The link may be old, or the page may have moved. Try the search (press <kbd className="border border-rule-strong bg-paper px-1.5 font-sans text-sm text-ink">/</kbd>), or start from a
              section below.
            </p>

            <div className="mt-5">
              <SearchTrigger variant="box" />
              {/* The box trigger is desktop-only; on phones the icon trigger is stretched into a full-width field */}
              <div className="md:hidden">
                <SearchTrigger variant="field" />
              </div>
            </div>

            <nav aria-labelledby="nf-sections" className="mt-8">
              <h2 id="nf-sections" className="kicker text-muted">
                Start from a section
              </h2>
              <ul className="mt-2 grid border-t border-ink sm:grid-cols-2 sm:gap-x-8">
                {sections.map((s) => (
                  <li key={s.href} className="border-b border-rule">
                    <Link href={s.href} className="link-row text-md">
                      <span className="link-row-label">{s.label}</span>
                      <span aria-hidden className="arrow">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link href="/" className="btn mt-7">
              Go to the home page <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <aside aria-label="Latest stories">
          <SectionHeader title="Latest stories" href="/news/" linkLabel="Latest news" pin={false} />
          <div className="divide-y divide-rule">
            {latest.map((s) => (
              <StoryLink key={s.slug} story={s} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
