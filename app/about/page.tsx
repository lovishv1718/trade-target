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
    <>
      <div className="wrap pt-5 md:pt-7">
        <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="About us" />
      </div>
      <section className="relative mt-5">
        <Photo image={photo} sizes="100vw" aspect="aspect-[16/9] md:aspect-[21/8]" priority />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-950/85 via-navy-950/35 to-transparent">
          <div className="wrap pb-8">
            <p className="kicker text-gold">About TradeTarget</p>
            <h1 className="headline mt-2 max-w-3xl text-[2.2rem] leading-[1.1] text-white md:text-[3.2rem]">Financial understanding for investors. Finance content for businesses.</h1>
          </div>
        </div>
        <p className="wrap mt-2 text-xs text-muted">Mumbai skyline. Photo: {photo?.credit}</p>
      </section>

      <div className="wrap mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="article-body">
          <p className="!text-[1.25rem] leading-relaxed">
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
        <aside>
          <dl className="grid grid-cols-2 gap-px border border-rule bg-rule">
            {NUMBERS.map((n) => (
              <div key={n.label} className="bg-white p-5">
                <dt className="text-sm text-muted">{n.label}</dt>
                <dd className="headline mt-1 text-[2rem] leading-none">{n.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t-[3px] border-accent bg-white p-5">
            <p className="kicker text-accent-ink">Content services</p>
            <p className="mt-1 font-semibold">We write for fintechs, stockbrokers, wealth managers and AMCs.</p>
            <Link href="/hire-writers/" className="mt-3 inline-block text-sm font-semibold text-accent-ink hover:underline">
              Hire our writers →
            </Link>
          </div>
        </aside>
      </div>

      <section className="wrap mt-14" aria-label="What we cover">
        <SectionHeader title="What we cover" />
        <div className="mt-5 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {COVERAGE.map((c, i) => (
            <div key={c.title} className="bg-white p-5">
              <span className="font-serif text-2xl font-semibold text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-[0.95rem] text-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap mt-14" aria-label="Leadership">
        <SectionHeader title="Leadership" href="/board-of-directors/" linkLabel="Board of Directors" />
        <ul className="mt-5 grid gap-6 sm:grid-cols-3">
          {team.map((a) => (
            <li key={a.slug} className="flex items-center gap-4">
              <AuthorAvatar author={a} size={72} />
              <div>
                <p className="headline text-lg">{a.name}</p>
                <p className="text-sm font-semibold text-accent-ink">{a.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
