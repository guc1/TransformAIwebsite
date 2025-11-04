"use client";
import { PricingChat } from "@/components/ask";
import { CTA } from "@/components/cta";
import { PricingCompareTable } from "@/components/pricing/pricing-compare-table";
import { ShinyCardGroup } from "@/components/shiny-card";
import { TopLeftShiningLight, TopRightShiningLight } from "@/components/svg/hero";
import { cn } from "@/lib/utils";
import { Check, GraduationCap, Handshake, Languages, Sparkles, Timer, TrendingUp } from "lucide-react";
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
  const locale = useLocale();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const highlightItems = [
    { icon: Timer, label: header("highlights.speed") },
    { icon: Languages, label: header("highlights.support") },
    { icon: TrendingUp, label: header("highlights.roi") },
  ] as const;

  const basicEducationContactHref = "mailto:support@unkey.dev?subject=TransformAI%20Basic%20Education%20Module";
  const advancedEducationContactHref = "mailto:support@unkey.dev?subject=TransformAI%20Advanced%20Education%20Module";
  const aiseoBetaContactHref = "mailto:support@unkey.dev?subject=TransformAI%20AISEO%20Beta%20Application";
  const overviewContactHref = "mailto:support@unkey.dev?subject=TransformAI%20AI%20Situation%20Overview";
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

            {header("eyebrow") ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 shadow-[0_0_32px_rgba(59,130,246,0.15)]">
                <Sparkles className="h-4 w-4 text-sky-200" />
                {header("eyebrow")}
              </span>
            ) : null}

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight text-transparent sm:text-5xl sm:leading-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text">
              {header("title")}
            </h1>

            <p className="mt-4 text-balance text-base text-white/70 sm:text-lg">
              {header.rich("subtitle", {
                contact: (chunks) => (
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/[0.08] px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                  >
                    {chunks}
                  </Link>
                ),
              })}
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

        <PricingCompareTable />

        <div id="pricing-tier-grid" className="mt-12">
          <ShinyCardGroup className="grid h-full max-w-6xl grid-cols-1 gap-6 mx-auto group md:grid-cols-2 xl:grid-cols-3">
            <PricingCard id="pricing-tier-1" color={Color.White} className="col-span-1">
              <FreeCardHighlight className="absolute top-0 right-0 pointer-events-none" />

              <PricingCardHeader
                title={packages("basicEducation.title")}
                description={packages("basicEducation.description")}
                className="bg-gradient-to-tr from-transparent to-[#ffffff]/10 "
                color={Color.White}
                icon={GraduationCap}
              />
              <Separator />

              <PricingCardContent>
                <Cost
                  dollar={packages("basicEducation.price")}
                  frequency={packages("basicEducation.frequency")}
                />
                <Button label={packages("basicEducation.cta")} href={basicEducationContactHref} />
                <Bullets title={packages("common.included")}> 
                  <li>
                    <Bullet Icon={Check} label={packages("basicEducation.bullets.customLessons")} color={Color.White} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("basicEducation.bullets.foundations")} color={Color.White} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("basicEducation.bullets.handsOn")} color={Color.White} />
                  </li>
                  <li>
                    <Bullet
                      Icon={Check}
                      label={packages("basicEducation.bullets.catalog")}
                      color={Color.White}
                    />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("basicEducation.bullets.twoHours")} color={Color.White} />
                  </li>
                </Bullets>
              </PricingCardContent>
              <PricingCardFooter>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-white">{packages("basicEducation.footer.title")}</p>
                  <p className="text-xs text-white/60">{packages("basicEducation.footer.body")}</p>
                </div>
              </PricingCardFooter>
            </PricingCard>

            <PricingCard id="pricing-tier-2" color={Color.Yellow} className="col-span-1">
              <ProCardHighlight className="absolute top-0 right-0 pointer-events-none" />

              <PricingCardHeader
                title={packages("advancedEducation.title")}
                description={packages("advancedEducation.description")}
                className="bg-gradient-to-tr from-black/50 to-[#FFD600]/10 "
                color={Color.Yellow}
                icon={Sparkles}
              />
              <Separator />

              <PricingCardContent>
                <Cost
                  dollar={packages("advancedEducation.price")}
                  frequency={packages("advancedEducation.frequency")}
                />
                <Button label={packages("advancedEducation.cta")} href={advancedEducationContactHref} />
                <Bullets title={packages("common.included")}> 
                  <li>
                    <Bullet Icon={Check} label={packages("advancedEducation.bullets.innovationTracks")} color={Color.Yellow} />
                  </li>
                  <li>
                    <Bullet
                      Icon={Check}
                      label={packages("advancedEducation.bullets.customBuilds")}
                      color={Color.Yellow}
                    />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("advancedEducation.bullets.tooling")} color={Color.Yellow} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("advancedEducation.bullets.catalog")} color={Color.Yellow} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("advancedEducation.bullets.mentorship")} color={Color.Yellow} />
                  </li>
                </Bullets>
              </PricingCardContent>
              <PricingCardFooter>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-white">{packages("advancedEducation.footer.title")}</p>
                  <p className="text-xs text-white/60">{packages("advancedEducation.footer.body")}</p>
                </div>
              </PricingCardFooter>
            </PricingCard>

            <PricingCard id="pricing-tier-3" color={Color.Purple} className="col-span-1 xl:col-span-1">
              <EnterpriseCardHighlight className="absolute top-0 right-0 pointer-events-none" />

              <div className="flex flex-col h-full">
                <PricingCardHeader
                  title={packages("platform.title")}
                  description={packages("platform.description")}
                  color={Color.Purple}
                  className="bg-gradient-to-tr from-transparent to-[#9D72FF]/10 "
                  icon={Languages}
                />
                <Separator />
                <PricingCardContent>
                  <Cost
                    dollar={packages("platform.price")}
                    frequency={packages("platform.frequency")}
                  />
                  <Button label={packages("platform.cta")} disabled />
                  <Bullets title={packages("common.included")}>
                    <li>
                      <Bullet Icon={Check} label={packages("platform.bullets.operatingSystem")} color={Color.Purple} />
                    </li>
                    <li>
                      <Bullet Icon={Check} label={packages("platform.bullets.efficiency")} color={Color.Purple} />
                    </li>
                    <li>
                      <Bullet Icon={Check} label={packages("platform.bullets.integrations")} color={Color.Purple} />
                    </li>
                    <li>
                      <Bullet Icon={Check} label={packages("platform.bullets.guidance")} color={Color.Purple} />
                    </li>
                    <li>
                      <Bullet Icon={Check} label={packages("platform.bullets.insights")} color={Color.Purple} />
                    </li>
                  </Bullets>
                </PricingCardContent>
                <PricingCardFooter>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold text-white">{packages("platform.footer.title")}</p>
                    <p className="text-xs text-white/60">{packages("platform.footer.body")}</p>
                  </div>
                </PricingCardFooter>
              </div>
            </PricingCard>

            <PricingCard color={Color.White} className="col-span-1">
              <PricingCardHeader
                title={packages("aiseo.title")}
                description={packages("aiseo.description")}
                className="bg-gradient-to-tr from-transparent to-[#ffffff]/10 "
                color={Color.White}
                icon={TrendingUp}
              />
              <Separator />
              <PricingCardContent>
                <Cost dollar={packages("aiseo.price")} frequency={packages("aiseo.frequency")} />
                <Button label={packages("aiseo.cta")} href={aiseoBetaContactHref} />
                <Bullets title={packages("common.included")}>
                  <li>
                    <Bullet Icon={Check} label={packages("aiseo.bullets.aiVisibility")} color={Color.White} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("aiseo.bullets.knowledgeGraphs")} color={Color.White} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("aiseo.bullets.searchFuture")} color={Color.White} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("aiseo.bullets.experimentation")} color={Color.White} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("aiseo.bullets.reporting")} color={Color.White} />
                  </li>
                </Bullets>
              </PricingCardContent>
              <PricingCardFooter>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-white">{packages("aiseo.footer.title")}</p>
                  <p className="text-xs text-white/60">{packages("aiseo.footer.body")}</p>
                </div>
              </PricingCardFooter>
            </PricingCard>

            <PricingCard color={Color.Yellow} className="col-span-1">
              <PricingCardHeader
                title={packages("overview.title")}
                description={packages("overview.description")}
                className="bg-gradient-to-tr from-black/50 to-[#FFD600]/10 "
                color={Color.Yellow}
                icon={Handshake}
              />
              <Separator />
              <PricingCardContent>
                <Cost dollar={packages("overview.price")} frequency={packages("overview.frequency")} />
                <Button label={packages("overview.cta")} href={overviewContactHref} />
                <Bullets title={packages("common.included")}>
                  <li>
                    <Bullet Icon={Check} label={packages("overview.bullets.topTierAdvice")} color={Color.Yellow} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("overview.bullets.situationOverview")} color={Color.Yellow} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("overview.bullets.report")} color={Color.Yellow} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("overview.bullets.benchmark")} color={Color.Yellow} />
                  </li>
                  <li>
                    <Bullet Icon={Check} label={packages("overview.bullets.endToEnd")} color={Color.Yellow} />
                  </li>
                </Bullets>
              </PricingCardContent>
              <PricingCardFooter>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-white">{packages("overview.footer.title")}</p>
                  <p className="text-xs text-white/60">{packages("overview.footer.body")}</p>
                </div>
              </PricingCardFooter>
            </PricingCard>
          </ShinyCardGroup>
      </div>
      <BelowEnterpriseSvg className="container inset-x-0 top-0 mx-auto -mt-64 -mb-32" />

      <div className="-mx-4 lg:mx-0">
        <CTA />
      </div>
    </div>
    </div>
  );
}
