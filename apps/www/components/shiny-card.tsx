"use client";

import type React from "react";
import {
  Children,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

type ShinyCardGroupProps = {
  children: React.ReactNode;
  className?: string;
  refresh?: boolean;
};

export const ShinyCardGroup: React.FC<ShinyCardGroupProps> = ({
  children,
  className = "",
  refresh = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<HTMLElement[]>([]);
  const boxOffsetsRef = useRef<Array<{ left: number; top: number }>>([]);
  const pointerFrameRef = useRef<number | null>(null);
  const childCount = useMemo(() => Children.count(children), [children]);

  const measureBoxes = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      boxesRef.current = [];
      boxOffsetsRef.current = [];
      return;
    }

    boxesRef.current = Array.from(container.children).map((el) => el as HTMLElement);
    const containerRect = container.getBoundingClientRect();

    boxOffsetsRef.current = boxesRef.current.map((box) => {
      const rect = box.getBoundingClientRect();
      return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
      };
    });
  }, []);

  useEffect(() => {
    measureBoxes();
  }, [measureBoxes, refresh, childCount]);

  useEffect(() => {
    const handleResize = () => {
      measureBoxes();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [measureBoxes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureBoxes();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [measureBoxes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }

      pointerFrameRef.current = window.requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
          pointerFrameRef.current = null;
          return;
        }

        boxesRef.current.forEach((box, index) => {
          const bounds = boxOffsetsRef.current[index];
          if (!bounds) {
            return;
          }

          const boxX = x - bounds.left;
          const boxY = y - bounds.top;
          box.style.setProperty("--mouse-x", `${boxX}px`);
          box.style.setProperty("--mouse-y", `${boxY}px`);
        });

        pointerFrameRef.current = null;
      });
    };

    const handlePointerLeave = () => {
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = null;
      }
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = null;
      }
    };
  }, [childCount]);

  return (
    <div className={className} ref={containerRef}>
      {children}
    </div>
  );
};

type ShinyCardProps = {
  children: React.ReactNode;
  className?: string;
  shine?: string;
};

export const ShinyCard: React.FC<PropsWithChildren<ShinyCardProps>> = ({
  children,
  className = "",
  shine = "#ffffff",
}) => {
  return (
    <div
      className={`relative bg-neutral-800 rounded-4xl p-px
    after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),${shine},transparent)] after:group-hover:opacity-100 after:z-10 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

export const WhiteShinyCard: React.FC<PropsWithChildren<ShinyCardProps>> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`relative bg-neutral-800 rounded-4xl p-px
    after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),theme(colors.gray.500),transparent)] after:group-hover:opacity-100 after:z-10 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};
