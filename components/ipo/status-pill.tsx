import { STATUS_META, type IpoStatus } from "@/lib/ipo";

export function StatusPill({ status, className = "" }: { status: IpoStatus; className?: string }) {
  const m = STATUS_META[status];
  return <span className={`inline-block whitespace-nowrap px-2 py-0.5 text-[0.72rem] font-bold uppercase tracking-wide ${m.className} ${className}`}>{m.label}</span>;
}
