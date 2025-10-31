"use client";
import { PricingChat } from "@/components/ask";
import { CTA } from "@/components/cta";
import { Particles } from "@/components/particles";
import { PricingCompareTable } from "@/components/pricing/pricing-compare-table";
import { ShinyCardGroup } from "@/components/shiny-card";
import { TopLeftShiningLight, TopRightShiningLight } from "@/components/svg/hero";
import { cn } from "@/lib/utils";
import {
  Check,
  GraduationCap,
  Handshake,
  Languages,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  BelowEnterpriseSvg,
  Bullet,
  Bullets,
  Button,
  Color,
  Cost,
  EnterpriseCardHighlight,
  FreeCardHighlight,
  PricingCard,
  PricingCardContent,
  PricingCardFooter,
  PricingCardHeader,
  ProCardHighlight,
  Separator,
} from "./components";

export default function PricingPage() {
  const header = useTranslations("Pricing.Header");
  const packages = useTranslations("Pricing.Packages");
  const comingSoon = useTranslations("Pricing.ComingSoon");
  const localeCode = useLocale();
  const contactPageHref = `/${localeCode}/contact`;
  const [isChatOpen, setIsChatOpen] = useState(false);

  const highlightItems = [
    { icon: Timer, label: header("highlights.speed") },
    { icon: Languages, label: header("highlights.support") },
    { icon: TrendingUp, label: header("highlights.roi") },
  ] as const;

  const educationContactHref = "mailto:support@unkey.dev?subject=TransformAI%20Education%20Package";
  const introductionContactHref = "mailto:support@unkey.dev?subject=TransformAI%20Introduction%20Package";
  const enterpriseContactHref = "mailto:support@unkey.dev?subject=TransformAI%20Enterprise%20Solutions";
  return (
    <div className="pt-[64px]">
      <PricingChat onOpenChange={setIsChatOpen} />
      <div
        className={cn(
          "px-4 mx-auto lg:px-0",
          "transition-[padding-right] duration-500 ease-out motion-reduce:transition-none",
          isChatOpen ? "lg:pr-[28rem] xl:pr-[30rem]" : "lg:pr-0",
        )}
      >
        <TopRightShiningLight />
        <TopLeftShiningLight />
        <div
          aria-hidden
          className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 w-[2679px] h-[540px] -scale-x-100"
        >
          <div className="absolute -left-[100px] w-[1400px] aspect-[1400/541] [mask-image:radial-gradient(50%_76%_at_92%_28%,_#FFF_0%,_#FFF_30.03%,_rgba(255,_255,_255,_0.00)_100%)]">
            <Image
              alt="Visual decoration auth chip"
              src="/images/landing/leveled-up-api-auth-chip-min.svg"
              fill
            />
          </div>
          <div className="absolute right-0 w-[1400px] aspect-[1400/541] [mask-image:radial-gradient(26%_76%_at_30%_6%,_#FFF_0%,_#FFF_30.03%,_rgba(255,_255,_255,_0.00)_100%)]">
            <Image
              alt="Visual decoration auth chip"
              src="/images/landing/leveled-up-api-auth-chip-min.svg"
              fill
            />
          </div>
        </div>

        <div className="relative my-16 xl:my-24 flex justify-center">
          <div className="relative isolate w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] px-6 py-14 text-center shadow-[0_28px_120px_rgba(15,23,42,0.45)] backdrop-blur sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-x-10 -top-40 h-[360px] rounded-full bg-gradient-to-r from-sky-400/40 via-blue-500/10 to-fuchsia-500/40 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.25),_rgba(15,23,42,0))]" />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 shadow-[0_0_32px_rgba(59,130,246,0.15)]">
              <Sparkles className="h-4 w-4 text-sky-200" />
              {header("eyebrow")}
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight text-transparent sm:text-5xl sm:leading-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text">
              {header("title")}
            </h1>

            <p className="mt-4 text-balance text-base text-white/70 sm:text-lg">
              {header("subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {highlightItems.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80 shadow-[0_0_24px_rgba(76,29,149,0.25)]"
                >
                  <Icon className="h-4 w-4 text-white/70" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-12">
          <div
            aria-hidden
            className="space-y-12 pointer-events-none select-none opacity-30 blur-sm"
          >
            <PricingCompareTable />

            <div id="pricing-tier-grid" className="mt-12">
              <ShinyCardGroup className="grid h-full max-w-4xl grid-cols-2 gap-6 mx-auto group">
                <PricingCard id="pricing-tier-1" color={Color.White} className="col-span-2 md:col-span-1">
                  <FreeCardHighlight className="absolute top-0 right-0 pointer-events-none" />

                  <PricingCardHeader
                    title={packages("education.title")}
                    description={packages("education.description")}
                    className="bg-gradient-to-tr from-transparent to-[#ffffff]/10 "
                    color={Color.White}
                    icon={GraduationCap}
                  />
                  <Separator />

                  <PricingCardContent>
                    <Cost
                      dollar={packages("education.price")}
                      frequency={packages("education.frequency")}
                    />
                    <Button label={packages("education.cta")} href={educationContactHref} />
                    <Bullets title={packages("common.included")}>
                      <li>
                        <Bullet Icon={Check} label={packages("education.bullets.courseV1")} color={Color.White} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("education.bullets.courseV2")} color={Color.White} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("education.bullets.workshops")} color={Color.White} />
                      </li>
                      <li>
                        <Bullet
                          Icon={Check}
                          label={packages("education.bullets.trainingMaterials")}
                          color={Color.White}
                        />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("education.bullets.certification")} color={Color.White} />
                      </li>
                    </Bullets>
                  </PricingCardContent>
                  <PricingCardFooter>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-bold text-white">{packages("education.footer.title")}</p>
                      <p className="text-xs text-white/60">{packages("education.footer.body")}</p>
                    </div>
                  </PricingCardFooter>
                </PricingCard>

                <PricingCard id="pricing-tier-2" color={Color.Yellow} className="col-span-2 md:col-span-1">
                  <ProCardHighlight className="absolute top-0 right-0 pointer-events-none" />

                  <PricingCardHeader
                    title={packages("introduction.title")}
                    description={packages("introduction.description")}
                    className="bg-gradient-to-tr from-black/50 to-[#FFD600]/10 "
                    color={Color.Yellow}
                    icon={Handshake}
                  />
                  <Separator />

                  <PricingCardContent>
                    <Cost
                      dollar={packages("introduction.price")}
                      frequency={packages("introduction.frequency")}
                    />
                    <Button label={packages("introduction.cta")} href={introductionContactHref} />
                    <Bullets title={packages("common.included")}>
                      <li>
                        <Bullet Icon={Check} label={packages("introduction.bullets.aiReadiness")} color={Color.Yellow} />
                      </li>
                      <li>
                        <Bullet
                          Icon={Check}
                          label={packages("introduction.bullets.automationSetup")}
                          color={Color.Yellow}
                        />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("introduction.bullets.pilotIntegration")} color={Color.Yellow} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("introduction.bullets.assessment")} color={Color.Yellow} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("introduction.bullets.guidance")} color={Color.Yellow} />
                      </li>
                    </Bullets>
                  </PricingCardContent>
                  <PricingCardFooter>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-bold text-white">{packages("introduction.footer.title")}</p>
                      <p className="text-xs text-white/60">{packages("introduction.footer.body")}</p>
                    </div>
                  </PricingCardFooter>
                </PricingCard>

                <PricingCard id="pricing-tier-3" color={Color.Purple} className="col-span-2">
                  <EnterpriseCardHighlight className="absolute top-0 right-0 pointer-events-none" />

                  <div className="flex flex-col h-full md:flex-row">
                    <div className="flex flex-col w-full gap-8">
                      <PricingCardHeader
                        title={packages("enterprise.title")}
                        description={packages("enterprise.description")}
                        color={Color.Purple}
                        className="bg-gradient-to-tr from-transparent to-[#9D72FF]/10 "
                        icon={Sparkles}
                      />
                      <PricingCardContent>
                        <Cost
                          dollar={packages("enterprise.price")}
                          frequency={packages("enterprise.frequency")}
                        />
                        <Link href={enterpriseContactHref}>
                          <div className="w-full p-px rounded-lg h-10 bg-gradient-to-r from-[#02DEFC] via-[#0239FC] to-[#7002FC] overflow-hidden">
                            <div className="bg-black rounded-[7px] h-full bg-opacity-95 hover:bg-opacity-25 duration-1000">
                              <div className="flex items-center justify-center w-full h-full bg-gradient-to-tr from-[#02DEFC]/20 via-[#0239FC]/20 to-[#7002FC]/20  rounded-[7px]">
                                <span className="text-sm font-semibold text-white">{packages("enterprise.cta")}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </PricingCardContent>
                  </div>
                  <Separator orientation="vertical" className="hidden md:flex" />
                  <Separator orientation="horizontal" className="md:hidden" />
                  <div className="relative w-full p-8">
                    <Particles
                      className="absolute inset-0 duration-500 opacity-50 -z-10 group-hover:opacity-100"
                      quantity={50}
                      color={Color.Purple}
                      vx={0.1}
                      vy={-0.1}
                    />
                    <Bullets title={packages("common.included")}>
                      <li>
                        <Bullet Icon={Check} label={packages("enterprise.bullets.tailoredIntegrations")} color={Color.Purple} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("enterprise.bullets.researchSupport")} color={Color.Purple} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("enterprise.bullets.customModel")} color={Color.Purple} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("enterprise.bullets.consulting")} color={Color.Purple} />
                      </li>
                      <li>
                        <Bullet Icon={Check} label={packages("enterprise.bullets.continuousSupport")} color={Color.Purple} />
                      </li>
                    </Bullets>
                  </div>
                </div>
              </PricingCard>
            </ShinyCardGroup>
          </div>
          <BelowEnterpriseSvg className="container inset-x-0 top-0 mx-auto -mt-64 -mb-32" />

          <div className="-mx-4 lg:mx-0">
            <CTA />
          </div>
        </div>
        <div className="pointer-events-auto absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[32px] bg-neutral-950/85 px-6 py-16 text-center backdrop-blur-xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{comingSoon("title")}</h2>
          <p className="max-w-xl text-base text-white/70">{comingSoon("subtitle")}</p>
          <Button label={comingSoon("cta")} href={contactPageHref} />
        </div>
        </div>
    </div>
    </div>
  );
}
