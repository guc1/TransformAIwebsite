import { type RefObject, useEffect, useState } from "react";

type StickyOptions = {
  topOffset?: number;
};

type StickySentinels = {
  topRef: RefObject<Element>;
  bottomRef: RefObject<Element>;
};

export type StickyState = {
  isSticky: boolean;
  isAtBottom: boolean;
};

export function useStickyWithinSection(
  { topRef, bottomRef }: StickySentinels,
  { topOffset = 96 }: StickyOptions = {},
): StickyState {
  const [state, setState] = useState<StickyState>({ isSticky: false, isAtBottom: false });

  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;

    if (!top || !bottom || typeof IntersectionObserver === "undefined") {
      return;
    }

    let frame: number | null = null;

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (frame !== null) {
          cancelAnimationFrame(frame);
        }
        frame = requestAnimationFrame(() => {
          setState((prev) => ({ ...prev, isSticky: entry.intersectionRatio < 1 }));
        });
      },
      { threshold: [1], rootMargin: `-${topOffset}px 0px 0px 0px` },
    );

    const bottomObserver = new IntersectionObserver(([entry]) => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(() => {
        setState((prev) => ({ ...prev, isAtBottom: entry.isIntersecting }));
      });
    });

    topObserver.observe(top);
    bottomObserver.observe(bottom);

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [topRef, bottomRef, topOffset]);

  return state;
}
