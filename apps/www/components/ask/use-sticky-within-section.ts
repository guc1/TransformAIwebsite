"use client";

import { type RefObject, useEffect, useMemo, useState } from "react";

type StickyWithinSectionOptions = {
  enabled: boolean;
  bottomRef: RefObject<Element>;
  topOffset: number;
  bottomOffset: number;
};

export function useStickyWithinSection({
  enabled,
  bottomRef,
  topOffset,
  bottomOffset,
}: StickyWithinSectionOptions) {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsAtBottom(false);
      return;
    }

    const sentinel = bottomRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        setIsAtBottom(entry.isIntersecting && entry.intersectionRatio >= 0.95);
      },
      {
        threshold: [0, 1],
        root: null,
        rootMargin: `0px 0px -${bottomOffset}px 0px`,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [bottomOffset, bottomRef, enabled]);

  return useMemo(
    () => ({
      isAtBottom,
      style: enabled
        ? isAtBottom
          ? ({ position: "sticky", bottom: `${bottomOffset}px` } as const)
          : ({ position: "sticky", top: `${topOffset}px` } as const)
        : ({ position: "relative" } as const),
    }),
    [bottomOffset, enabled, isAtBottom, topOffset],
  );
}
