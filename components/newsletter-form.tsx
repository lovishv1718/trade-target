"use client";

import { useState } from "react";

/** Email sign-up. Works on any surface: .field and .btn take their look from the band they sit in. */
export function NewsletterForm({ tone = "light", id, inline = false, cta = "Sign up" }: { tone?: "light" | "dark"; id?: string; inline?: boolean; cta?: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const dark = tone === "dark";
  const inputId = `${id ?? "nl"}-email`;
  const errorId = `${inputId}-error`;

  if (done) {
    return (
      <p role="status" className={`note border-success text-ink-2 ${dark ? "bg-paper-2" : ""}`}>
        Thanks. We’ve noted <strong className="text-ink">{email}</strong> for the morning brief. This preview doesn’t send emails yet.
      </p>
    );
  }

  return (
    <form
      id={id}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (/^\S+@\S+\.\S+$/.test(email)) {
          setError("");
          setDone(true);
        } else {
          setError(email.trim() ? "Enter a valid email address" : "Enter your email address");
        }
      }}
    >
      <label htmlFor={inputId} className={inline ? "sr-only" : "field-label"}>
        Email address
      </label>
      <div className={inline ? "flex flex-col gap-2 sm:flex-row sm:gap-0" : "mt-1.5 flex flex-col gap-2 sm:flex-row"}>
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="Your email address"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`field mt-0 min-w-0 flex-1 ${inline ? "min-h-14 border-white bg-white px-5 shadow-[0_8px_24px_-16px_rgb(20_20_20/0.35)]" : ""}`}
        />
        <button type="submit" className={`btn shrink-0 ${inline ? "min-h-14 px-8" : ""}`}>
          {cta} <span className="arrow" aria-hidden>→</span>
        </button>
      </div>
      {error ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
