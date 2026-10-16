"use client";

import { useState, type FormEvent } from "react";

type Props = { contentTypes: string[]; volumes: string[] };

const FREE_DOMAINS = /@(gmail|yahoo|hotmail|outlook|rediffmail|icloud)\./i;

export function BriefForm({ contentTypes, volumes }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");

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
    if (Object.keys(next).length) return;
    setName(String(data.get("name")).split(" ")[0]);
    setStatus("sending");
    window.setTimeout(() => setStatus("done"), 700);
  }

  if (status === "done") {
    return (
      <div role="status" className="border-t-[3px] border-results bg-white p-6">
        <p className="kicker text-results-ink">Brief received</p>
        <p className="headline mt-1 text-2xl">Thanks, {name}. An editor will reply within one working day.</p>
        <p className="mt-2 text-muted">
          We’ll suggest a writer and an outline for the first piece. This preview does not send the form anywhere yet; on launch it will go to business@tradetarget.in.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-4 text-sm font-semibold text-navy underline">
          Send another brief
        </button>
      </div>
    );
  }

  const field = "mt-1.5 block w-full border bg-white px-3 py-2.5 text-[0.98rem] outline-none focus:border-navy";
  const err = (k: string) => (errors[k] ? <p className="mt-1 text-sm text-down">{errors[k]}</p> : null);
  const cls = (k: string) => `${field} ${errors[k] ? "border-down" : "border-rule"}`;

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 border-t-[3px] border-accent bg-white p-5 sm:grid-cols-2 md:p-6">
      <div>
        <label htmlFor="bf-name" className="text-sm font-semibold">Name</label>
        <input id="bf-name" name="name" autoComplete="name" className={cls("name")} aria-invalid={!!errors.name} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="bf-company" className="text-sm font-semibold">Company</label>
        <input id="bf-company" name="company" autoComplete="organization" className={cls("company")} aria-invalid={!!errors.company} />
        {err("company")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="bf-email" className="text-sm font-semibold">Work email</label>
        <input id="bf-email" name="email" type="email" autoComplete="email" className={cls("email")} aria-invalid={!!errors.email} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="bf-type" className="text-sm font-semibold">Content type</label>
        <select id="bf-type" name="contentType" defaultValue="" className={cls("contentType")} aria-invalid={!!errors.contentType}>
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
        <label htmlFor="bf-volume" className="text-sm font-semibold">Monthly volume</label>
        <select id="bf-volume" name="volume" defaultValue="" className={cls("volume")} aria-invalid={!!errors.volume}>
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
        <label htmlFor="bf-deadline" className="text-sm font-semibold">
          First deadline <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="bf-deadline" name="deadline" type="date" className={`${field} border-rule`} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="bf-message" className="text-sm font-semibold">
          What do you need? <span className="font-normal text-muted">(topics, audience, tone, links to examples)</span>
        </label>
        <textarea id="bf-message" name="message" rows={5} className={`${field} border-rule`} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">We use these details only to reply to your brief.</p>
        <button type="submit" disabled={status === "sending"} className="bg-accent-ink px-6 py-3 font-semibold text-white hover:bg-accent-700 disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send brief"}
        </button>
      </div>
    </form>
  );
}
