export const dynamic = "force-dynamic";

import { AnalyticsBento } from "@/components/analytics/analytics-bento";
import { AuditLogsBento } from "@/components/audit-logs-bento";
import { PrimaryButton, SecondaryButton } from "@/components/button";
import { CTA } from "@/components/cta";
import { FeatureGrid } from "@/components/feature/feature-grid";
import { HashedKeysBento } from "@/components/hashed-keys-bento";
import { Hero } from "@/components/hero/hero";
import type { HoursSavedNumberFormatOptions } from "@/components/hero/hours-saved-ticker";
import { ImageWithBlur } from "@/components/image-with-blur";
import { IpWhitelistingBento } from "@/components/ip-whitelisting-bento";
import { LatencyBento } from "@/components/latency-bento";
import { OpenSource } from "@/components/open-source";
import { RateLimitsBento } from "@/components/rate-limits-bento";
import { Section, SectionTitle } from "@/components/section";
import { FeatureGridChip } from "@/components/svg/feature-grid-chip";
import { TopLeftShiningLight, TopRightShiningLight } from "@/components/svg/hero";
import { OssLight } from "@/components/svg/oss-light";
import { UsageBento } from "@/components/usage-bento";
import { isLocale } from "@/i18n/routing";
import { getHoursSavedOverview } from "@/lib/hours-saved";
import { env } from "@/lib/env";
import {
  BarChart3,
  ChevronRight,
  Clock,
  Handshake,
  GraduationCap,
  Lightbulb,
  LineChart,
  LogIn,
  Puzzle,
  Rocket,
  Scale,
  ShieldCheck,
  Sprout,
  UsersRound,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import mainboard from "@/images/mainboard.svg";
import { DesktopLogoCloud, MobileLogoCloud } from "./(components)/logo-cloud-content";
import { CodeExamples } from "../../code-examples";

type LandingPageMetadataProps = {
  params: {
    locale: string;
  };
};

type LandingPageProps = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({
  params,
}: LandingPageMetadataProps): Promise<Metadata> {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = new URL(env().NEXT_PUBLIC_BASE_URL);
  const pathname = locale === "nl" ? "/" : `/${locale}`;
  const pageUrl = new URL(pathname, baseUrl);

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "TransformAI",
      "AI consultancy Netherlands",
      "AI strategy",
      "AI implementation",
      "AI training",
    ],
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      url: pageUrl.toString(),
      siteName: t("openGraph.siteName"),
      images: [
        {
          url: `${baseUrl.origin}/og.png`,
          width: 1200,
          height: 675,
        },
      ],
    },
    twitter: {
      title: t("twitter.title"),
      description: t("twitter.description"),
      card: "summary_large_image",
    },
  };
}

