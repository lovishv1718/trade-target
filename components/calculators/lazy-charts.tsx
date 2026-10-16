"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { InView } from "../in-view";

// Recharts is large, so charts load only when they come near the viewport. The
// placeholder matches the chart height to avoid layout shift.
const PLACEHOLDER = "h-[300px] w-full bg-paper-2/70 md:h-[340px]";
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
