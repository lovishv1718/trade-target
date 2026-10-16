"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { InView } from "../in-view";

// Recharts is large, so charts load only when they come near the viewport. The
// placeholder is a calm, still paper-2 block at exactly the chart's height
// (h-75 = 300px, md:h-85 = 340px, as in charts.tsx), so nothing shifts on load.
const PLACEHOLDER = "h-75 w-full bg-paper-2 md:h-85";
const loading = () => <div aria-hidden className={PLACEHOLDER} />;

const StackedAreaChart = dynamic(() => import("./charts").then((m) => m.StackedArea), { ssr: false, loading });
const StackedBarsChart = dynamic(() => import("./charts").then((m) => m.StackedBars), { ssr: false, loading });
const LinesChart = dynamic(() => import("./charts").then((m) => m.Lines), { ssr: false, loading });

type Area = ComponentProps<typeof import("./charts").StackedArea>;
type Bars = ComponentProps<typeof import("./charts").StackedBars>;
type LinesProps = ComponentProps<typeof import("./charts").Lines>;

export function StackedArea(props: Area) {
  return (
    <InView placeholderClass={PLACEHOLDER}>
      <StackedAreaChart {...props} />
    </InView>
  );
}

export function StackedBars(props: Bars) {
  return (
    <InView placeholderClass={PLACEHOLDER}>
      <StackedBarsChart {...props} />
    </InView>
  );
}

export function Lines(props: LinesProps) {
  return (
    <InView placeholderClass={PLACEHOLDER}>
      <LinesChart {...props} />
    </InView>
  );
}
