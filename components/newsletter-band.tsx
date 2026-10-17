import { Seen } from "./listing/stagger";
import { NewsletterForm } from "./newsletter-form";

/**
 * The morning brief sign-up: the last tool on the page, set on ink so it closes onto the
 * footer as one black back page. As the closing band it lets `main` drop its bottom padding.
 */
export function NewsletterBand({ id = "newsletter", className = "" }: { id?: string; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`surface-ink band band-tool band-closing scroll-mt-16 ${className}`}>
      <div className="wrap">
        {/* Arrives once: the white rule draws in from the right and the sign-up panel slides in after it */}
        <Seen className="newsletter-reveal grid gap-6 pt-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end md:gap-12">
          <div>
            <p className="kicker text-company">The morning brief</p>
            <h2 id={`${id}-title`} className="headline mt-2 max-w-xl text-balance text-2xl md:text-3xl">
              IPO dates, results and market moves before 8 am
            </h2>
            <p className="deck mt-3 max-w-lg text-lg leading-normal">One email on trading days. IPOs opening that week, results due, and the stories worth your time.</p>
          </div>
          <div className="newsletter-form">
            <NewsletterForm id={`${id}-form`} tone="dark" />
            <p className="mt-2 text-xs text-muted">No spam. Unsubscribe in one click.</p>
          </div>
        </Seen>
      </div>
    </section>
  );
}
