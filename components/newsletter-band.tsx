import { NewsletterForm } from "./newsletter-form";

/** The morning brief sign-up: a quiet paper band with an ink rule, not a banner. */
export function NewsletterBand({ id = "newsletter" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 border-y border-rule bg-paper-2">
      <div className="wrap py-9 md:py-12">
        <div className="section-rule grid gap-6 pt-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:gap-12">
          <div>
            <p className="kicker text-ink">The morning brief</p>
            <h2 id={`${id}-title`} className="headline mt-1.5 max-w-xl text-2xl md:text-3xl">
              IPO dates, results and market moves before 8 am
            </h2>
            <p className="mt-2 max-w-lg text-md leading-normal text-ink-2">One email on trading days. IPOs opening that week, results due, and the stories worth your time.</p>
          </div>
          <div>
            <NewsletterForm id={`${id}-form`} />
            <p className="mt-2 text-xs text-muted">No spam. Unsubscribe in one click.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
