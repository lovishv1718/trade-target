"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { InView } from "../in-view";

// Charts sit mid-article, so Recharts loads only when a chart comes near the viewport.
const PLACEHOLDER = "h-[318px] w-full border border-rule bg-white md:h-[370px]";

const Chart = dynamic(() => import("./article-chart").then((m) => m.ArticleChart), {
  ssr: false,
  loading: () => <div aria-hidden className={PLACEHOLDER} />,
});

export function ArticleChart(props: ComponentProps<typeof import("./article-chart").ArticleChart>) {
  return (
    <InView placeholderClass={PLACEHOLDER}>
      <Chart {...props} />
    </InView>
  );
}
