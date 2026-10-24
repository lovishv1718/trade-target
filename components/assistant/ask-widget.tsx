"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchDocs, type SearchDoc } from "@/lib/search";

const SUGGESTED = [
  "How do I check IPO allotment status?",
  "What does GMP mean for an IPO?",
  "How is EPF interest calculated?",
  "Old or new tax regime: how do I compare?",
  "What is a dividend reinvestment plan?",
];

const ADVICE = /\b(buy|sell|should i (invest|buy|sell)|target price|multibagger|tip|tips|which stock|best stock to)\b/i;

type Message = { role: "user" | "assistant"; text: string; links?: SearchDoc[] };

let indexPromise: Promise<SearchDoc[]> | null = null;
const loadIndex = () => (indexPromise ??= fetch("/search-index.json").then((r) => r.json()));

export function AskWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (!open) {
      // Focus goes back to the launcher only after the panel has been open.
      if (wasOpen.current) launcherRef.current?.focus({ preventScroll: true });
      return;
    }
    wasOpen.current = true;
    // Mouse and keyboard: straight into the question field. Touch: the panel, so the keyboard does not cover the sheet.
    const fine = window.matchMedia("(pointer: fine)").matches;
    (fine ? inputRef.current : panelRef.current)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    const docs = await loadIndex();
    const links = searchDocs(docs, q.replace(/[?]/g, "")).slice(0, 3);
    await new Promise((r) => setTimeout(r, 450));
    const reply: Message = ADVICE.test(q)
      ? {
          role: "assistant",
          text: "I can’t tell you whether to buy or sell a stock, IPO or fund. I can explain how something works and point you to our reporting so you can decide for yourself or with a SEBI-registered adviser.",
          links,
        }
      : {
          role: "assistant",
          text: links.length
            ? "This assistant is a preview and isn’t answering questions yet. These TradeTarget pages cover what you asked:"
            : "This assistant is a preview and isn’t answering questions yet. Try the search, or browse Stock Market IQ for explainers.",
          links,
        };
    setMessages((m) => [...m, reply]);
    setThinking(false);
  }

  return (
    <>
      {!open ? (
        <button ref={launcherRef} type="button" aria-haspopup="dialog" aria-label="Ask TradeTarget" onClick={() => setOpen(true)} className="ask-fab">
          <span aria-hidden className="ask-fab-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M3 4.5h14v9H9.2L5.5 16.5v-3H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 6.4l.75 1.85 1.85.75-1.85.75L10 11.6l-.75-1.85L7.4 9l1.85-.75z" fill="currentColor" />
            </svg>
          </span>
          <span aria-hidden className="ask-fab-label">
            Ask <span>TradeTarget</span>
          </span>
        </button>
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="ask-title"
          aria-describedby="ask-notice"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col border border-ink bg-paper shadow-overlay transition-[opacity,transform] duration-200 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[560px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px]"
        >
          <div className="surface-ink flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <h2 id="ask-title" className="headline text-lg leading-snug">
                Ask TradeTarget
              </h2>
              <p className="mt-0.5 text-xs text-muted">Preview · answers from our articles</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Ask TradeTarget" className="btn btn-secondary btn-sm shrink-0">
              Close
            </button>
          </div>
          <p id="ask-notice" className="note border-b border-b-rule border-l-ink bg-paper-2 leading-snug">
            Explains market terms and personal finance rules. <strong className="font-semibold text-ink">It does not give buy or sell advice.</strong>
          </p>

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {messages.length === 0 ? (
              <div>
                <p className="text-sm text-muted">Try one of these:</p>
                <ul className="mt-2 border-t border-rule">
                  {SUGGESTED.map((s) => (
                    <li key={s} className="border-b border-rule">
                      <button type="button" onClick={() => ask(s)} className="link-row w-full text-left text-sm">
                        <span className="link-row-label">{s}</span>
                        <span aria-hidden className="arrow">
                          →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div role="log" aria-live="polite" aria-label="Conversation" className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div className={`max-w-[88%] px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-ink text-paper" : "border border-rule bg-white text-ink-2"}`}>
                    <p>{m.text}</p>
                    {m.links?.length ? (
                      <ul className="mt-2 space-y-1.5 border-t border-rule pt-2">
                        {m.links.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} onClick={() => setOpen(false)} className="link font-semibold">
                              {l.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ))}
              {thinking ? (
                <p className="flex items-center gap-2 text-sm text-muted">
                  <span aria-hidden className="inline-block h-3 w-0.5 bg-company-mark" />
                  Looking through our articles…
                </p>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-start gap-2 border-t border-rule bg-paper p-3"
          >
            <label htmlFor="ask-input" className="sr-only">
              Your question
            </label>
            <input
              ref={inputRef}
              id="ask-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about IPOs, tax, EPF…"
              autoComplete="off"
              className="field mt-0 min-w-0 flex-1"
            />
            <button type="submit" disabled={!input.trim() || thinking} aria-busy={thinking || undefined} className="btn shrink-0">
              Ask
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
