import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import hire from "@/content/hire.json";
import { AuthorAvatar } from "@/components/article/article-parts";
import { BriefForm } from "@/components/brief-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/photo";
import { SectionHeader } from "@/components/section-header";
import { getArticlesBySlugs, getAuthor, getPhoto } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hire Our Writers: Finance Content Writing Agency in Mumbai",
  description: "Finance content for stockbrokers, AMCs, banks and fintechs: articles, website copy, newsletters, video scripts and more, written by market specialists.",
  alternates: { canonical: "/hire-writers/" },
};

export default function HireWritersPage() {
  const photo = getPhoto("writer-laptop");
  return (
    <>
      <div className="wrap pt-5 md:pt-7">
        <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="Hire our writers" />
      </div>

      {/* Intro: the pitch flush left, a photograph beside it */}
      <section className="wrap mt-6 grid gap-8 md:mt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="border-t-3 border-company-mark pt-5">
          <p className="kicker text-muted">TradeTarget content services</p>
          <h1 className="headline mt-3 max-w-[22ch] text-3xl md:text-4xl lg:text-5xl">Finance writing for brokers, AMCs and fintechs</h1>
          <p className="deck mt-4 max-w-[60ch] text-xl leading-normal">{hire.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#brief" className="btn">
              Send a brief <span className="arrow" aria-hidden>→</span>
            </a>
            <a href="mailto:business@tradetarget.in" className="btn btn-secondary">
              business@tradetarget.in
            </a>
          </div>
        </div>
        <Photo image={photo} sizes="(min-width: 1024px) 560px, 100vw" crop="compact" priority caption="credit" />
      </section>

      {/* Clients: every logo in a hairline ledger */}
      <section className="wrap mt-14 md:mt-16" aria-labelledby="clients-heading">
        <div className="section-head">
          <h2 id="clients-heading" className="section-title">
            Teams we have written for
          </h2>
        </div>
        <ul className="grid grid-cols-3 border-l border-rule lg:grid-cols-9">
          {hire.clients.map((c) => (
            <li key={c.name} className="flex flex-col items-center justify-center gap-2 border-b border-r border-rule bg-white px-2 py-4 text-center">
              <Image src={c.logo} alt={c.name} width={72} height={72} className="img-fade h-14 w-14 object-contain grayscale hover:grayscale-0 md:h-16 md:w-16" />
              <span className="text-2xs font-semibold leading-tight text-muted">{c.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Services: ruled lists, not cards */}
      <section className="wrap mt-14 grid gap-12 md:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16" aria-label="Services">
        <div>
          <SectionHeader title="What we write about" />
          <div className="mt-2 space-y-7">
            {hire.services.map((s) => (
              <div key={s.name}>
                <h3 className="pt-2 text-base font-semibold text-ink">{s.name}</h3>
                <ul className="mt-2 divide-y divide-rule border-y border-rule text-md text-ink-2">
                  {s.items.map((i) => (
                    <li key={i} className="py-2.5">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader title="Content we deliver" />
          <dl className="mt-2 divide-y divide-rule border-b border-rule">
            {hire.contentTypes.map((t) => (
              <div key={t.name} className="grid gap-0.5 py-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-6">
                <dt className="text-md font-semibold text-ink">{t.name}</dt>
                <dd className="text-md text-muted">{t.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Writers and sample work: columns divided by hairlines */}
      <section className="wrap mt-14 md:mt-16" aria-label="Writers">
        <SectionHeader title="Who writes for you" />
        <div className="mt-2 grid md:grid-cols-3">
          {hire.writers.map((w) => {
            const a = getAuthor(w.author);
            const samples = getArticlesBySlugs(w.samples);
            return (
              <article key={w.author} className="flex flex-col border-b border-rule py-6 md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
                <div className="flex items-center gap-4">
                  <AuthorAvatar author={a} size={64} />
                  <div>
                    <h3 className="headline text-xl">
                      <Link href={`/author/${a.slug}/`} className="link-quiet">
                        {a.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-sm text-ink-2">{a.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-md font-semibold text-ink">{w.focus}</p>
                <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Expertise">
                  {a.expertise.map((e) => (
                    <li key={e} className="tag">
                      {e}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 border-t border-rule pt-3">
                  <p className="kicker text-muted">{samples.length ? "Recent work" : "Leads"}</p>
                  {samples.length ? (
                    <ul className="mt-1 divide-y divide-rule text-md leading-snug">
                      {samples.map((s) => (
                        <li key={s.slug} className="py-2">
                          <Link href={s.path} className="link">
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : "deskLink" in w && w.deskLink ? (
                    <Link href={w.deskLink.href} className="link-more mt-0.5">
                      {w.deskLink.label} <span className="arrow" aria-hidden>→</span>
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Process: a black band, steps numbered with tabular figures */}
      <section className="surface-ink band band-tool mt-16" aria-labelledby="process-heading">
        <div className="wrap">
          <div className="section-head" style={{ ["--rule-color" as string]: "var(--color-company-mark)" }}>
            <h2 id="process-heading" className="section-title md:text-3xl">
              How it works
            </h2>
          </div>
          <ol className="grid md:grid-cols-3">
            {hire.process.map((p, i) => (
              <li key={p.step} className="border-b border-rule py-6 md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
                <span className="text-3xl font-semibold leading-none tabular-nums text-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{p.step}</h3>
                <p className="mt-1.5 max-w-[46ch] text-md leading-relaxed text-ink-2">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The brief: the page's main action */}
      <section id="brief" className="wrap mt-16 grid scroll-mt-20 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-14" aria-labelledby="brief-heading">
        <div className="border-t-3 border-ink pt-5">
          <h2 id="brief-heading" className="headline text-3xl md:text-4xl">
            Send a brief
          </h2>
          <p className="mt-3 max-w-[46ch] text-lg leading-normal text-ink-2">Tell us what you need. An editor replies within one working day with a suggested writer and an outline.</p>
          <dl className="mt-6 divide-y divide-rule border-y border-rule">
            <div className="grid gap-0.5 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm text-muted">Email</dt>
              <dd className="text-md font-semibold text-ink">
                <a href="mailto:business@tradetarget.in" className="link break-all">
                  business@tradetarget.in
                </a>
              </dd>
            </div>
            <div className="grid gap-0.5 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm text-muted">Based in</dt>
              <dd className="text-md font-semibold text-ink">Mumbai, Maharashtra</dd>
            </div>
          </dl>
        </div>
        <div className="lg:pt-0">
          <BriefForm contentTypes={hire.formOptions.contentTypes} volumes={hire.formOptions.volumes} />
        </div>
      </section>
    </>
  );
}
