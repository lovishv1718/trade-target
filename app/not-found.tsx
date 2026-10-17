import Link from "next/link";
import { getArticleCards, getSections } from "@/lib/content";
import { SearchTrigger } from "@/components/search/search-trigger";
import { SectionHeader } from "@/components/section-header";
import { StoryLink } from "@/components/story";

export default function NotFound() {
  const latest = getArticleCards().slice(0, 5);
  const sections = [...getSections().map((s) => ({ label: s.name, href: s.path })), { label: "Calculators", href: "/calculators/" }];
  return (
    <div className="wrap pb-16 pt-8 md:pb-20 md:pt-12">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Set like a printed correction notice: a boxed, ruled panel rather than a centred hero */}
        <section aria-labelledby="nf-title" className="max-w-3xl self-start border border-ink bg-white">
          <p className="kicker flex items-center justify-between gap-4 border-b border-ink px-5 py-2.5 text-ink md:px-7">
            <span>Error 404</span>
            <span className="font-semibold normal-case tracking-normal text-muted">Page not found</span>
          </p>
          <div className="px-5 pb-6 pt-5 md:px-7 md:pb-8 md:pt-6">
            <h1 id="nf-title" className="headline text-3xl md:text-4xl">
              We couldn’t find that page
            </h1>
            <p className="mt-3 max-w-[60ch] text-lg leading-normal text-ink-2">
              The link may be old, or the page may have moved. Try the search (press <kbd className="border border-rule-strong bg-paper px-1.5 font-sans text-sm text-ink">/</kbd>), or start from a
              section below.
            </p>

            <div className="mt-5">
              <SearchTrigger variant="box" />
              {/* The box trigger is desktop-only; on phones the icon trigger is stretched into a full-width field */}
              <div className="relative md:hidden [&>button]:h-12 [&>button]:w-full [&>button]:justify-start [&>button]:border [&>button]:border-rule-strong [&>button]:bg-paper [&>button]:px-3.5 [&>button]:text-ink [&>button]:hover:border-ink [&>button]:hover:bg-paper">
                <SearchTrigger variant="icon" />
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-11 flex items-center text-base text-muted">
                  Search stories, IPOs, calculators
                </span>
              </div>
            </div>

            <nav aria-labelledby="nf-sections" className="mt-8">
              <h2 id="nf-sections" className="kicker text-muted">
                Start from a section
              </h2>
              <ul className="mt-2 grid border-t border-rule sm:grid-cols-2 sm:gap-x-8">
                {sections.map((s) => (
                  <li key={s.href} className="border-b border-rule">
                    <Link href={s.href} className="group flex min-h-11 items-center justify-between gap-3 py-2 text-md font-semibold text-ink hover:underline hover:underline-offset-2">
                      {s.label}
                      <span aria-hidden className="text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link href="/" className="btn mt-7">
              Go to the home page
            </Link>
          </div>
        </section>

        <aside aria-label="Latest stories">
          <SectionHeader title="Latest stories" href="/news/" linkLabel="Latest news" />
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
