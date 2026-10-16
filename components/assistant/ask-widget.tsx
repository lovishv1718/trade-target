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

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (!open) return;
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
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-navy px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/25 hover:bg-navy-800 md:bottom-6 md:right-6"
        >
          <span aria-hidden className="inline-block h-2 w-2 bg-gold" />
          Ask TradeTarget
        </button>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-label="Ask TradeTarget"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col border border-rule bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[380px]"
        >
          <div className="flex items-start justify-between gap-3 bg-navy px-4 py-3 text-white">
            <div>
              <p className="font-serif text-lg font-semibold leading-tight">
                Ask Trade<span className="text-gold">Target</span>
              </p>
              <p className="mt-0.5 text-xs text-white/75">Preview · answers from our articles</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="px-1 text-sm font-semibold text-white/80 hover:text-white">
              Close
            </button>
          </div>
          <p className="border-b border-rule bg-gold/15 px-4 py-2 text-[0.8rem] leading-snug text-ink">
            Explains market terms and personal finance rules. <strong>It does not give buy or sell advice.</strong>
          </p>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div>
                <p className="text-sm text-muted">Try one of these:</p>
                <ul className="mt-2 space-y-2">
                  {SUGGESTED.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => ask(s)} className="w-full border border-rule px-3 py-2 text-left text-sm hover:border-navy hover:bg-paper">
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={`max-w-[88%] px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-navy text-white" : "border border-rule bg-paper"}`}>
                  <p>{m.text}</p>
                  {m.links?.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {m.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} onClick={() => setOpen(false)} className="font-semibold text-ipo underline decoration-ipo/40 underline-offset-2 hover:decoration-ipo">
                            {l.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
            {thinking ? <p className="text-sm text-muted">Looking through our articles…</p> : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-rule p-3"
          >
            <label htmlFor="ask-input" className="sr-only">
              Your question
            </label>
            <input
              id="ask-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about IPOs, tax, EPF…"
              className="min-w-0 flex-1 border border-rule px-3 py-2 text-sm outline-none focus:border-navy"
            />
            <button type="submit" disabled={!input.trim() || thinking} className="bg-accent-ink px-4 text-sm font-semibold text-white disabled:opacity-50">
              Ask
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
