"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, useAnimate, useMotionValue, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type HoursSavedTickerProps = {
  initialAmount: number;
  initialNextUpdateAt: string | null;
  locale: string;
  className?: string;
};

type HoursSavedState = {
  amount: number;
  nextUpdateAt: string | null;
};

const FALLBACK_REFRESH_INTERVAL_MS = 60_000;

export function HoursSavedTicker({ initialAmount, initialNextUpdateAt, locale, className }: HoursSavedTickerProps) {
  const [state, setState] = useState<HoursSavedState>({
    amount: initialAmount,
    nextUpdateAt: initialNextUpdateAt,
  });
  const motionValue = useMotionValue(initialAmount);
  const [displayValue, setDisplayValue] = useState(initialAmount);
  const reducedMotion = useReducedMotion();
  const [scope, animateScope] = useAnimate<HTMLSpanElement>();

  useEffect(() => {
    setState({ amount: initialAmount, nextUpdateAt: initialNextUpdateAt });
    setDisplayValue(initialAmount);
    motionValue.set(initialAmount);
  }, [initialAmount, initialNextUpdateAt, motionValue]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return () => {
      unsubscribe();
    };
  }, [motionValue]);

  useEffect(() => {
    if (reducedMotion) {
      motionValue.set(state.amount);
      setDisplayValue(state.amount);
      return;
    }

    const controls = animate(motionValue, state.amount, {
      duration: 0.8,
      ease: "easeOut",
    });

    if (scope.current) {
      void animateScope(scope.current, { scale: [1, 1.05, 1] }, { duration: 0.6, ease: "easeOut" });
    }

    return () => {
      controls.stop();
    };
  }, [state.amount, animateScope, motionValue, reducedMotion, scope]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchLatest = async () => {
      try {
        const response = await fetch("/api/hours-saved", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          currentAmount: number;
          nextUpdateAt: string | null;
        };

        if (!cancelled) {
          setState({ amount: data.currentAmount, nextUpdateAt: data.nextUpdateAt });
        }
      } catch (error) {
        console.error("Failed to refresh hours saved ticker", error);
      }
    };

    const scheduleNextFetch = () => {
      if (!state.nextUpdateAt) {
        return;
      }

      const targetTime = new Date(state.nextUpdateAt).getTime() - Date.now();
      const delay = Math.max(targetTime, 0) + 1200;
      timeoutId = setTimeout(fetchLatest, delay);
    };

    scheduleNextFetch();
    intervalId = setInterval(fetchLatest, FALLBACK_REFRESH_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchLatest();
      }
    };

    const handleFocus = () => {
      void fetchLatest();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [state.nextUpdateAt]);

  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const formatted = formatter.format(displayValue);

  return (
    <span ref={scope} className={cn("inline-flex items-center font-medium text-white", className)} aria-live="polite">
      {formatted}
    </span>
  );
}
