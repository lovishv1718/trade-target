import { STATUS_META, type IpoStatus } from "@/lib/ipo";

/**
 * Rounded status tag. Only the label comes from STATUS_META; the look is set here from tokens.
 * Every variant carries a 1px border so all five share one box size.
 */
const STYLE: Record<IpoStatus, string> = {
  open: "border-up/40 bg-up/10 text-up",
  upcoming: "border-ipo/30 bg-ipo/8 text-ipo",
  allotted: "border-company-mark/40 bg-company-mark/10 text-company",
  closed: "border-rule-strong bg-transparent text-ink-2",
  listed: "border-rule bg-paper-2 text-muted",
};

export function StatusPill({ status, className = "" }: { status: IpoStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 font-sans text-2xs font-semibold uppercase leading-snug tracking-[0.08em] tabular ${STYLE[status]} ${className}`}
    >
      {status === "open" ? <span aria-hidden className="block size-1.5 rounded-full bg-up" /> : null}
      {m.label}
    </span>
  );
}
