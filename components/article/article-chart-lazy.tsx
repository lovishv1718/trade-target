"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { InView } from "../in-view";

// Charts sit mid-article, so Recharts loads only when a chart comes near the viewport.
// The placeholder is a still paper panel at exactly the figure's height (CHART_FIGURE_CLASS
// in article-chart.tsx: h-[324px] md:h-[364px]), so nothing moves when the chart arrives.
const PLACEHOLDER = "art-chart h-[324px] w-full md:h-[364px]";

const Chart = dynamic(() => import("./article-chart").then((m) => m.ArticleChart), {
  ssr: false,
  loading: () => <div aria-hidden data-label="Chart" className={`lazy-slot ${PLACEHOLDER}`} />,
});

export function ArticleChart(props: ComponentProps<typeof import("./article-chart").ArticleChart>) {
  return (
    <InView placeholderClass={PLACEHOLDER}>
      <Chart {...props} />
    </InView>
  );
}
