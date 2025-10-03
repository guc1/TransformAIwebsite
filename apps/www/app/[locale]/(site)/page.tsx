import { AnalyticsBento } from "@/components/analytics/analytics-bento";
import { AuditLogsBento } from "@/components/audit-logs-bento";
import { PrimaryButton, SecondaryButton } from "@/components/button";
import { CTA } from "@/components/cta";
import { FeatureGrid } from "@/components/feature/feature-grid";
import { HashedKeysBento } from "@/components/hashed-keys-bento";
import { Hero } from "@/components/hero/hero";
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
import {
  BarChart3,
  ChevronRight,
  Clock,
  GraduationCap,
  Lightbulb,
  LineChart,
  LogIn,
  Puzzle,
  Rocket,
  Scale,
  Sprout,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  return {
    title: t("title"),
    description: t("description"),
    keywords: ["Unkey", "API", "API development", "API security", "API development platform"],
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      url: "https://unkey.com/",
      siteName: t("openGraph.siteName"),
      images: [
        {
          url: "https://unkey.com/og.png",
          width: 1200,
          height: 675,
        },
      ],
    },
    twitter: {
      title: t("twitter.title"),
      card: "summary_large_image",
    },
    icons: {
      shortcut: "/images/logos/transformai/logosvg.svg",
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

  const meetingHref = `/${locale}/meeting` as const;
  const solutionsHref = `/${locale}/pricing` as const;

  const [cta, platform, hero, featureSection] = await Promise.all([
    getTranslations({ locale, namespace: "CTA" }),
    getTranslations({ locale, namespace: "Platform" }),
    getTranslations({ locale, namespace: "Hero" }),
    getTranslations({ locale, namespace: "FeatureSection" }),
  ]);

  const hoursSavedOverview = await getHoursSavedOverview();

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

  return (
    <>
      <TopRightShiningLight />
      <TopLeftShiningLight />
      <div className="relative w-full pt-6 overflow-hidden">
        <div className="container relative mx-auto">
          <Image
            src={mainboard}
            alt="Animated SVG showing computer circuits lighting up"
            className="absolute inset-x-0 flex  xl:hidden -z-10 scale-[2]"
            priority
          />
        </div>
        <div className="container relative flex flex-col mx-auto space-y-16 md:space-y-32">
          <Section>
            <Hero
              initialHoursSavedAmount={hoursSavedOverview.currentAmount}
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