export default async function Landing({
  params,
}: LandingPageProps) {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  noStore();

  const meetingHref = `/${locale}/meeting` as const;
  const solutionsHref = `/${locale}/pricing` as const;
  const contactHref = `/${locale}/contact` as const;

  const [cta, platform, hero, featureSection, homepage] = await Promise.all([
    getTranslations({ locale, namespace: "CTA" }),
    getTranslations({ locale, namespace: "Platform" }),
    getTranslations({ locale, namespace: "Hero" }),
    getTranslations({ locale, namespace: "FeatureSection" }),
    getTranslations({ locale, namespace: "Homepage" }),
  ]);

  const hoursSavedOverview = await getHoursSavedOverview();
  const hoursSavedFormatter = new Intl.NumberFormat(locale);
  const hoursSavedInitialFormatted = hoursSavedFormatter.format(
    hoursSavedOverview.currentAmount,
  );
  const hoursSavedFormatterResolved = hoursSavedFormatter.resolvedOptions();
  const hoursSavedInitialFormatterLocale = hoursSavedFormatterResolved.locale;
  const hoursSavedInitialFormatterOptions: HoursSavedNumberFormatOptions = {
    locale: hoursSavedFormatterResolved.locale,
    numberingSystem: hoursSavedFormatterResolved.numberingSystem,
    style: hoursSavedFormatterResolved.style,
    currency: hoursSavedFormatterResolved.currency,
    currencyDisplay: hoursSavedFormatterResolved.currencyDisplay,
    currencySign: hoursSavedFormatterResolved.currencySign,
    unit: hoursSavedFormatterResolved.unit,
    unitDisplay: hoursSavedFormatterResolved.unitDisplay,
    notation: hoursSavedFormatterResolved.notation,
    compactDisplay: hoursSavedFormatterResolved.compactDisplay,
    signDisplay: hoursSavedFormatterResolved.signDisplay,
    useGrouping: hoursSavedFormatterResolved.useGrouping,
    minimumIntegerDigits: hoursSavedFormatterResolved.minimumIntegerDigits,
    minimumFractionDigits: hoursSavedFormatterResolved.minimumFractionDigits,
    maximumFractionDigits: hoursSavedFormatterResolved.maximumFractionDigits,
    minimumSignificantDigits:
      hoursSavedFormatterResolved.minimumSignificantDigits,
    maximumSignificantDigits:
      hoursSavedFormatterResolved.maximumSignificantDigits,
    roundingIncrement: hoursSavedFormatterResolved.roundingIncrement,
    roundingMode: hoursSavedFormatterResolved.roundingMode,
    roundingPriority: hoursSavedFormatterResolved.roundingPriority,
    trailingZeroDisplay: hoursSavedFormatterResolved.trailingZeroDisplay,
  };

  const featureBoxes = [
    { key: "futureProofWorkforce", icon: GraduationCap },
    { key: "revenueStreamAnalysis", icon: BarChart3 },
    { key: "newOpportunities", icon: Sprout },
    { key: "platformEfficiency", icon: Zap },
    { key: "rightTiming", icon: Clock },
    { key: "legalAssurance", icon: Scale },
    { key: "agileExecution", icon: Rocket },
    { key: "multiFieldExpertise", icon: Puzzle },
    { key: "dataDrivenDecisions", icon: LineChart },
  ] as const;

  const featureItems = featureBoxes.map(({ key, icon }) => ({
    icon,
    title: featureSection(`boxes.${key}.title`),
    description: featureSection(`boxes.${key}.description`),
  }));

  const servicesHighlights = [
    { key: "strategy", icon: Lightbulb },
    { key: "automation", icon: Zap },
    { key: "enablement", icon: GraduationCap },
  ] as const;

  const reasonsHighlights = [
    { key: "measured", icon: LineChart },
    { key: "governance", icon: ShieldCheck },
    { key: "embedded", icon: Handshake },
  ] as const;

  return (
    <>
      <TopRightShiningLight />
      <TopLeftShiningLight />
      <div className="relative w-full pt-6 overflow-hidden">
        <div className="container relative mx-auto">
          <Image
            src={mainboard}
            alt={hero("imageAlt")}
            className="absolute inset-x-0 flex  xl:hidden -z-10 scale-[2]"
            priority
          />
        </div>
        <div className="container relative flex flex-col mx-auto space-y-16 md:space-y-32">
          <Section>
            <Hero
              initialHoursSavedAmount={hoursSavedOverview.currentAmount}
              initialHoursSavedFormatted={hoursSavedInitialFormatted}
              initialHoursSavedFormatterLocale={hoursSavedInitialFormatterLocale}
              initialHoursSavedFormatterOptions={hoursSavedInitialFormatterOptions}
              initialHoursSavedNextUpdateAt={
                hoursSavedOverview.nextUpdateAt
                  ? hoursSavedOverview.nextUpdateAt.toISOString()
                  : null
              }
            />
          </Section>
          <Section className="mt-16 md:mt-32">
            <DesktopLogoCloud />
            <MobileLogoCloud />
          </Section>
          <Section className="mt-16 md:mt-24">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <SectionTitle
                  align="left"
                  label={homepage("services.label")}
                  title={homepage("services.title")}
                  text={homepage("services.body")}
                  className="items-start"
                />
                <ul className="space-y-4">
                  {servicesHighlights.map(({ key, icon: Icon }) => (
                    <li
                      key={key}
                      className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-white">
                          {homepage(`services.items.${key}.title`)}
                        </p>
                        <p className="text-sm text-white/70">
                          {homepage(`services.items.${key}.description`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  href={solutionsHref}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {homepage("services.linkLabel")}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="space-y-6">
                <SectionTitle
                  align="left"
                  label={homepage("reasons.label")}
                  title={homepage("reasons.title")}
                  text={homepage("reasons.body")}
                  className="items-start"
                />
                <ul className="space-y-4">
                  {reasonsHighlights.map(({ key, icon: Icon }) => (
                    <li
                      key={key}
                      className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-white">
                          {homepage(`reasons.items.${key}.title`)}
                        </p>
                        <p className="text-sm text-white/70">
                          {homepage(`reasons.items.${key}.description`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
          <Section className="mt-16 md:mt-24">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_28px_120px_rgba(15,23,42,0.45)] md:p-12">
              <SectionTitle
                align="left"
                label={homepage("team.label")}
                title={homepage("team.title")}
                text={homepage("team.body")}
                className="items-start"
              />
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={contactHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <UsersRound className="h-4 w-4" aria-hidden />
                  {homepage("team.linkLabel")}
                </Link>
                <Link href={contactHref} className="group inline-flex">
                  <PrimaryButton
                    shiny
                    IconLeft={Lightbulb}
                    IconRight={ChevronRight}
                    label={homepage("team.cta")}
                  />
                </Link>
              </div>
            </div>
          </Section>
          <Section className="mt-16 md:mt-18">
            <CodeExamples />
          </Section>
          {/* Temporarily hidden: Open-source / GitHub block (including text + button) */}
          {false && (
            <Section className="mt-16 md:mt-18">
              <OpenSource />
            </Section>
          )}

          <Section className="mt-16 md:mt-20">
            <SectionTitle
              className="mt-8 md:mt-16 lg:mt-32"
              title={platform("title")}
              text={platform("text")}
              align="center"
            />
            <AnalyticsBento />
            <div className="mt-6 grid md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_2fr] gap-6 z-50">
              <LatencyBento />
              <UsageBento />
            </div>
          </Section>
          <div className="relative w-full -z-10 ">
            <OssLight className="absolute scale-[2] left-[-70px] sm:left-[70px] md:left-[150px] lg:left-[200px] xl:left-[420px] top-[-250px]" />
          </div>

          <Section className="mt-10 md:mt-20 lg:mt-24">
            <SectionTitle
              title={hero("secondaryTitle")}
              text={hero("secondaryBody")}
              align="center"
            >
              <div className="flex mt-10 mb-10 space-x-6">
                <Link href={meetingHref} className="group">
                  <PrimaryButton
                    shiny
                    IconLeft={LogIn}
                    label={cta("getStarted")}
                    className="h-10"
                  />
                </Link>
                <Link href={solutionsHref}>
                  <SecondaryButton
                    IconLeft={Lightbulb}
                    label={cta("exploreProjects")}
                    IconRight={ChevronRight}
                  />
                </Link>
              </div>
            </SectionTitle>
            {/* Temporarily hidden: One-way hashed Keys section (including heading/paragraph) */}
            {/* Temporarily hidden: Audit Logs section (including heading, description, table headers) */}
            {false && (
              <div className="grid xl:grid-cols-[2fr_3fr] gap-6">
                <HashedKeysBento />
                <AuditLogsBento />
              </div>
            )}

            <div className="relative grid md:grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr] gap-6 z-50">
              {/* TODO: optimize to avoid fetching svg on mobile */}
              <div
                aria-hidden
                className="hidden lg:block pointer-events-none absolute top-[calc(100%-51px)] right-[226px] lg:right-[500px] aspect-[1400/541] w-[1400px]"
              >
                <ImageWithBlur
                  src="/images/landing/leveled-up-api-auth-chip-min.svg"
                  alt="Visual decoration auth chip"
                  fill
                />
              </div>

              <IpWhitelistingBento />
              <RateLimitsBento />
            </div>
          </Section>
          <Section className="mt-16 md:mt-32">
            <div className="relative">
              {/* TODO: horizontal scroll */}
              <SectionTitle
                className="mt-8 md:mt-16 lg:mt-32 xl:mt-48"
                title={featureSection("title")}
                text={featureSection("text")}
              >
                <div className="flex mt-10 mb-10 space-x-6">
                  <Link href={meetingHref} className="group">
                    <PrimaryButton
                      shiny
                      IconLeft={LogIn}
                      label={cta("getStarted")}
                      className="h-10"
                    />
                  </Link>

                  <Link href="/docs">
                    <SecondaryButton
                      IconLeft={Lightbulb}
                      label={cta("exploreProjects")}
                      IconRight={ChevronRight}
                    />
                  </Link>
                </div>
              </SectionTitle>
            </div>
            <FeatureGrid className="relative z-50 mt-20" items={featureItems} />
            <div className="relative -z-10">
              <FeatureGridChip className="absolute top-[50px] left-[400px]" />
            </div>
          </Section>
          <Section className="mt-16 md:mt-32">
            <CTA />
          </Section>
        </div>
      </div>
    </>
  );
}
