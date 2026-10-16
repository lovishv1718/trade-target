import type { Metadata } from "next";
import Link from "next/link";
import { AuthorAvatar } from "@/components/article/article-parts";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/photo";
import { SectionHeader } from "@/components/section-header";
import { getAuthors, getPhoto } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description: "TradeTarget is a Mumbai-based financial education platform and finance content agency for investors and financial businesses.",
  alternates: { canonical: "/about/" },
};

const COVERAGE = [
  { title: "Market updates", text: "Timely coverage of stock market trends, IPOs, corporate developments and economic policies that shape the financial landscape." },
  { title: "Fundamentals and global trends", text: "Simplified analysis of company performance, financial statements and valuation, with international markets explained from an Indian perspective." },
  { title: "Financial literacy", text: "Taxation, insurance, budgeting, retirement planning and real estate, explained so individuals can make informed decisions." },
  { title: "Risk awareness", text: "Clear explanations of investment strategies, financial instruments and risk management." },
];

// As published on TradeTarget's current About page
const NUMBERS = [
  { value: "4,00,000+", label: "Readers" },
  { value: "5,00,000+", label: "Subscribers" },
  { value: "200+", label: "Team members" },
  { value: "4.5", label: "Rating" },
];

export default function AboutPage() {
  const photo = getPhoto("mumbai-skyline-night");
  const team = getAuthors();
  return (
    <div className="wrap pb-16 pt-5 md:pb-20 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="About us" />

      {/* Masthead: kicker and title set flush left, the paper's figures in a ruled ledger beside them */}
      <header className="mt-6 grid gap-8 border-b border-ink pb-8 md:mt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16">
        <div>
          <p className="kicker text-muted">About TradeTarget</p>
          <h1 className="headline mt-3 max-w-[20ch] text-3xl md:text-4xl lg:text-5xl">Financial understanding for investors. Finance content for businesses.</h1>
        </div>
        <dl className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4 lg:grid-cols-2" aria-label="TradeTarget in figures">
          {NUMBERS.map((n) => (
            <div key={n.label} className="bg-white px-4 py-3.5">
              <dt className="text-xs text-muted">{n.label}</dt>
              <dd className="mt-1.5 text-2xl font-semibold leading-none tabular-nums text-ink md:text-3xl">{n.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <figure className="mt-6 md:mt-8">
        <Photo image={photo} sizes="(min-width: 1240px) 1208px, 100vw" aspect="aspect-[16/9] md:aspect-[21/8]" priority />
        <figcaption className="mt-2 text-xs text-muted">Mumbai skyline. Photo: {photo?.credit}</figcaption>
      </figure>

      <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="article-body max-w-[66ch]">
          <p className="text-xl! leading-normal! text-ink!">
            TradeTarget is based in Mumbai, the financial capital of India. We serve individual investors and financial businesses through two verticals: financial education and specialised content services.
          </p>
          <p>
            We work where financial expertise, content strategy and digital communication meet, with a focus on accuracy, clarity and value. Our work reflects a close understanding of financial markets, of what investors need, and of the content demands on modern financial businesses.
          </p>
          <h2>Our mission</h2>
          <ul>
            <li>Help individuals make informed financial decisions.</li>
            <li>Deliver well-researched content for businesses.</li>
            <li>Keep everything we publish clear, credible and consistent.</li>
          </ul>
          <h2>Our vision</h2>
          <p>
            To be the knowledge partner individuals turn to for clarity in finance, and the content provider institutions rely on to communicate in the finance and investment space, contributing to a more financially aware and confident society.
          </p>
        </div>
        <aside className="lg:pt-1">
          <div className="border-t border-ink pt-4">
            <p className="kicker text-ink">Content services</p>
            <p className="mt-2 text-lg font-semibold leading-snug text-ink">We write for fintechs, stockbrokers, wealth managers and AMCs.</p>
            <Link href="/hire-writers/" className="link-more mt-2">
              Hire our writers <span className="arrow" aria-hidden>→</span>
            </Link>
          </div>
        </aside>
      </div>

      <section className="mt-14 md:mt-16" aria-label="What we cover">
        <SectionHeader title="What we cover" />
        <ol className="mt-1 grid sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-0">
          {COVERAGE.map((c, i) => (
            <li key={c.title} className="grid grid-cols-[2rem_minmax(0,1fr)] border-b border-rule py-4 sm:block lg:border-b-0 lg:border-l lg:px-5 lg:py-5 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
              <span className="text-sm font-semibold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-base font-semibold text-ink sm:mt-1.5">{c.title}</h3>
                <p className="mt-1.5 text-md leading-normal text-ink-2">{c.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 md:mt-16" aria-label="Leadership">
        <SectionHeader title="Leadership" href="/board-of-directors/" linkLabel="Board of Directors" />
        <ul className="mt-1 grid sm:grid-cols-3 sm:gap-x-8">
          {team.map((a) => (
            <li key={a.slug} className="flex items-center gap-4 border-b border-rule py-4 sm:border-b-0">
              <AuthorAvatar author={a} size={72} />
              <div>
                <p className="headline text-lg">
                  <Link href={`/board-of-directors/#${a.slug}`} className="hover:underline hover:underline-offset-2">
                    {a.name}
                  </Link>
                </p>
                <p className="mt-0.5 text-sm text-ink-2">{a.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
