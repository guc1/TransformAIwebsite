"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { forwardRef, type FocusEventHandler, type MouseEventHandler } from "react";

type AskCtaProps = {
  label: string;
  pressed: boolean;
  onToggle: () => void;
  className?: string;
  loading?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
};

export const AskCta = forwardRef<HTMLButtonElement, AskCtaProps>(
  (
    { label, pressed, onToggle, className, loading = false, onMouseEnter, onFocus },
    ref,
  ) => {
    return (
      <button
        type="button"
        ref={ref}
        aria-pressed={pressed}
        onClick={onToggle}
        disabled={loading}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:active:scale-[0.98]",
          "hero-hiring-gradient p-[1.5px]",
          "aria-[pressed=true]:ring-1 aria-[pressed=true]:ring-white/40",
          loading ? "cursor-wait" : "",
          className,
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1.5px] rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-20 group-active:opacity-25"
        />
        <span
          className={cn(
            "relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white sm:px-8",
            "bg-black/60 backdrop-blur-xl",
            "shadow-[0_18px_40px_rgba(15,23,42,0.45)]",
          )}
        >
          {loading ? (
            <span
              className="inline-flex h-4 w-4 items-center justify-center"
              aria-hidden
            >
              <span className="h-3.5 w-3.5 rounded-full border border-white/50 border-t-transparent motion-safe:animate-spin" />
            </span>
          ) : (
            <Sparkles className="h-4 w-4 text-white/80" aria-hidden />
          )}
          <span>{label}</span>
        </span>
      </button>
    );
  },
);

AskCta.displayName = "AskCta";
