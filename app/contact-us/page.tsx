import type { Metadata } from "next";
import Link from "next/link";
import site from "@/content/site.json";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact TradeTarget about our coverage, corrections or content services.",
  alternates: { canonical: "/contact-us/" },
};

export default function ContactPage() {
  return (
    <div className="wrap pt-5 md:pt-7">
      <Breadcrumbs items={[{ label: "Home", href: "/" }]} current="Contact us" />
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="headline text-[2.2rem] leading-tight md:text-[2.7rem]">Contact us</h1>
          <p className="mt-2 text-[1.05rem] text-[#3a4453]">Questions about a story, a correction, or work with our content team.</p>
          <dl className="mt-8 divide-y divide-rule border-y border-rule">
            <div className="py-4">
              <dt className="kicker text-muted">Email</dt>
              <dd className="mt-1 text-lg font-semibold">
                <a href={`mailto:${site.email}`} className="hover:underline">
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="py-4">
              <dt className="kicker text-muted">Office</dt>
              <dd className="mt-1 text-lg font-semibold">{site.location}</dd>
            </div>
            <div className="py-4">
              <dt className="kicker text-muted">Found an error?</dt>
              <dd className="mt-1">
                Send the link and the correction. See our{" "}
                <Link href="/editorial-policy/" className="text-ipo underline">
                  editorial policy
                </Link>
                .
              </dd>
            </div>
            <div className="py-4">
              <dt className="kicker text-muted">Need finance content?</dt>
              <dd className="mt-1">
                <Link href="/hire-writers/" className="font-semibold text-accent-ink hover:underline">
                  Send a brief to our content team →
                </Link>
              </dd>
            </div>
            <div className="py-4">
              <dt className="kicker text-muted">Follow us</dt>
              <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {site.socials.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                    {s.name}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
