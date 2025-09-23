"use client";
import { PricingChat } from "@/components/ask";
import { CTA } from "@/components/cta";
import { Particles } from "@/components/particles";
import { PricingCompareTable } from "@/components/pricing/pricing-compare-table";
import { ShinyCardGroup } from "@/components/shiny-card";
import { TopLeftShiningLight, TopRightShiningLight } from "@/components/svg/hero";
import { cn } from "@/lib/utils";
import { Check, GraduationCap, Handshake, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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

        <div className="flex flex-col items-center justify-center my-16 xl:my-24">
          <h1
            className="max-sm:mx-6 max-sm:text-4xl font-medium text-[4rem] leading-[4rem] max-w-xl text-center bg-gradient-to-r from-[#02DEFC] via-[#0239FC] to-[#7002FC] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(32,57,252,0.45)]"
          >
            {header("title")}
          </h1>

          {/* <p className="mt-8 bg-gradient-to-br text-transparent bg-gradient-stop bg-clip-text from-white via-white via-40% to-white/30 max-w-lg text-center">
          We wanted pricing to be simple and affordable for anyone, so we've created flexible plans
          that don't need an accounting degree to figure out.
        </p>  */}
        </div>

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
    </div>
  );
}
