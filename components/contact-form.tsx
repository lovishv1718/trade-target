"use client";

import { useEffect, useRef, useState } from "react";

const TOPICS = ["General enquiry", "Report an error", "Content services", "Advertising", "Something else"];

// Native required validation stays; once someone has tried to send, empty or malformed fields
// take the error state (the [data-tried] rule in globals.css).
const field = "field";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [tried, setTried] = useState(false);
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <p ref={doneRef} tabIndex={-1} role="status" className="border-t-3 border-success bg-white p-5 text-base leading-normal text-ink-2 md:p-6 md:text-lg md:leading-normal">
        <strong className="font-semibold text-ink">Thanks, your message is noted.</strong> We reply within two working days. This preview does not send messages yet.
      </p>
    );
  }
  return (
    <form
      data-tried={tried || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        if (e.currentTarget.checkValidity()) setSent(true);
      }}
      className="grid gap-5 border border-t-3 border-rule border-t-ink bg-white p-5 sm:grid-cols-2 md:p-6"
    >
      <div>
        <label htmlFor="c-name" className="field-label">
          Name
        </label>
        <input id="c-name" required autoComplete="name" placeholder=" " className={field} />
      </div>
      <div>
        <label htmlFor="c-email" className="field-label">
          Email
        </label>
        <input id="c-email" type="email" required autoComplete="email" placeholder=" " className={field} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-topic" className="field-label">
          Topic
        </label>
        <select id="c-topic" className={field}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-msg" className="field-label">
          Message
        </label>
        <textarea id="c-msg" required rows={5} placeholder=" " className={field} />
      </div>
      <div className="border-t border-rule pt-5 sm:col-span-2">
        <button type="submit" onClick={() => setTried(true)} className="btn w-full sm:w-auto">
          Send message <span className="arrow" aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}
