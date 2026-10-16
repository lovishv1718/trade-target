import { ArticleView, articleFor, articleMetadata } from "@/components/article/article-view";
import { getArticlePaths } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticlePaths("/blog-junction/").map(([, slug]) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleMetadata(`/blog-junction/${slug}/`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleView article={articleFor(`/blog-junction/${slug}/`)} />;
}
