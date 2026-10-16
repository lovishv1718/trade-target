import { NewsletterForm } from "./newsletter-form";

export function NewsletterBand({ id = "newsletter" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 bg-navy text-white">
      <div className="wrap grid gap-6 py-9 md:grid-cols-[1.1fr_1fr] md:items-center md:py-11">
        <div>
          <p className="kicker text-gold">The morning brief</p>
          <h2 id={`${id}-title`} className="headline mt-1 text-[1.7rem] leading-tight text-white md:text-[2rem]">
            IPO dates, results and market moves before 8 am
          </h2>
          <p className="mt-2 max-w-lg text-white/75">One email on trading days. IPOs opening that week, results due, and the stories worth your time.</p>
        </div>
        <div>
          <NewsletterForm tone="dark" id={`${id}-form`} />
          <p className="mt-2 text-xs text-white/55">No spam. Unsubscribe in one click.</p>
        </div>
      </div>
    </section>
  );
}
