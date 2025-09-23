"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  formatInt,
  getStorageKey,
  totalHoursUTC,
} from "@/lib/timeSeries/hoursSaved";

const HOURS_SAVED_STORAGE_KEY = getStorageKey();
const INITIAL_ANIMATION_DURATION = 1100;
const UPDATE_ANIMATION_DURATION = 400;
const TICK_INTERVAL_MS = 1000;

type StoredValue = {
  value: number;
  timestamp: string;
};

type HeroHoursSavedProps = {
  className?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function HeroHoursSaved({ className }: HeroHoursSavedProps) {
  const locale = useLocale();
  const t = useTranslations("Hero.hoursSaved");
  const prefersReducedMotion = useReducedMotion();

  const [displayed, setDisplayed] = useState(0);
  const displayedRef = useRef(0);
  const storedValueRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hasBootstrappedRef = useRef(false);

  const updateDisplayed = useCallback((value: number) => {
    displayedRef.current = value;
    setDisplayed(value);
  }, []);

  const persistValue = useCallback((value: number, timestamp: Date) => {
    const next = Math.max(value, storedValueRef.current);
    storedValueRef.current = next;

    try {
      const payload: StoredValue = {
        value: next,
        timestamp: timestamp.toISOString(),
      };
      window.localStorage.setItem(
        HOURS_SAVED_STORAGE_KEY,
        JSON.stringify(payload),
      );
    } catch (error) {
      // Silently ignore storage errors (e.g., Safari private mode)
    }
  }, []);

  const animateTo = useCallback(
    (target: number, duration: number) => {
      if (target <= displayedRef.current) {
        return;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (prefersReducedMotion || duration <= 0) {
        updateDisplayed(target);
        return;
      }

      const startValue = displayedRef.current;
      const delta = target - startValue;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeOutCubic(progress);
        const value = Math.round(startValue + delta * eased);
        updateDisplayed(value);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(tick);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(tick);
    },
    [prefersReducedMotion, updateDisplayed],
  );

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return;
    }

    hasBootstrappedRef.current = true;

    const now = new Date();
    const computed = totalHoursUTC(now);
    let storedValue = 0;

    try {
      const storedRaw = window.localStorage.getItem(HOURS_SAVED_STORAGE_KEY);
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw) as Partial<StoredValue>;
        if (typeof parsed.value === "number" && Number.isFinite(parsed.value)) {
          storedValue = parsed.value;
        }
      }
    } catch (error) {
      // Ignore JSON/availability errors and fall back to computed value
    }

    const initialTarget = Math.max(computed, storedValue);
    persistValue(initialTarget, now);
    animateTo(initialTarget, INITIAL_ANIMATION_DURATION);

    intervalRef.current = window.setInterval(() => {
      const current = new Date();
      const algoValue = totalHoursUTC(current);
      const target = Math.max(algoValue, storedValueRef.current);

      if (target > displayedRef.current) {
        persistValue(target, current);
        animateTo(target, UPDATE_ANIMATION_DURATION);
      }
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [animateTo, persistValue]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formatted = useMemo(
    () => formatInt(displayed, locale),
    [displayed, locale],
  );

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center backdrop-blur-md",
        "sm:min-w-[220px]",
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-[0.28em] text-white/60">
        {t("title")}
      </span>
      <div className="flex flex-col items-center">
        <span className="min-h-[3.5rem] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {formatted}
        </span>
        <span className="mt-3 h-[2px] w-full max-w-[160px] rounded-full bg-gradient-to-r from-white/25 via-white/5 to-white/25" />
      </div>
    </div>
  );
}
