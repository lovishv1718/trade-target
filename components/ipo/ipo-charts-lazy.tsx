"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { InView } from "../in-view";

// Placeholders reserve the chart's exact height: the still lazy slot, no shimmer, no shift.
const SUB_BOX = "h-[260px] w-full";
const GMP_BOX = "h-[240px] w-full";

const Subscription = dynamic(() => import("./ipo-charts").then((m) => m.SubscriptionChart), {
  ssr: false,
  loading: () => <div aria-hidden data-label="Subscription" className={`lazy-slot ${SUB_BOX}`} />,
});

const Gmp = dynamic(() => import("./ipo-charts").then((m) => m.GmpChart), {
  ssr: false,
  loading: () => <div aria-hidden data-label="GMP trend" className={`lazy-slot ${GMP_BOX}`} />,
});

export function SubscriptionChart(props: ComponentProps<typeof import("./ipo-charts").SubscriptionChart>) {
  return (
    <InView placeholderClass={SUB_BOX} label="Subscription">
      <Subscription {...props} />
    </InView>
  );
}

export function GmpChart(props: ComponentProps<typeof import("./ipo-charts").GmpChart>) {
  return (
    <InView placeholderClass={GMP_BOX} label="GMP trend">
      <Gmp {...props} />
    </InView>
  );
}
