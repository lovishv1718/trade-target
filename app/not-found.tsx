import Link from "next/link";
import { getArticleCards, getSections } from "@/lib/content";
import { StoryLink } from "@/components/story";

export default function NotFound() {
  const latest = getArticleCards().slice(0, 5);
  return (
    <div className="wrap py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="kicker text-accent-ink">Error 404</p>
          <h1 className="headline mt-2 text-[2.4rem] leading-tight md:text-[3rem]">We couldn’t find that page</h1>
          <p className="mt-3 max-w-lg text-[1.08rem] text-[#3a4453]">
            The link may be old, or the page may have moved. Try the search (press <kbd className="border border-rule bg-white px-1.5 text-sm">/</kbd>), or start from a
            section below.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {[...getSections().map((s) => ({ label: s.name, href: s.path })), { label: "Calculators", href: "/calculators/" }].map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="inline-block border border-rule bg-white px-3.5 py-2 text-sm font-semibold hover:border-navy">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/" className="mt-8 inline-block bg-navy px-5 py-3 font-semibold text-white hover:bg-navy-800">
            Go to the home page
          </Link>
        </div>
        <aside>
          <h2 className="headline section-rule pt-2.5 text-xl">Latest stories</h2>
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
