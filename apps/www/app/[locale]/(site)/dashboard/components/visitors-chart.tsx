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
  const minValue = data.reduce((min, bucket) => Math.min(min, bucket.count), Number.POSITIVE_INFINITY);
  const effectiveMin = Number.isFinite(minValue) ? Math.min(minValue, maxValue) : 0;
  const normalizedRange = maxValue - effectiveMin;
  const allZero = data.every((bucket) => bucket.count === 0);
  const yAxisTicks = [100, 75, 50, 25, 0];
  const minBarWidth = 32;
  const baseMinWidth = activeTab === "hourly" ? 768 : 0;
  const chartMinWidth = Math.max(data.length * minBarWidth, baseMinWidth);
  const barWidth = data.length > 0 ? chartMinWidth / data.length : minBarWidth;

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
        <div className="flex h-64 gap-4">
          <div className="flex h-52 flex-col justify-between py-1 text-right text-xs uppercase tracking-[0.12em] text-white/40">
            {yAxisTicks.map((tick) => (
              <span key={`${activeTab}-tick-${tick}`}>{`${tick}%`}</span>
            ))}
          </div>
          <div className="w-full overflow-x-auto overflow-y-hidden pb-2 [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin]">
            <div
              className="flex h-64 items-end gap-2 sm:gap-3"
              style={{ minWidth: `${chartMinWidth}px` }}
            >
              {data.map((bucket) => {
                const rawHeightPercent =
                  normalizedRange > 0
                    ? ((bucket.count - effectiveMin) / normalizedRange) * 100
                    : bucket.count > 0
                      ? 100
                      : 0;
                const heightPercent = Math.max(0, Math.min(rawHeightPercent, 100));
                const showBar = bucket.count > 0;
                const labelId = `${activeTab}-${bucket.id}-label`;

                return (
                  <div
                    key={`${activeTab}-${bucket.id}`}
                    className="flex h-full flex-none flex-col items-center gap-3"
                    style={{ width: `${barWidth}px` }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "group relative flex h-52 w-full items-end overflow-hidden rounded-xl border border-white/10 bg-white/5 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                            !showBar && "border-white/5 bg-transparent",
                          )}
                          aria-describedby={labelId}
                          aria-label={bucket.tooltip}
                        >
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/15"
                          />
                          {showBar ? (
                            <div
                              className="w-full rounded-t-xl bg-gradient-to-t from-blue-500/40 via-blue-400/70 to-blue-200/90 shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all duration-300 ease-out group-hover:from-blue-400/60 group-hover:to-blue-100/90"
                              style={{ height: `${heightPercent}%` }}
                            />
                          ) : null}
                          <span className="sr-only">{bucket.count}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="border-white/20 bg-neutral-900 text-white">
                        {bucket.tooltip}
                      </TooltipContent>
                    </Tooltip>
                    <span
                      id={labelId}
                      className="block w-full text-center text-xs font-medium uppercase tracking-[0.2em] text-white/60"
                    >
                      {bucket.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {allZero ? (
        <p className="text-sm text-white/60">{emptyMessage}</p>
      ) : null}
    </div>
  );
}
