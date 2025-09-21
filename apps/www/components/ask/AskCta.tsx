"use client";

import { cn } from "@/lib/utils";
import { MessageCircleMore } from "lucide-react";
import { forwardRef } from "react";

type AskCtaProps = {
  label: string;
  pressed: boolean;
  onToggle: () => void;
  ariaControls?: string;
  className?: string;
};

export const AskCta = forwardRef<HTMLButtonElement, AskCtaProps>(
  ({ label, pressed, onToggle, ariaControls, className }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        aria-pressed={pressed}
        aria-controls={ariaControls}
        data-state={pressed ? "open" : "closed"}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full p-[1px] text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black", 
          "hero-hiring-gradient shadow-lg shadow-sky-500/20",
          "hover:shadow-sky-400/25 active:scale-[0.98]",
          className,
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/20 via-sky-500/25 to-purple-500/20 opacity-70 transition duration-300 group-hover:opacity-100 group-data-[state=open]:opacity-100"
        />
        <span
          className={cn(
            "relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition duration-300",
            "bg-white/10 backdrop-blur-xl",
            "group-hover:bg-white/15 group-data-[state=open]:bg-white/15",
          )}
        >
          <MessageCircleMore
            aria-hidden
            className="h-4 w-4 text-sky-200 transition duration-300 group-hover:rotate-3 group-data-[state=open]:rotate-3"
          />
          {label}
        </span>
      </button>
    );
  },
);

AskCta.displayName = "AskCta";
