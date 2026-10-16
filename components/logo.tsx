import Link from "next/link";

export function Logo({ size = "md", inverse = false }: { size?: "sm" | "md" | "lg"; inverse?: boolean }) {
  const text = size === "lg" ? "text-[2.4rem] md:text-[3rem]" : size === "sm" ? "text-2xl" : "text-[1.9rem]";
  return (
    <Link href="/" aria-label="TradeTarget home" className="inline-flex items-baseline leading-none">
      <span className={`font-serif font-bold tracking-[-0.02em] ${text} ${inverse ? "text-white" : "text-navy"}`}>Trade</span>
      <span className={`font-serif font-bold tracking-[-0.02em] ${text} text-accent`}>Target</span>
    </Link>
  );
}
