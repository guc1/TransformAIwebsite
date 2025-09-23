import Link from "next/link";

import { PrimaryButton, SecondaryButton } from "@/components/button";
import { HoursSavedTicker } from "@/components/hours-saved-ticker";
import { BookOpen, ChevronRight, LogIn } from "lucide-react";

type HeroMainSectionProps = {
  title: string;
  body: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
};

export function HeroMainSection({
  title,
  body,
  primaryCtaLabel,
  secondaryCtaLabel,
}: HeroMainSectionProps) {
  return (
    <div className="relative flex flex-col items-center text-center ">
      <h1 className="bg-gradient-to-br text-balance text-transparent bg-gradient-stop bg-clip-text from-white via-white via-30% to-white/30  font-medium text-6xl leading-none xl:text-[82px] tracking-tighter">
        {title}
      </h1>

      <p className="mt-6 sm:mt-8 bg-gradient-to-br text-transparent text-balance bg-gradient-stop bg-clip-text max-w-sm sm:max-w-lg xl:max-w-4xl from-white/70 via-white/70 via-40% to-white/30 text-base md:text-lg">
        {body}
      </p>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <Link href="https://app.unkey.com" className="group">
          <PrimaryButton
            shiny
            IconLeft={LogIn}
            label={primaryCtaLabel}
            className="h-10"
          />
        </Link>

        <HoursSavedTicker />

        <Link href="/docs" className="hidden sm:flex">
          <SecondaryButton
            IconLeft={BookOpen}
            label={secondaryCtaLabel}
            IconRight={ChevronRight}
          />
        </Link>
      </div>
    </div>
  );
}
