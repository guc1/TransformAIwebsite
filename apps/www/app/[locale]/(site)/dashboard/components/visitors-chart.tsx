"use client";

import { useState } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type VisitorsChartBucket = {
  id: string;
  label: string;
  count: number;
  tooltip: string;
};

type VisitorsChartSectionProps = {
  hourly: VisitorsChartBucket[];
  daily: VisitorsChartBucket[];
  tabLabels: {
    hourly: string;
    daily: string;
  };
  emptyMessages: {
    hourly: string;
    daily: string;
  };
};

export function VisitorsChartSection({ hourly, daily, tabLabels, emptyMessages }: VisitorsChartSectionProps) {
  const [activeTab, setActiveTab] = useState<"hourly" | "daily">("hourly");

  const data = activeTab === "hourly" ? hourly : daily;
  const emptyMessage = activeTab === "hourly" ? emptyMessages.hourly : emptyMessages.daily;
  const maxValue = data.reduce((max, bucket) => Math.max(max, bucket.count), 0);
  const safeMax = Math.max(maxValue, 1);
  const allZero = data.every((bucket) => bucket.count === 0);

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full bg-white/10 p-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("hourly")}
          aria-pressed={activeTab === "hourly"}
          className={cn(
            "rounded-full px-4 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
            activeTab === "hourly" ? "bg-white/25 text-white" : "text-white/60 hover:text-white/80",
          )}
        >
          {tabLabels.hourly}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("daily")}
          aria-pressed={activeTab === "daily"}
          className={cn(
            "rounded-full px-4 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
            activeTab === "daily" ? "bg-white/25 text-white" : "text-white/60 hover:text-white/80",
          )}
        >
          {tabLabels.daily}
        </button>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="flex h-64 items-end gap-2 sm:gap-3">
          {data.map((bucket) => {
            const heightPercent = (bucket.count / safeMax) * 100;

            return (
              <Tooltip key={`${activeTab}-${bucket.id}`}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="group relative flex flex-1 cursor-default flex-col items-center gap-2 focus:outline-none"
                    aria-label={bucket.tooltip}
                  >
                    <div className="flex h-52 w-full items-end overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-blue-500/40 via-blue-400/70 to-blue-200/90 shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all duration-300 ease-out group-hover:from-blue-400/60 group-hover:to-blue-100/90"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="block text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                      {bucket.label}
                    </span>
                    <span className="sr-only">{bucket.count}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="border-white/20 bg-neutral-900 text-white">
                  {bucket.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {allZero ? (
        <p className="text-sm text-white/60">{emptyMessage}</p>
      ) : null}
    </div>
  );
}
