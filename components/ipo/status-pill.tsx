import { STATUS_META, type IpoStatus } from "@/lib/ipo";

/**
 * Square status tag. Only the label comes from STATUS_META; the look is set here from tokens.
 * Every variant carries a 1px border so all five share one box size.
 */
const STYLE: Record<IpoStatus, string> = {
  open: "border-ipo bg-ipo text-paper",
  upcoming: "border-company-mark bg-company-mark/10 text-company",
  allotted: "border-money bg-white text-money",
  closed: "border-ink bg-white text-ink",
  listed: "border-rule-strong bg-paper-2 text-muted",
};

export function StatusPill({ status, className = "" }: { status: IpoStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-0.5 text-2xs font-bold uppercase leading-snug tracking-caps tabular ${STYLE[status]} ${className}`}
    >
      {status === "open" ? <span aria-hidden className="block size-1.5 rounded-full bg-paper" /> : null}
      {m.label}
    </span>
  );
}
