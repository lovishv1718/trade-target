"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type Props = { contentTypes: string[]; volumes: string[] };

const FREE_DOMAINS = /@(gmail|yahoo|hotmail|outlook|rediffmail|icloud)\./i;

const FIELDS: { key: string; id: string; label: string }[] = [
  { key: "name", id: "bf-name", label: "Name" },
  { key: "company", id: "bf-company", label: "Company" },
  { key: "email", id: "bf-email", label: "Work email" },
  { key: "contentType", id: "bf-type", label: "Content type" },
  { key: "volume", id: "bf-volume", label: "Monthly volume" },
];

export function BriefForm({ contentTypes, volumes }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState(0);
  const [name, setName] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // After a failed submit, move focus to the error summary so the problems are read out first.
  useEffect(() => {
    if (attempt && Object.keys(errors).length) summaryRef.current?.focus();
  }, [attempt, errors]);

  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name")).trim()) next.name = "Enter your name";
    if (!String(data.get("company")).trim()) next.company = "Enter your company";
    const email = String(data.get("email")).trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    else if (FREE_DOMAINS.test(email)) next.email = "Please use your work email";
    if (!data.get("contentType")) next.contentType = "Choose a content type";
    if (!data.get("volume")) next.volume = "Choose a monthly volume";
    setErrors(next);
    setAttempt((n) => n + 1);
    if (Object.keys(next).length) return;
    setName(String(data.get("name")).split(" ")[0]);
    setStatus("sending");
    window.setTimeout(() => setStatus("done"), 700);
  }

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="border-t-[3px] border-success bg-white p-5 md:p-6">
        <p className="kicker text-success">Brief received</p>
        <p className="headline mt-1.5 text-2xl">Thanks, {name}. An editor will reply within one working day.</p>
        <p className="mt-2 max-w-prose text-md leading-normal text-ink-2">
          We’ll suggest a writer and an outline for the first piece. This preview does not send the form anywhere yet; on launch it will go to business@tradetarget.in.
        </p>
        <button
          type="button"
          onClick={() => {
            setErrors({});
            setAttempt(0);
            setStatus("idle");
          }}
          className="btn btn-tertiary mt-3"
        >
          Send another brief
        </button>
      </div>
    );
  }

  const sending = status === "sending";
  const errorId = (k: string) => `bf-${k}-error`;
  const err = (k: string) =>
    errors[k] ? (
      <p id={errorId(k)} className="field-error">
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: string, hint?: string) => {
    const ids = [errors[k] ? errorId(k) : "", hint ?? ""].filter(Boolean).join(" ");
    return { "aria-invalid": errors[k] ? true : undefined, "aria-describedby": ids || undefined } as const;
  };
  const errorList = FIELDS.filter((f) => errors[f.key]);
  const label = (htmlFor: string, children: ReactNode) => (
    <label htmlFor={htmlFor} className="field-label">
      {children}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate aria-busy={sending || undefined} className="grid gap-5 border-t-[3px] border-ink bg-white p-5 sm:grid-cols-2 md:p-6">
      {errorList.length ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border-l-[3px] border-error bg-paper px-4 py-3 sm:col-span-2">
          <p className="text-base font-semibold text-ink">
            {errorList.length === 1 ? "Check one detail before sending" : `Check ${errorList.length} details before sending`}
          </p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {errorList.map((f) => (
              <li key={f.key}>
                <a
                  href={`#${f.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(f.id)?.focus();
                  }}
                  className="link font-semibold text-error decoration-current"
                >
                  {f.label}: {errors[f.key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        {label("bf-name", "Name")}
        <input id="bf-name" name="name" autoComplete="name" className="field" {...a11y("name")} />
        {err("name")}
      </div>
      <div>
        {label("bf-company", "Company")}
        <input id="bf-company" name="company" autoComplete="organization" className="field" {...a11y("company")} />
        {err("company")}
      </div>
      <div className="sm:col-span-2">
        {label("bf-email", "Work email")}
        <input id="bf-email" name="email" type="email" autoComplete="email" className="field" {...a11y("email")} />
        {err("email")}
      </div>
      <div>
        {label("bf-type", "Content type")}
        <select id="bf-type" name="contentType" defaultValue="" className="field" {...a11y("contentType")}>
          <option value="" disabled>
            Choose one
          </option>
          {contentTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {err("contentType")}
      </div>
      <div>
        {label("bf-volume", "Monthly volume")}
        <select id="bf-volume" name="volume" defaultValue="" className="field" {...a11y("volume")}>
          <option value="" disabled>
            Choose one
          </option>
          {volumes.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        {err("volume")}
      </div>
      <div className="sm:col-span-2">
        {label(
          "bf-deadline",
          <>
            First deadline <span className="font-normal text-muted">(optional)</span>
          </>,
        )}
        <input id="bf-deadline" name="deadline" type="date" className="field sm:max-w-xs" />
      </div>
      <div className="sm:col-span-2">
        {label("bf-message", "What do you need?")}
        <p id="bf-message-hint" className="field-hint mt-0.5">
          Topics, audience, tone, links to examples
        </p>
        <textarea id="bf-message" name="message" rows={5} aria-describedby="bf-message-hint" className="field" />
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-rule pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">We use these details only to reply to your brief.</p>
        <button type="submit" disabled={sending} aria-busy={sending || undefined} className="btn btn-lg w-full sm:w-auto">
          {sending ? "Sending…" : "Send brief"}
        </button>
      </div>
    </form>
  );
}
