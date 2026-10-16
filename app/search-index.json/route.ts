import { getArticleCards, getCalculators } from "@/lib/content";
import { getIpos } from "@/lib/ipo";
import type { SearchDoc } from "@/lib/search";

export const dynamic = "force-static";

export function GET() {
  const docs: SearchDoc[] = [
    ...getArticleCards().map((a) => ({
      type: "story" as const,
      title: a.title,
      href: a.path,
      label: a.kicker,
      text: `${a.standfirst} ${a.tags.join(" ")}`.slice(0, 400),
      date: a.date,
    })),
    ...getIpos().map((i) => ({
      type: "ipo" as const,
      title: `${i.name} IPO`,
      href: `/ipo/${i.slug}/`,
      label: i.board === "sme" ? "SME IPO" : "Mainboard IPO",
      text: `${i.sector} ${i.about}`.slice(0, 300),
      date: i.dates.open ?? i.dates.close ?? undefined,
    })),
    ...getCalculators().map((c) => ({
      type: "calculator" as const,
      title: c.name,
      href: `/calculators/${c.slug}/`,
      label: c.category,
      text: `${c.short} ${c.description}`,
    })),
  ];
  return Response.json(docs);
}
