"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const START_DATE_MS = Date.UTC(2024, 8, 23, 0, 0, 0);
const BASE_HOURS = 100_000;
const INITIAL_DAILY_HOURS = 1_000;
const DAILY_GROWTH_FACTOR = 1.1;
const MS_PER_DAY = 86_400_000;
const UPDATE_INTERVAL_MS = 1_000;
const MIN_CHUNK = 3;

const scheduleCache = new Map<number, DailyEvent[]>();
const dailyTotalCache = new Map<number, number>();
const completedAdditionCache = new Map<number, number>([[0, 0]]);

type DailyEvent = {
  timeFraction: number;
  cumulativeHours: number;
};

function createSeededRandom(seed: number) {
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed = (seed + Math.imul(seed ^ (seed >>> 7), 61 | seed)) ^ seed;
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailyTotal(dayIndex: number): number {
  const cached = dailyTotalCache.get(dayIndex);
  if (cached !== undefined) {
    return cached;
  }

  const value = Math.max(
    0,
    Math.round(INITIAL_DAILY_HOURS * Math.pow(DAILY_GROWTH_FACTOR, Math.max(0, dayIndex))),
  );

  dailyTotalCache.set(dayIndex, value);
  return value;
}

function getCompletedAddition(fullDays: number): number {
  if (fullDays <= 0) {
    return 0;
  }

  const cached = completedAdditionCache.get(fullDays);
  if (cached !== undefined) {
    return cached;
  }

  let lastKnown = fullDays - 1;
  while (lastKnown > 0 && !completedAdditionCache.has(lastKnown)) {
    lastKnown -= 1;
  }

  let total = completedAdditionCache.get(lastKnown) ?? 0;

  for (let index = Math.max(0, lastKnown); index < fullDays; index += 1) {
    total += getDailyTotal(index);
    completedAdditionCache.set(index + 1, total);
  }

  return completedAdditionCache.get(fullDays) ?? total;
}

function getDailySchedule(dayIndex: number): DailyEvent[] {
  const cached = scheduleCache.get(dayIndex);
  if (cached) {
    return cached;
  }

  const dailyTotal = getDailyTotal(dayIndex);
  if (dailyTotal <= 0) {
    const baseline: DailyEvent[] = [{ timeFraction: 1, cumulativeHours: 0 }];
    scheduleCache.set(dayIndex, baseline);
    return baseline;
  }

  const random = createSeededRandom(0x4ba2d + dayIndex * 0x9e3779b1);
  const events: { chunk: number; gapWeight: number }[] = [];
  let remaining = dailyTotal;

  while (remaining > 0) {
    const progress = 1 - remaining / dailyTotal;
    const baseCap = Math.pow(dailyTotal, 0.42);
    const stretchCap = Math.pow(dailyTotal, 0.65);
    const chunkUpper = Math.max(
      MIN_CHUNK + 3,
      Math.round(baseCap + (stretchCap - baseCap) * Math.pow(progress, 1.15)),
    );

    const chunkRange = Math.max(chunkUpper - MIN_CHUNK, 4);
    let chunk = MIN_CHUNK + Math.floor(random() * chunkRange);

    if (random() > 0.88) {
      chunk += Math.floor(random() * Math.max(chunkRange * 0.4, 2));
    }

    chunk = Math.min(chunk, remaining);

    if (remaining - chunk < MIN_CHUNK && remaining - chunk > 0) {
      chunk = remaining;
    }

    chunk = Math.max(1, chunk);

    const baseGap = 0.45 + random() * 1.1;
    const chunkGapBoost = (chunk / (chunkUpper + 1)) * (0.6 + random() * 0.9);
    let gapWeight = baseGap + chunkGapBoost;

    if (random() > 0.92) {
      gapWeight *= 1.8 + random();
    }

    events.push({ chunk, gapWeight });
    remaining -= chunk;
  }

  const startOffset = 0.035 + random() * 0.05;
  const endOffset = 0.97 - random() * 0.025;
  const totalGapWeight = events.reduce((sum, event) => sum + event.gapWeight, 0);
  const gapScale =
    totalGapWeight > 0 ? (endOffset - startOffset) / totalGapWeight : endOffset - startOffset;

  let cursor = startOffset;
  let cumulative = 0;
  const schedule: DailyEvent[] = [];

  events.forEach((event, index) => {
    const idleBoost = random() > 0.9 ? random() * 0.08 : 0;
    cursor = Math.min(endOffset, cursor + event.gapWeight * gapScale + idleBoost);
    cumulative = Math.min(dailyTotal, cumulative + event.chunk);

    schedule.push({
      timeFraction: index === events.length - 1 ? endOffset : cursor,
      cumulativeHours: cumulative,
    });
  });

  schedule.push({ timeFraction: 1, cumulativeHours: dailyTotal });

  scheduleCache.set(dayIndex, schedule);
  return schedule;
}

function getCurrentDayContribution(dayIndex: number, nowMs: number): number {
  const dayStart = START_DATE_MS + dayIndex * MS_PER_DAY;
  const dayEnd = dayStart + MS_PER_DAY;

  if (nowMs <= dayStart) {
    return 0;
  }

  if (nowMs >= dayEnd) {
    return getDailyTotal(dayIndex);
  }

  const fraction = (nowMs - dayStart) / MS_PER_DAY;
  const schedule = getDailySchedule(dayIndex);

  let contribution = 0;
  for (const event of schedule) {
    if (fraction >= event.timeFraction) {
      contribution = event.cumulativeHours;
    } else {
      break;
    }
  }

  return contribution;
}

function calculateHoursSaved(nowMs: number): number {
  if (nowMs <= START_DATE_MS) {
    return BASE_HOURS;
  }

  const elapsedMs = nowMs - START_DATE_MS;
  const elapsedDays = elapsedMs / MS_PER_DAY;
  const fullDays = Math.floor(elapsedDays);
  const safeFullDays = Math.max(0, fullDays);

  const completedAddition = getCompletedAddition(safeFullDays);
  const currentDayContribution = getCurrentDayContribution(safeFullDays, nowMs);

  return BASE_HOURS + completedAddition + currentDayContribution;
}

type HoursSavedTickerProps = {
  className?: string;
};

export function HoursSavedTicker({ className }: HoursSavedTickerProps) {
  const t = useTranslations("CTA");
  const shouldReduceMotion = useReducedMotion();
  const [hoursSaved, setHoursSaved] = useState(() => Math.floor(calculateHoursSaved(Date.now())));

  useEffect(() => {
    const update = () => {
      const nowMs = Date.now();
      setHoursSaved((previous) => {
        const next = Math.floor(calculateHoursSaved(nowMs));
        return next < previous ? previous : next;
      });
    };

    const interval = window.setInterval(update, UPDATE_INTERVAL_MS);

    update();

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }),
    [],
  );

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
      className={cn(
        "flex min-h-[2.5rem] min-w-[170px] flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-center backdrop-blur-md",
        "[background:radial-gradient(circle_at_top,_rgba(255,255,255,0.12)_0%,_rgba(255,255,255,0)_65%)]",
        className,
      )}
    >
      <span className="text-2xl font-bold text-white tabular-nums" aria-live="polite" aria-atomic="true">
        {formatter.format(hoursSaved)}
      </span>
      <span className="mt-1 text-xs font-bold text-white">
        {t("hoursSavedLabel")}
      </span>
    </motion.div>
  );
}
