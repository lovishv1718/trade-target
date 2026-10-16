import Image from "next/image";
import Link from "next/link";
import type { Author, Faq } from "@/lib/content";
import { JsonLd } from "../json-ld";

export function AuthorAvatar({ author, size = 44 }: { author: Author; size?: number }) {
  if (author.photo) {
    return <Image src={author.photo} alt={author.name} width={size} height={size} className="shrink-0 rounded-full bg-paper-2 object-cover" style={{ width: size, height: size }} />;
  }
  const initials = author.name
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <span aria-hidden className="flex shrink-0 items-center justify-center rounded-full bg-navy font-serif font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

export function AuthorBox({ author }: { author: Author }) {
  return (
    <section aria-label="About the author" className="flex flex-col gap-4 border-t-[3px] border-navy bg-white p-5 sm:flex-row md:p-6">
      <AuthorAvatar author={author} size={88} />
      <div>
        <p className="kicker text-muted">About the author</p>
        <h2 className="headline mt-1 text-xl">
          <Link href={`/author/${author.slug}/`} className="hover:underline">
            {author.name}
          </Link>
          <span className="ml-2 font-sans text-sm font-semibold text-accent-ink">{author.role}, TradeTarget</span>
        </h2>
        <p className="mt-2 text-[0.97rem] leading-relaxed text-[#3a4453]">{author.shortBio}</p>
        <p className="mt-3 flex flex-wrap gap-2">
          {author.expertise.map((e) => (
            <span key={e} className="border border-rule px-2 py-0.5 text-xs font-semibold text-muted">
              {e}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export function KeyTakeaways({ text }: { text: string }) {
  return (
    <aside className="border-l-4 border-gold bg-white px-5 py-4">
      <p className="kicker text-commodities-ink">Quick summary</p>
      <p className="mt-1.5 text-[1.05rem] leading-relaxed">{text}</p>
    </aside>
  );
}

export function FaqSection({ faqs, title = "Frequently asked questions" }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="headline text-[1.6rem]">
        {title}
      </h2>
      <div className="mt-4 divide-y divide-rule border-y border-rule">
        {faqs.map((f, i) => (
          <details key={i} className="group py-1" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-3 text-[1.05rem] font-semibold leading-snug">
              {f.q}
              <span aria-hidden className="mt-0.5 text-lg leading-none text-accent-ink transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-4 pr-8 text-[1rem] leading-relaxed text-[#3a4453]">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </section>
  );
}

export function DisclaimerBox() {
  return (
    <aside className="border border-rule bg-paper-2/60 px-5 py-4 text-[0.88rem] leading-relaxed text-[#4a5463]">
      <p className="kicker text-muted">Disclaimer</p>
      <p className="mt-1.5">
        This article is for information and education only and is not investment advice or a recommendation to buy, sell or hold any security. TradeTarget is
        not a SEBI-registered investment adviser or research analyst. Investments in the securities market are subject to market risks. Figures are as
        reported at the time of writing and may have changed. Consult a SEBI-registered adviser before investing.
      </p>
    </aside>
  );
}
