"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { InView } from "../in-view";

const Subscription = dynamic(() => import("./ipo-charts").then((m) => m.SubscriptionChart), {
  ssr: false,
  loading: () => <div aria-hidden className="h-[260px] w-full bg-paper-2/70" />,
});

const Gmp = dynamic(() => import("./ipo-charts").then((m) => m.GmpChart), {
  ssr: false,
  loading: () => <div aria-hidden className="h-[240px] w-full bg-paper-2/70" />,
});

export function SubscriptionChart(props: ComponentProps<typeof import("./ipo-charts").SubscriptionChart>) {
  return (
    <InView placeholderClass="h-[260px] w-full bg-paper-2/70">
      <Subscription {...props} />
    </InView>
  );
}

export function GmpChart(props: ComponentProps<typeof import("./ipo-charts").GmpChart>) {
  return (
    <InView placeholderClass="h-[240px] w-full bg-paper-2/70">
      <Gmp {...props} />
    </InView>
  );
}
