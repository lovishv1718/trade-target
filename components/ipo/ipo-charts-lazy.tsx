"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { InView } from "../in-view";

// Placeholders reserve the chart's exact height: a calm paper-2 block, no shimmer, no shift.
const SUB_BOX = "h-[260px] w-full bg-paper-2";
const GMP_BOX = "h-[240px] w-full bg-paper-2";

const Subscription = dynamic(() => import("./ipo-charts").then((m) => m.SubscriptionChart), {
  ssr: false,
  loading: () => <div aria-hidden className={SUB_BOX} />,
});

const Gmp = dynamic(() => import("./ipo-charts").then((m) => m.GmpChart), {
  ssr: false,
  loading: () => <div aria-hidden className={GMP_BOX} />,
});

export function SubscriptionChart(props: ComponentProps<typeof import("./ipo-charts").SubscriptionChart>) {
  return (
    <InView placeholderClass={SUB_BOX}>
      <Subscription {...props} />
    </InView>
  );
}

export function GmpChart(props: ComponentProps<typeof import("./ipo-charts").GmpChart>) {
  return (
    <InView placeholderClass={GMP_BOX}>
      <Gmp {...props} />
    </InView>
  );
}
