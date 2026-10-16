import type { MetadataRoute } from "next";
import { getArticleCards, getAuthors, getCalculators, getSections, getSubsections } from "@/lib/content";
import { getIpos } from "@/lib/ipo";

export const dynamic = "force-static";

const BASE = "https://tradetarget.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/ipo/", "/calculators/", "/hire-writers/", "/about/", "/board-of-directors/", "/contact-us/", "/editorial-policy/", "/disclaimer/", "/privacy-policy/", "/terms-and-conditions/", "/photo-credits/"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.6 })),
    ...getSections().map((s) => ({ url: `${BASE}${s.path}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...getSubsections().map((s) => ({ url: `${BASE}${s.path}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...getArticleCards().map((a) => ({ url: `${BASE}${a.path}`, lastModified: new Date(`${a.modified}+05:30`), priority: 0.7 })),
    ...getIpos().map((i) => ({ url: `${BASE}/ipo/${i.slug}/`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...getCalculators().map((c) => ({ url: `${BASE}/calculators/${c.slug}/`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...getAuthors().map((a) => ({ url: `${BASE}/author/${a.slug}/`, changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
