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

      <section className="wrap mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="kicker text-accent-ink">TradeTarget content services</p>
          <h1 className="headline mt-2 text-[2.3rem] leading-[1.1] md:text-[3rem]">Finance writing for brokers, AMCs and fintechs</h1>
          <p className="mt-4 max-w-xl text-[1.12rem] leading-relaxed text-[#3a4453]">{hire.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#brief" className="bg-accent-ink px-5 py-3 font-semibold text-white hover:bg-accent-700">
              Send a brief
            </a>
            <a href="mailto:business@tradetarget.in" className="border border-navy px-5 py-3 font-semibold text-navy hover:bg-navy hover:text-white">
              business@tradetarget.in
            </a>
          </div>
        </div>
        <figure>
          <Photo image={photo} sizes="(min-width: 1024px) 560px, 100vw" aspect="aspect-[4/3]" priority />
          <figcaption className="mt-2 text-xs text-muted">Photo: {photo?.credit}</figcaption>
        </figure>
      </section>

      <section className="mt-12 border-y border-rule bg-white py-8" aria-labelledby="clients-heading">
        <div className="wrap">
          <h2 id="clients-heading" className="text-center text-sm font-semibold uppercase tracking-wider text-muted">
            Teams we have written for
          </h2>
          <ul className="mt-6 grid grid-cols-3 items-center gap-6 sm:grid-cols-5 lg:grid-cols-9">
            {hire.clients.map((c) => (
              <li key={c.name} className="flex flex-col items-center gap-2 text-center">
                <Image src={c.logo} alt={c.name} width={72} height={72} className="h-16 w-16 object-contain grayscale transition hover:grayscale-0" />
                <span className="text-[0.75rem] font-semibold leading-tight text-muted">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap mt-14 grid gap-10 lg:grid-cols-[1fr_1.3fr]" aria-label="Services">
        <div>
          <SectionHeader title="What we write about" accent="accent" />
          <div className="mt-4 space-y-6">
            {hire.services.map((s) => (
              <div key={s.name}>
                <h3 className="font-semibold">{s.name}</h3>
                <ul className="mt-2 space-y-1.5 text-[0.98rem] text-[#3a4453]">
                  {s.items.map((i) => (
                    <li key={i} className="border-l-2 border-gold pl-3">
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
          <div className="table-wrap mt-4">
            <table className="data-table">
              <tbody>
                {hire.contentTypes.map((t) => (
                  <tr key={t.name}>
                    <td className="font-semibold">{t.name}</td>
                    <td className="text-muted">{t.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="wrap mt-14" aria-label="Writers">
        <SectionHeader title="Who writes for you" />
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {hire.writers.map((w) => {
            const a = getAuthor(w.author);
            const samples = getArticlesBySlugs(w.samples);
            return (
              <article key={w.author} className="flex flex-col border border-rule bg-white p-5">
                <div className="flex items-center gap-4">
                  <AuthorAvatar author={a} size={64} />
                  <div>
                    <h3 className="headline text-xl">
                      <Link href={`/author/${a.slug}/`} className="hover:underline">
                        {a.name}
                      </Link>
                    </h3>
                    <p className="text-sm font-semibold text-accent-ink">{a.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-[0.95rem] font-semibold">{w.focus}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {a.expertise.map((e) => (
                    <li key={e} className="border border-rule px-2 py-0.5 text-xs font-semibold text-muted">
                      {e}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-rule pt-3">
                  <p className="kicker text-muted">{samples.length ? "Recent work" : "Leads"}</p>
                  {samples.length ? (
                    <ul className="mt-1.5 space-y-1.5 text-[0.92rem]">
                      {samples.map((s) => (
                        <li key={s.slug}>
                          <Link href={s.path} className="text-ipo underline decoration-ipo/30 underline-offset-2 hover:decoration-ipo">
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : "deskLink" in w && w.deskLink ? (
                    <Link href={w.deskLink.href} className="mt-1.5 inline-block text-[0.92rem] text-ipo underline">
                      {w.deskLink.label}
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14 bg-navy-900 py-12 text-white" aria-labelledby="process-heading">
        <div className="wrap">
          <h2 id="process-heading" className="headline text-[1.8rem] text-white">
            How it works
          </h2>
          <ol className="mt-6 grid gap-px bg-white/10 md:grid-cols-3">
            {hire.process.map((p, i) => (
              <li key={p.step} className="bg-navy-900 p-6">
                <span className="font-serif text-[2.6rem] font-semibold leading-none text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold">{p.step}</h3>
                <p className="mt-1.5 text-white/75">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="brief" className="wrap mt-14 scroll-mt-16 grid gap-8 lg:grid-cols-[1fr_1.5fr]" aria-labelledby="brief-heading">
        <div>
          <h2 id="brief-heading" className="headline text-[2rem] leading-tight">
            Send a brief
          </h2>
          <p className="mt-3 text-[1.05rem] text-[#3a4453]">Tell us what you need. An editor replies within one working day with a suggested writer and an outline.</p>
          <dl className="mt-6 space-y-3 text-[0.95rem]">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-semibold">
                <a href="mailto:business@tradetarget.in" className="hover:underline">
                  business@tradetarget.in
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Based in</dt>
              <dd className="font-semibold">Mumbai, Maharashtra</dd>
            </div>
          </dl>
        </div>
        <BriefForm contentTypes={hire.formOptions.contentTypes} volumes={hire.formOptions.volumes} />
      </section>
    </>
  );
}
