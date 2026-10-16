import { ArticleView, articleFor, articleMetadata } from "@/components/article/article-view";
import { getArticlePaths } from "@/lib/content";

// Older IPO coverage lives under /ipo/mainboard-ipo/ and /ipo/sme-ipo/
type Params = { params: Promise<{ slug: string; article: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticlePaths("/ipo/", 2).map(([, slug, article]) => ({ slug, article }));
}

export async function generateMetadata({ params }: Params) {
  const { slug, article } = await params;
  return articleMetadata(`/ipo/${slug}/${article}/`);
}

export default async function Page({ params }: Params) {
  const { slug, article } = await params;
  return <ArticleView article={articleFor(`/ipo/${slug}/${article}/`)} />;
}
