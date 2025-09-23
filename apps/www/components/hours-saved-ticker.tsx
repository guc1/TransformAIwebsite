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

const scheduleCache = new Map<number, DailyUpdate[]>();

type DailyUpdate = {
  timeFraction: number;
  cumulativeProgress: number;
  easingWindow: number;
};

function createSeededRandom(seed: number) {
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed = (seed + Math.imul(seed ^ (seed >>> 7), 61 | seed)) ^ seed;
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function getDailySchedule(dayIndex: number): DailyUpdate[] {
  const cached = scheduleCache.get(dayIndex);
  if (cached) {
    return cached;
  }

  const random = createSeededRandom(0x4ba2d + dayIndex * 0x9e3779b1);
  const baseUpdates = 18 + Math.floor(random() * 12);
  const updates: { timeFraction: number; weight: number }[] = [];

  for (let index = 0; index < baseUpdates; index += 1) {
    updates.push({
      timeFraction: random(),
      weight: 0.45 + random(),
    });
  }

  updates.push({
    timeFraction: 0.02 + random() * 0.08,
    weight: 0.6 + random() * 0.4,
  });
  updates.push({
    timeFraction: 0.88 + random() * 0.1,
    weight: 0.7 + random() * 0.5,
  });
  updates.push({ timeFraction: 1, weight: 1 });

  updates.sort((a, b) => a.timeFraction - b.timeFraction);

  const totalWeight = updates.reduce((total, update) => total + update.weight, 0);

  const schedule: DailyUpdate[] = [];
  let cumulative = 0;
  let previousTime = 0;

  updates.forEach((update, index) => {
    cumulative += update.weight / totalWeight;
    const normalizedProgress = clamp(cumulative, 0, 1);
    const gap = Math.max(update.timeFraction - previousTime, 0.01);
    const easingWindow = index === updates.length - 1 ? 0.08 : clamp(gap * 0.6, 0.015, 0.12);

    schedule.push({
      timeFraction: clamp(update.timeFraction, 0, 1),
      cumulativeProgress: normalizedProgress,
      easingWindow,
    });

    previousTime = update.timeFraction;
  });

  scheduleCache.set(dayIndex, schedule);
  return schedule;
}

function getDailyProgress(dayIndex: number, nowMs: number): number {
  if (nowMs <= START_DATE_MS) {
    return 0;
  }

  const dayStart = START_DATE_MS + dayIndex * MS_PER_DAY;
  const dayEnd = dayStart + MS_PER_DAY;

  if (nowMs <= dayStart) {
    return 0;
  }

  if (nowMs >= dayEnd) {
    return 1;
  }

  const fraction = (nowMs - dayStart) / MS_PER_DAY;
  const schedule = getDailySchedule(dayIndex);

  let previousProgress = 0;

  for (const update of schedule) {
    const { timeFraction, cumulativeProgress, easingWindow } = update;
    const windowStart = timeFraction - easingWindow;

    if (fraction >= timeFraction) {
      previousProgress = cumulativeProgress;
      continue;
    }

    if (fraction >= windowStart) {
      const local = easingWindow > 0 ? (fraction - windowStart) / easingWindow : 1;
      const eased = easeOutCubic(clamp(local));
      return clamp(previousProgress + (cumulativeProgress - previousProgress) * eased);
    }

    return previousProgress;
  }

  return 1;
}

function calculateHoursSaved(nowMs: number): number {
  if (nowMs <= START_DATE_MS) {
    return BASE_HOURS;
  }

  const elapsedMs = nowMs - START_DATE_MS;
  const elapsedDays = elapsedMs / MS_PER_DAY;
  const fullDays = Math.floor(elapsedDays);
  const safeFullDays = Math.max(0, fullDays);

  const completedAddition =
    safeFullDays > 0
      ? (INITIAL_DAILY_HOURS * (Math.pow(DAILY_GROWTH_FACTOR, safeFullDays) - 1)) /
        (DAILY_GROWTH_FACTOR - 1)
      : 0;

  const currentDayAddition = INITIAL_DAILY_HOURS * Math.pow(DAILY_GROWTH_FACTOR, safeFullDays);
  const currentDayProgress = getDailyProgress(safeFullDays, nowMs);
  const partialAddition = currentDayAddition * currentDayProgress;

  return BASE_HOURS + completedAddition + partialAddition;
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
      setHoursSaved(Math.floor(calculateHoursSaved(Date.now())));
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
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white">
        {t("hoursSavedSince")}
      </span>
      <span className="mt-1 text-2xl font-bold text-white tabular-nums" aria-live="polite" aria-atomic="true">
        {formatter.format(hoursSaved)}
      </span>
      <span className="mt-1 text-xs font-semibold text-white">
        {t("hoursSavedLabel")}
      </span>
    </motion.div>
  );
}
