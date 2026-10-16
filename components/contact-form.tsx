"use client";

import { useState } from "react";

const TOPICS = ["General enquiry", "Report an error", "Content services", "Advertising", "Something else"];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <p role="status" className="border-t-[3px] border-results bg-white p-6 text-[1.05rem]">
        <strong>Thanks, your message is noted.</strong> We reply within two working days. This preview does not send messages yet.
      </p>
    );
  }
  const field = "mt-1.5 block w-full border border-rule bg-white px-3 py-2.5 outline-none focus:border-navy";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (e.currentTarget.checkValidity()) setSent(true);
      }}
      className="grid gap-4 border-t-[3px] border-navy bg-white p-5 sm:grid-cols-2 md:p-6"
    >
      <div>
        <label htmlFor="c-name" className="text-sm font-semibold">Name</label>
        <input id="c-name" required autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="c-email" className="text-sm font-semibold">Email</label>
        <input id="c-email" type="email" required autoComplete="email" className={field} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-topic" className="text-sm font-semibold">Topic</label>
        <select id="c-topic" className={field}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-msg" className="text-sm font-semibold">Message</label>
        <textarea id="c-msg" required rows={5} className={field} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className="bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-800">
          Send message
        </button>
      </div>
    </form>
  );
}
