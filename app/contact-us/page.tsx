import type { Metadata } from "next";
import Link from "next/link";
import site from "@/content/site.json";
import { ContactForm } from "@/components/contact-form";
import { SectionMasthead } from "@/components/listing/section-masthead";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact TradeTarget about our coverage, corrections or content services.",
  alternates: { canonical: "/contact-us/" },
};

const ROW = "grid gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6 lg:grid-cols-1 lg:gap-1 xl:grid-cols-[9rem_minmax(0,1fr)] xl:gap-6";

export default function ContactPage() {
  return (
    <>
      <SectionMasthead title="Contact us" crumbs={[{ label: "Home", href: "/" }]} description="Questions about a story, a correction, or work with our content team." />
    <div className="wrap">
      <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-16">
        <section aria-labelledby="contact-details">
          <h2 id="contact-details" className="kicker border-t-3 border-ink pb-2 pt-2.5 text-ink">
            Details
          </h2>
          <dl className="divide-y divide-rule border-b border-rule">
            <div className={ROW}>
              <dt className="text-sm text-muted">Email</dt>
              <dd className="text-lg font-semibold text-ink">
                <a href={`mailto:${site.email}`} className="link break-all">
                  {site.email}
                </a>
              </dd>
            </div>
            <div className={ROW}>
              <dt className="text-sm text-muted">Office</dt>
              <dd className="text-lg font-semibold text-ink">{site.location}</dd>
            </div>
            <div className={ROW}>
              <dt className="text-sm text-muted">Found an error?</dt>
              <dd className="text-md leading-normal text-ink-2">
                Send the link and the correction. See our{" "}
                <Link href="/editorial-policy/" className="link">
                  editorial policy
                </Link>
                .
              </dd>
            </div>
            <div className={ROW}>
              <dt className="text-sm text-muted">Need finance content?</dt>
              <dd>
                <Link href="/hire-writers/" className="link-more -my-2.5">
                  Send a brief to our content team <span className="arrow" aria-hidden>→</span>
                </Link>
              </dd>
            </div>
            <div className={ROW}>
              <dt className="text-sm text-muted">Follow us</dt>
              <dd>
                <ul className="-my-2.5 flex flex-wrap gap-x-5">
                  {site.socials.map((s) => (
                    <li key={s.name}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-quiet inline-flex min-h-11 items-center text-md font-semibold text-ink">
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="contact-form">
          <h2 id="contact-form" className="kicker border-t-3 border-ink pb-2 pt-2.5 text-ink">
            Send a message
          </h2>
          <div className="mt-2">
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
