import { ArticleView, articleFor, articleMetadata } from "@/components/article/article-view";
import { getArticlePaths } from "@/lib/content";

type Params = { params: Promise<{ sub: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticlePaths("/personal-finance/", 2).map(([, sub, slug]) => ({ sub, slug }));
}

export async function generateMetadata({ params }: Params) {
  const { sub, slug } = await params;
  return articleMetadata(`/personal-finance/${sub}/${slug}/`);
}

export default async function Page({ params }: Params) {
  const { sub, slug } = await params;
  return <ArticleView article={articleFor(`/personal-finance/${sub}/${slug}/`)} />;
}
