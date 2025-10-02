import { PrimaryButton, SecondaryButton } from "@/components/button";
import { BookOpen, ChevronRight, LogIn } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type HeroMainSectionProps = {
  title: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  hoursSavedLabel: string;
  hoursSavedAmount: ReactNode;
};

export function HeroMainSection({
  title,
  body,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  hoursSavedLabel,
  hoursSavedAmount,
}: HeroMainSectionProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <h1 className="bg-gradient-to-br text-balance text-transparent bg-gradient-stop bg-clip-text from-white via-white via-30% to-white/30  font-medium text-6xl leading-none xl:text-[82px] tracking-tighter">
        {title}
      </h1>

      <p className="mt-6 sm:mt-8 bg-gradient-to-br text-transparent text-balance bg-gradient-stop bg-clip-text max-w-sm sm:max-w-lg xl:max-w-4xl from-white/70 via-white/70 via-40% to-white/30 text-base md:text-lg">
        {body}
      </p>

      <div className="mt-16 flex w-full flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
        <Link href={primaryCtaHref} className="group block w-full sm:inline-flex sm:w-auto sm:flex-shrink-0">
          <PrimaryButton
            shiny
            IconLeft={LogIn}
            label={primaryCtaLabel}
            className="h-10 w-full justify-center sm:w-auto sm:min-w-[200px]"
          />
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 font-semibold uppercase text-white/70 backdrop-blur-sm sm:gap-3 sm:px-8 sm:py-2.5 whitespace-nowrap">
          <span className="text-[0.75rem] tracking-[0.35em] text-white/60 sm:text-xs">{hoursSavedLabel}</span>
          <span className="text-white/40">:</span>
          <span
            className="text-sm tracking-[0.2em] text-white sm:text-base"
            aria-live="polite"
            aria-atomic="true"
          >
            {hoursSavedAmount}
          </span>
        </div>
        <Link href="/docs" className="hidden w-full sm:inline-flex sm:w-auto sm:flex-shrink-0">
          <SecondaryButton
            IconLeft={BookOpen}
            label={secondaryCtaLabel}
            IconRight={ChevronRight}
            className="sm:min-w-[200px] justify-center"
          />
        </Link>
      </div>
    </div>
  );
}
