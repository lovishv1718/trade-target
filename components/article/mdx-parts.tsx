import Image from "next/image";
import Link from "next/link";
import type { AnchorHTMLAttributes, TableHTMLAttributes } from "react";

/** Inline "Read this also" link card inside article bodies. */
export function ReadAlso({ href, title }: { href: string; title: string }) {
  const internal = href.startsWith("/");
  const inner = (
    <>
      <span className="kicker block text-accent-ink">Read this also</span>
      <span className="headline mt-0.5 block text-[1.08rem] leading-snug group-hover:underline">{title}</span>
    </>
  );
  return (
    <aside className="not-prose border-y border-rule py-3">
      {internal ? (
        <Link prefetch={false} href={href} className="group flex items-center justify-between gap-4 text-ink no-underline">
          <span>{inner}</span>
          <span aria-hidden className="text-xl text-accent-ink">→</span>
        </Link>
      ) : (
        <a href={href} className="group flex items-center justify-between gap-4 text-ink no-underline" rel="noopener">
          <span>{inner}</span>
          <span aria-hidden className="text-xl text-accent-ink">→</span>
        </a>
      )}
    </aside>
  );
}

export function Figure({ src, width, height, alt, caption }: { src: string; width: number; height: number; alt: string; caption?: string }) {
  return (
    <figure>
      <Image src={src} width={width} height={height} alt={alt} sizes="(min-width: 1024px) 720px, 100vw" className="h-auto w-full border border-rule bg-white" />
      {caption ? <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

export function TableWrap(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="table-wrap">
      <table {...props} />
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
