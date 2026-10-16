import Image from "next/image";
import Link from "next/link";
import type { Author, Faq } from "@/lib/content";
import { JsonLd } from "../json-ld";

export function AuthorAvatar({ author, size = 44 }: { author: Author; size?: number }) {
  if (author.photo) {
    return (
      <Image
        src={author.photo}
        alt={author.name}
        width={size}
        height={size}
        className="img-fade shrink-0 rounded-full bg-paper-2 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = author.name
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-ink font-sans font-semibold tracking-wide text-paper"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}

export function AuthorBox({ author }: { author: Author }) {
  return (
    <section aria-label="About the author" className="border-t-2 border-ink pt-5">
      <p className="kicker text-muted">About the author</p>
      <div className="mt-4 flex items-start gap-4 sm:gap-5">
        <AuthorAvatar author={author} size={72} />
        <div className="min-w-0">
          <h2 className="headline text-xl">
            <Link href={`/author/${author.slug}/`} className="decoration-1 underline-offset-4 hover:underline">
              {author.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm font-semibold text-ink-2">{author.role}, TradeTarget</p>
        </div>
      </div>
      <p className="mt-4 text-base leading-relaxed text-ink-2">{author.shortBio}</p>
      {author.expertise.length ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Expertise">
          {author.expertise.map((e) => (
            <li key={e} className="tag">
              {e}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function KeyTakeaways({ text }: { text: string }) {
  return (
    <aside aria-label="Quick summary" className="border-t-2 border-ink pt-3">
      <p className="kicker text-ink">Quick summary</p>
      <p className="mt-2 text-lg leading-relaxed text-ink">{text}</p>
    </aside>
  );
}

export function FaqSection({ faqs, title = "Frequently asked questions" }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="headline border-t-2 border-ink pt-3 text-2xl">
        {title}
      </h2>
      <div className="mt-4 divide-y divide-rule border-b border-rule">
        {faqs.map((f, i) => (
          <details key={i} className="art-disclosure group" open={i === 0}>
            <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-4 py-3.5 text-lg font-semibold leading-snug text-ink [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">{f.q}</span>
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 14 14"
                className="mt-1.5 shrink-0 text-ink transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none"
              >
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" fill="none" />
              </svg>
            </summary>
            <p className="art-disclosure-body max-w-[62ch] pb-5 pr-8 text-base leading-relaxed text-ink-2">{f.a}</p>
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
    <aside aria-label="Disclaimer" className="border border-rule bg-paper-2 px-4 py-4 text-sm leading-relaxed text-ink-2 md:px-5">
      <p className="kicker text-ink">Disclaimer</p>
      <p className="mt-1.5">
        This article is for information and education only and is not investment advice or a recommendation to buy, sell or hold any security. TradeTarget is
        not a SEBI-registered investment adviser or research analyst. Investments in the securities market are subject to market risks. Figures are as
        reported at the time of writing and may have changed. Consult a SEBI-registered adviser before investing.
      </p>
    </aside>
  );
}
