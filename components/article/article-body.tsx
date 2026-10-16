import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ArticleChart } from "./article-chart-lazy";
import { Figure, ReadAlso, SmartLink, TableWrap } from "./mdx-parts";

const components = { ReadAlso, Figure, ArticleChart, table: TableWrap, a: SmartLink };

export function ArticleBody({ source }: { source: string }) {
  return (
    <div className="article-body">
      <MDXRemote
        source={source}
        components={components}
        options={{
          // Content is our own import; JSX expressions carry chart data
          blockJS: false,
          mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] },
        }}
      />
    </div>
  );
}
