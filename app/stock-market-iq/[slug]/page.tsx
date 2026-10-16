import { ArticleView, articleFor, articleMetadata } from "@/components/article/article-view";
import { getArticlePaths } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticlePaths("/stock-market-iq/").map(([, slug]) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleMetadata(`/stock-market-iq/${slug}/`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleView article={articleFor(`/stock-market-iq/${slug}/`)} />;
}
