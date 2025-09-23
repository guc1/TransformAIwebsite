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

      <div className="mt-16 w-full max-w-3xl">
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
          <Link
            href="https://app.unkey.com"
            className="group flex justify-center sm:justify-self-end"
          >
            <PrimaryButton
              shiny
              IconLeft={LogIn}
              label={primaryCtaLabel}
              className="h-10"
            />
          </Link>

          <HoursSavedTicker className="sm:justify-self-center" />

          <Link href="/docs" className="hidden sm:flex sm:justify-self-start">
            <SecondaryButton
              IconLeft={BookOpen}
              label={secondaryCtaLabel}
              IconRight={ChevronRight}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
