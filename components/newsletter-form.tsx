"use client";

import { useState } from "react";

export function NewsletterForm({ tone = "light", id }: { tone?: "light" | "dark"; id?: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const dark = tone === "dark";

  if (done) {
    return (
      <p role="status" className={`border-l-4 border-gold px-4 py-3 text-sm ${dark ? "bg-white/10 text-white" : "bg-white text-ink"}`}>
        Thanks. We’ve noted <strong>{email}</strong> for the morning brief. This preview doesn’t send emails yet.
      </p>
    );
  }

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault();
        if (/^\S+@\S+\.\S+$/.test(email)) setDone(true);
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <label htmlFor={`${id ?? "nl"}-email`} className="sr-only">
        Email address
      </label>
      <input
        id={`${id ?? "nl"}-email`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className={`min-w-0 flex-1 border px-3.5 py-2.5 text-[0.95rem] outline-none ${
          dark ? "border-white/25 bg-white/5 text-white placeholder:text-white/50 focus:border-gold" : "border-rule bg-white focus:border-navy"
        }`}
      />
      <button type="submit" className="bg-accent-ink px-5 py-2.5 text-[0.95rem] font-semibold text-white hover:bg-accent-700">
        Sign up
      </button>
    </form>
  );
}
