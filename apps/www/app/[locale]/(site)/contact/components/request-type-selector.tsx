"use client";

import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";

import type { ContactRequestType } from "../constants";

type RequestTypeOption = {
  value: ContactRequestType;
  title: string;
  description: string;
};

type RequestTypeSelectorProps = {
  label: string;
  helperText?: string;
  options: RequestTypeOption[];
  selected: ContactRequestType;
  onSelect: (value: ContactRequestType) => void;
  error?: string;
};

export function RequestTypeSelector({
  label,
  helperText,
  options,
  selected,
  onSelect,
  error,
}: RequestTypeSelectorProps) {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <span className="text-sm font-medium tracking-wide text-white/90">{label}</span>
        {helperText ? (
          <span className="text-xs text-white/50 sm:text-right">{helperText}</span>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(option.value)}
              disabled={pending}
              className={cn(
                "group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                isActive
                  ? "border-white/60 bg-white/[0.12] shadow-[0_18px_60px_rgba(59,130,246,0.25)]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08]",
                pending && "cursor-not-allowed opacity-70",
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100",
                  isActive && "opacity-100",
                  "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_rgba(59,130,246,0))]",
                )}
              />
              <div className="relative z-10 space-y-1">
                <p className="text-sm font-semibold text-white/90">{option.title}</p>
                <p className="text-xs leading-5 text-white/60">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-xs font-medium text-rose-300">{error}</p> : null}
      <input type="hidden" name="requestType" value={selected} />
    </div>
  );
}
