"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimate, useInView, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type HoursSavedTickerProps = {
  initialAmount: number;
  initialFormattedAmount: string;
  initialNextUpdateAt: string | null;
  locale: string;
  className?: string;
};

type HoursSavedState = {
  amount: number;
  nextUpdateAt: string | null;
};

const FALLBACK_REFRESH_INTERVAL_MS = 60_000;

export function HoursSavedTicker({
  initialAmount,
  initialFormattedAmount,
  initialNextUpdateAt,
  locale,
  className,
}: HoursSavedTickerProps) {
  const [state, setState] = useState<HoursSavedState>({
    amount: initialAmount,
    nextUpdateAt: initialNextUpdateAt,
  });
  const [displayAmount, setDisplayAmount] = useState(initialAmount);
  const [isHydrated, setIsHydrated] = useState(false);
  const reducedMotion = useReducedMotion();
  const [scope, animateScope] = useAnimate<HTMLSpanElement>();
  const isInView = useInView(scope, { margin: "-10% 0px", amount: 0.6 });
  const targetAmountRef = useRef(initialAmount);
  const displayAmountRef = useRef(initialAmount);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchLatestRef = useRef<(() => Promise<void>) | null>(null);
  const didRunInitialFetchRef = useRef(false);
  const initialFormattedRef = useRef(initialFormattedAmount);

  const updateDisplayValue = useCallback((value: number) => {
    displayAmountRef.current = value;
    setDisplayAmount(value);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    initialFormattedRef.current = initialFormattedAmount;
  }, [initialFormattedAmount]);

  const cancelAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    const target = targetAmountRef.current;
    const current = displayAmountRef.current;

    if (current === target) {
      return;
    }

    cancelAnimation();

    let didAnimateScale = false;

    const runStep = () => {
      const latestTarget = targetAmountRef.current;
      const latestCurrent = displayAmountRef.current;

      if (latestCurrent === latestTarget) {
        animationTimeoutRef.current = null;
        return;
      }

      const remaining = latestTarget - latestCurrent;
      const direction = Math.sign(remaining);
      const magnitude = Math.abs(remaining);
      const ratio = Math.min(0.25, 0.08 + Math.random() * 0.12);
      const step = Math.max(1, Math.round(magnitude * ratio));
      const nextValue =
        direction > 0
          ? Math.min(latestTarget, latestCurrent + step)
          : Math.max(latestTarget, latestCurrent - step);

      updateDisplayValue(nextValue);

      if (!didAnimateScale && scope.current) {
        didAnimateScale = true;
        void animateScope(scope.current, { scale: [1, 1.05, 1] }, { duration: 0.6, ease: "easeOut" });
      }

      if (nextValue === latestTarget) {
        animationTimeoutRef.current = null;
        return;
      }

      const delay = 140 + Math.random() * 220;
      animationTimeoutRef.current = setTimeout(runStep, delay);
    };

    runStep();
  }, [animateScope, cancelAnimation, scope, updateDisplayValue]);

  useEffect(() => {
    setState({ amount: initialAmount, nextUpdateAt: initialNextUpdateAt });
    targetAmountRef.current = initialAmount;
    if (reducedMotion) {
      cancelAnimation();
      updateDisplayValue(initialAmount);
    }
  }, [cancelAnimation, initialAmount, initialNextUpdateAt, reducedMotion, updateDisplayValue]);

  useEffect(() => {
    targetAmountRef.current = state.amount;

    if (reducedMotion) {
      cancelAnimation();
      updateDisplayValue(state.amount);
      return;
    }

    if (isInView) {
      startAnimation();
    }
  }, [cancelAnimation, isInView, reducedMotion, startAnimation, state.amount, updateDisplayValue]);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation();
      updateDisplayValue(targetAmountRef.current);
      return;
    }

    if (isInView) {
      if (displayAmountRef.current !== targetAmountRef.current) {
        startAnimation();
      }
    } else {
      cancelAnimation();
    }
  }, [cancelAnimation, isInView, reducedMotion, startAnimation, updateDisplayValue]);

  useEffect(() => () => cancelAnimation(), [cancelAnimation]);

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

    fetchLatestRef.current = async () => {
      if (cancelled) {
        return;
      }

      await fetchLatest();
    };

    if (!didRunInitialFetchRef.current) {
      didRunInitialFetchRef.current = true;
      void fetchLatest();
    }

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
      fetchLatestRef.current = null;
    };
  }, [state.nextUpdateAt]);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    void fetchLatestRef.current?.();
  }, [isInView]);

  const formatter = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new Intl.NumberFormat(locale);
  }, [locale]);

  const formatted = useMemo(() => {
    if (isHydrated) {
      return formatter?.format(displayAmount) ?? displayAmount.toLocaleString();
    }

    return initialFormattedRef.current;
  }, [displayAmount, formatter, isHydrated]);

  return (
    <span ref={scope} className={cn("inline-flex items-center font-medium text-white", className)} aria-live="polite">
      {formatted}
    </span>
  );
}
