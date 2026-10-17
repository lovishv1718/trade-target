"use client";

import { useState } from "react";

/** Email sign-up. Works on any surface: .field and .btn take their look from the band they sit in. */
export function NewsletterForm({ tone = "light", id }: { tone?: "light" | "dark"; id?: string }) {
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
      <label htmlFor={inputId} className="field-label">
        Email address
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
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
          className="field mt-0 min-w-0 flex-1"
        />
        <button type="submit" className="btn shrink-0">
          Sign up <span className="arrow" aria-hidden>→</span>
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
