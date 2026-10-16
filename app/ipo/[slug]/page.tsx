import type { Metadata } from "next";
import { ArticleView, articleFor, articleMetadata } from "@/components/article/article-view";
import { IpoDetail } from "@/components/ipo/ipo-detail";
import { getArticlePaths } from "@/lib/content";
import { getIpo, getIpos, priceBandLabel } from "@/lib/ipo";

// /ipo/<slug>/ serves both IPO detail pages and IPO articles, matching the old permalinks.
type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getIpos().map((i) => ({ slug: i.slug })), ...getArticlePaths("/ipo/").map(([, slug]) => ({ slug }))];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const ipo = getIpo(slug);
  if (ipo) {
    return {
      title: `${ipo.name} IPO: Date, Price Band, GMP, Subscription`,
      description: `${ipo.name} IPO details: price band ${priceBandLabel(ipo)}, lot size, GMP trend, subscription status, timeline and listing date.`,
      alternates: { canonical: `/ipo/${ipo.slug}/` },
    };
  }
  return articleMetadata(`/ipo/${slug}/`);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const ipo = getIpo(slug);
  if (ipo) return <IpoDetail ipo={ipo} />;
  return <ArticleView article={articleFor(`/ipo/${slug}/`)} />;
}
