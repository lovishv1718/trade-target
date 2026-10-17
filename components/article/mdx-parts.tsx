import Image from "next/image";
import Link from "next/link";
import { Children, cloneElement, isValidElement, type AnchorHTMLAttributes, type ReactElement, type ReactNode, type TableHTMLAttributes } from "react";

/** Inline "Read this also" link card inside article bodies. */
export function ReadAlso({ href, title }: { href: string; title: string }) {
  const internal = href.startsWith("/");
  const cls = "group flex min-h-11 items-center justify-between gap-4 py-3 text-ink no-underline";
  const inner = (
    <>
      <span className="min-w-0">
        <span className="kicker block text-muted">Read this also</span>
        <span className="headline mt-1 block text-lg leading-snug decoration-1 underline-offset-[3px] group-hover:underline">{title}</span>
      </span>
      <span aria-hidden className="shrink-0 text-xl text-ink transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none">
        →
      </span>
    </>
  );
  return (
    <aside className="not-prose art-readalso border-y border-rule">
      {internal ? (
        <Link prefetch={false} href={href} className={cls}>
          {inner}
        </Link>
      ) : (
        <a href={href} className={cls} rel="noopener">
          {inner}
        </a>
      )}
    </aside>
  );
}

const CREDIT = /\s*\(?((?:Source|Sources|Photo|Image|Picture|Credit|Data)\s*:[^)]*)\)?\.?\s*$/i;

export function Figure({
  src,
  width,
  height,
  alt,
  caption,
  credit,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  credit?: string;
}) {
  // A trailing "Source: …" / "Photo: …" in the caption is set as the credit line
  const m = !credit && caption ? caption.match(CREDIT) : null;
  const text = m && caption ? caption.slice(0, m.index).trim() : caption;
  const by = credit ?? m?.[1];
  return (
    <figure className="art-figure">
      <div className="border border-rule bg-paper-2">
        <Image src={src} width={width} height={height} alt={alt} sizes="(min-width: 1024px) 660px, 100vw" className="img-fade h-auto w-full" />
      </div>
      {text || by ? (
        <figcaption className="mt-2 text-sm leading-normal text-ink-2">
          {text ? <span>{text} </span> : null}
          {by ? <span className="text-xs text-muted">{by}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ---- Tables: right-align columns whose body cells are all numbers ---------- */

const NUMERIC = /^[(+\-−–]?\s*(?:₹|Rs\.?|INR|\$|US\$)?\s*[(+\-−–]?\d[\d,]*(?:\.\d+)?\s*(?:%|x|×|bps|cr|crore|crores|lakh|lakhs|bn|mn|k|tn)?\)?$/i;
const EMPTY = /^(?:|-|–|—|NA|N\/A|nil)$/i;

type WithChildren = { children?: ReactNode; className?: string };

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<WithChildren>(node)) return textOf(node.props.children);
  return "";
}

const elements = (node: ReactNode) => Children.toArray(node).filter((c): c is ReactElement<WithChildren> => isValidElement(c));

function numericColumns(sections: ReactElement<WithChildren>[]): Set<number> {
  const body = sections.filter((s) => s.type === "tbody");
  const cols = new Map<number, boolean>();
  for (const sec of body) {
    for (const row of elements(sec.props.children)) {
      elements(row.props.children).forEach((cell, i) => {
        if (i === 0) return; // the first column is the row label
        const t = textOf(cell.props.children).replace(/\s+/g, " ").trim();
        if (EMPTY.test(t)) return;
        cols.set(i, (cols.get(i) ?? true) && NUMERIC.test(t));
      });
    }
  }
  return new Set([...cols].filter(([, ok]) => ok).map(([i]) => i));
}

export function TableWrap({ children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  let content: ReactNode = children;
  try {
    const sections = elements(children);
    const num = numericColumns(sections);
    if (num.size) {
      content = sections.map((sec) =>
        cloneElement(sec, {
          children: elements(sec.props.children).map((row) =>
            cloneElement(row, {
              children: elements(row.props.children).map((cell, i) =>
                num.has(i) ? cloneElement(cell, { className: `${cell.props.className ?? ""} art-num`.trim() }) : cell,
              ),
            }),
          ),
        }),
      );
    }
  } catch {
    content = children;
  }
  return (
    <div className="table-wrap">
      <table {...props}>{content}</table>
    </div>
  );
}

export function SmartLink({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) {
    return (
      <Link prefetch={false} href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
