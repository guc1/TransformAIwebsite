"use client";

import { Color, EnterpriseCardHighlight } from "@/app/[locale]/(site)/pricing/components";
import { Particles } from "@/components/particles";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Info, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useMemo, useState } from "react";

type TierId = "t1" | "t2" | "t3";
type Availability = "yes" | "no" | "partial";

type PricingTableRow = {
  id: string;
  labelKey: string;
  availability: Record<TierId, Availability>;
  priceRangeKey?: string;
  infoKey: string;
};

type PricingTableCategory = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  rows: PricingTableRow[];
  packageSlug?: string;
};

type PricingTableData = {
  tiers: Array<{ id: TierId; labelKey: string; subtitleKey: string; anchor: string }>;
  categories: PricingTableCategory[];
};

const TABLE_DATA: PricingTableData = {
  tiers: [
    {
      id: "t1",
      labelKey: "tiers.t1.label",
      subtitleKey: "tiers.t1.subtitle",
      anchor: "#pricing-tier-1",
    },
    {
      id: "t2",
      labelKey: "tiers.t2.label",
      subtitleKey: "tiers.t2.subtitle",
      anchor: "#pricing-tier-2",
    },
    {
      id: "t3",
      labelKey: "tiers.t3.label",
      subtitleKey: "tiers.t3.subtitle",
      anchor: "#pricing-tier-3",
    },
  ],
  categories: [
    {
      id: "foundation",
      labelKey: "categories.foundation.label",
      descriptionKey: "categories.foundation.description",
      packageSlug: "foundation",
      rows: [
        {
          id: "currentSituationAssessment",
          labelKey: "rows.currentSituationAssessment.label",
          availability: { t1: "yes", t2: "yes", t3: "partial" },
          priceRangeKey: "rows.currentSituationAssessment.priceRange",
          infoKey: "rows.currentSituationAssessment.info",
        },
        {
          id: "currentSituationFieldSpecific",
          labelKey: "rows.currentSituationFieldSpecific.label",
          availability: { t1: "yes", t2: "yes", t3: "partial" },
          priceRangeKey: "rows.currentSituationFieldSpecific.priceRange",
          infoKey: "rows.currentSituationFieldSpecific.info",
        },
        {
          id: "highRoiIdentification",
          labelKey: "rows.highRoiIdentification.label",
          availability: { t1: "yes", t2: "yes", t3: "partial" },
          priceRangeKey: "rows.highRoiIdentification.priceRange",
          infoKey: "rows.highRoiIdentification.info",
        },
        {
          id: "vision",
          labelKey: "rows.vision.label",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
          priceRangeKey: "rows.vision.priceRange",
          infoKey: "rows.vision.info",
        },
        {
          id: "adaptiveRoadmap",
          labelKey: "rows.adaptiveRoadmap.label",
          availability: { t1: "partial", t2: "yes", t3: "no" },
          priceRangeKey: "rows.adaptiveRoadmap.priceRange",
          infoKey: "rows.adaptiveRoadmap.info",
        },
      ],
    },
    {
      id: "integration",
      labelKey: "categories.integration.label",
      descriptionKey: "categories.integration.description",
      packageSlug: "integrated",
      rows: [
        {
          id: "quickWinsImplementation",
          labelKey: "rows.quickWinsImplementation.label",
          availability: { t1: "yes", t2: "partial", t3: "partial" },
          priceRangeKey: "rows.quickWinsImplementation.priceRange",
          infoKey: "rows.quickWinsImplementation.info",
        },
        {
          id: "foundationalEducation",
          labelKey: "rows.foundationalEducation.label",
          availability: { t1: "yes", t2: "yes", t3: "partial" },
          priceRangeKey: "rows.foundationalEducation.priceRange",
          infoKey: "rows.foundationalEducation.info",
        },
        {
          id: "futureReadySystems",
          labelKey: "rows.futureReadySystems.label",
          availability: { t1: "yes", t2: "yes", t3: "no" },
          priceRangeKey: "rows.futureReadySystems.priceRange",
          infoKey: "rows.futureReadySystems.info",
        },
        {
          id: "workflowCreation",
          labelKey: "rows.workflowCreation.label",
          availability: { t1: "yes", t2: "yes", t3: "partial" },
          priceRangeKey: "rows.workflowCreation.priceRange",
          infoKey: "rows.workflowCreation.info",
        },
        {
          id: "progressAssessment",
          labelKey: "rows.progressAssessment.label",
          availability: { t1: "no", t2: "yes", t3: "no" },
          priceRangeKey: "rows.progressAssessment.priceRange",
          infoKey: "rows.progressAssessment.info",
        },
      ],
    },
    {
      id: "scaling",
      labelKey: "categories.scaling.label",
      descriptionKey: "categories.scaling.description",
      packageSlug: "intrinsic",
      rows: [
        {
          id: "refineCustomSolutions",
          labelKey: "rows.refineCustomSolutions.label",
          availability: { t1: "partial", t2: "yes", t3: "partial" },
          priceRangeKey: "rows.refineCustomSolutions.priceRange",
          infoKey: "rows.refineCustomSolutions.info",
        },
        {
          id: "economicAssessment",
          labelKey: "rows.economicAssessment.label",
          availability: { t1: "no", t2: "yes", t3: "yes" },
          priceRangeKey: "rows.economicAssessment.priceRange",
          infoKey: "rows.economicAssessment.info",
        },
        {
          id: "optimizeIntegration",
          labelKey: "rows.optimizeIntegration.label",
          availability: { t1: "no", t2: "yes", t3: "yes" },
          priceRangeKey: "rows.optimizeIntegration.priceRange",
          infoKey: "rows.optimizeIntegration.info",
        },
        {
          id: "workflowOptimization",
          labelKey: "rows.workflowOptimization.label",
          availability: { t1: "no", t2: "yes", t3: "yes" },
          priceRangeKey: "rows.workflowOptimization.priceRange",
          infoKey: "rows.workflowOptimization.info",
        },
        {
          id: "largeScaleDeployment",
          labelKey: "rows.largeScaleDeployment.label",
          availability: { t1: "no", t2: "yes", t3: "partial" },
          priceRangeKey: "rows.largeScaleDeployment.priceRange",
          infoKey: "rows.largeScaleDeployment.info",
        },
        {
          id: "aiAssessmentReport",
          labelKey: "rows.aiAssessmentReport.label",
          availability: { t1: "no", t2: "yes", t3: "no" },
          priceRangeKey: "rows.aiAssessmentReport.priceRange",
          infoKey: "rows.aiAssessmentReport.info",
        },
      ],
    },
    {
      id: "cuttingEdge",
      labelKey: "categories.cuttingEdge.label",
      descriptionKey: "categories.cuttingEdge.description",
      rows: [
        {
          id: "automatingOptimisedSystems",
          labelKey: "rows.automatingOptimisedSystems.label",
          availability: { t1: "no", t2: "partial", t3: "yes" },
          priceRangeKey: "rows.automatingOptimisedSystems.priceRange",
          infoKey: "rows.automatingOptimisedSystems.info",
        },
        {
          id: "cuttingEdgeSolutions",
          labelKey: "rows.cuttingEdgeSolutions.label",
          availability: { t1: "no", t2: "no", t3: "yes" },
          priceRangeKey: "rows.cuttingEdgeSolutions.priceRange",
          infoKey: "rows.cuttingEdgeSolutions.info",
        },
        {
          id: "customSolutions",
          labelKey: "rows.customSolutions.label",
          availability: { t1: "partial", t2: "partial", t3: "partial" },
          priceRangeKey: "rows.customSolutions.priceRange",
          infoKey: "rows.customSolutions.info",
        },
      ],
    },
  ],
};

const AVAILABILITY_META: Record<Availability, { icon?: LucideIcon; className: string }> = {
  yes: {
    icon: Check,
    className: "border-emerald-400/70 bg-emerald-400/20 text-emerald-100",
  },
  partial: {
    className: "border-amber-400/70 bg-amber-500/20 text-amber-100",
  },
  no: {
    icon: X,
    className: "border-white/25 bg-white/5 text-white/60",
  },
};

type AvailabilityIndicatorProps = {
  value: Availability;
  label: string;
  priceRange?: string;
  size?: "md" | "sm";
};

const sizeMap = {
  md: "h-10 w-10 text-base",
  sm: "h-8 w-8 text-sm",
} satisfies Record<NonNullable<AvailabilityIndicatorProps["size"]>, string>;

const TIER_SEGMENT_STYLES: Record<TierId, string> = {
  t1: "bg-gradient-to-r from-white/80 via-white/45 to-white/10 shadow-[0_0_28px_rgba(255,255,255,0.28)]",
  t2: "bg-gradient-to-r from-[#FFD600]/80 via-[#FFD600]/45 to-transparent shadow-[0_0_28px_rgba(255,214,0,0.32)]",
  t3: "bg-gradient-to-r from-[#9D72FF]/80 via-[#9D72FF]/45 to-transparent shadow-[0_0_32px_rgba(157,114,255,0.32)]",
};

type InformationSummaryProps = {
  availability: PricingTableRow["availability"];
  infoKey: string;
  className?: string;
  variant?: "table" | "card";
};

function InformationSummary({ availability, infoKey, className, variant = "table" }: InformationSummaryProps) {
  const t = useTranslations("Pricing.Table");
  const locale = useLocale();

  const contactHref = `/${locale}/contact`;

  const listFormatter = useMemo(
    () =>
      new Intl.ListFormat(locale, {
        style: "short",
        type: "conjunction",
      }),
    [locale],
  );

  const includedTiers = TABLE_DATA.tiers.filter((tier) => availability[tier.id] === "yes");
  const partialTiers = TABLE_DATA.tiers.filter((tier) => availability[tier.id] === "partial");

  const includedLabels = includedTiers.map((tier) => t(tier.labelKey));
  const partialLabels = partialTiers.map((tier) => t(tier.labelKey));

  const infoLines: string[] = [];

  if (includedLabels.length > 0) {
    infoLines.push(
      t("infoColumn.availableIn", {
        packages: listFormatter.format(includedLabels),
      }),
    );
  }

  if (partialLabels.length > 0) {
    infoLines.push(
      t("infoColumn.partialIn", {
        packages: listFormatter.format(partialLabels),
      }),
    );
  }

  if (infoLines.length === 0) {
    infoLines.push(t("infoColumn.notIncluded"));
  }

  const includedCount = includedLabels.length;
  const hasPartial = partialLabels.length > 0;
  const countDisplay = `${includedCount}${hasPartial ? "+" : ""}/${TABLE_DATA.tiers.length}`;
  const srLabel = infoLines.join(" ");

  const triggerClasses = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.05] text-white/80 shadow-[0_16px_60px_rgba(79,70,229,0.4)] transition hover:border-white/35 hover:text-white hover:shadow-[0_22px_80px_rgba(99,102,241,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
    variant === "card" ? "h-10 w-10" : "h-11 w-11",
    className,
  );

  const tooltipSide = variant === "card" ? "bottom" : "right";
  const tooltipSideOffset = variant === "card" ? 14 : 20;
  const tooltipAlignOffset = variant === "card" ? 0 : -12;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={triggerClasses} aria-label={srLabel}>
          <span
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(157,114,255,0.22),_transparent_72%)] opacity-60"
          />
          <Info className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:scale-110" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={tooltipSide}
        align="end"
        alignOffset={tooltipAlignOffset}
        sideOffset={tooltipSideOffset}
        collisionPadding={{ left: 24, right: 24, top: 24, bottom: 24 }}
        className="relative w-[min(90vw,420px)] overflow-hidden rounded-3xl border border-white/12 bg-neutral-950/95 p-6 text-left text-sm text-white/80 shadow-[0_32px_180px_rgba(8,12,24,0.78)] backdrop-blur-xl"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.32),_transparent_70%)] blur-2xl" />
          <div className="absolute -bottom-24 right-0 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(147,51,234,0.3),_transparent_72%)] blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-80" />
        </div>
        <div
          className={cn(
            "relative grid gap-5",
            variant === "table"
              ? "min-[420px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
              : ""
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="leading-relaxed text-white/85">{t(infoKey)}</p>
            </div>
            <Link
              href={contactHref}
              className="relative inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/[0.08] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 min-[420px]:w-auto min-[420px]:self-start"
            >
              {t("infoColumn.tooltip.cta")}
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-4 shadow-[0_24px_100px_rgba(8,12,24,0.55)]">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_20%,rgba(59,130,246,0.16),transparent_75%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_80%,rgba(157,114,255,0.2),transparent_75%)]" />
              <div className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-80" />
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-2">
                {TABLE_DATA.tiers.map((tier) => {
                  const value = availability[tier.id];
                  return (
                    <span
                      key={`${tier.id}-coverage`}
                      aria-hidden="true"
                      className={cn(
                        "h-2.5 w-9 rounded-full transition-all duration-500 ease-out",
                        value === "yes" ? TIER_SEGMENT_STYLES[tier.id] : "bg-white/10",
                        value === "partial" && "opacity-70 ring-2 ring-amber-200/60 ring-offset-[2px] ring-offset-black/60",
                        value === "no" && "opacity-40",
                      )}
                    />
                  );
                })}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/55">
                  {t("infoColumn.label")}
                </span>
                <span className="text-sm font-semibold text-white">{countDisplay}</span>
                {hasPartial ? (
                  <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-200/80">
                    {t("legend.partial")}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="relative mt-3 space-y-1 text-xs leading-relaxed text-white/75">
              {infoLines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function AvailabilityIndicator({ value, label, priceRange, size = "md" }: AvailabilityIndicatorProps) {
  const meta = AVAILABILITY_META[value];
  const Icon = meta.icon;

  const indicatorClasses = cn(
    "inline-flex items-center justify-center rounded-full border bg-opacity-20 font-semibold transition-colors",
    sizeMap[size],
    meta.className,
  );

  const iconElement =
    value === "partial" ? (
      <span className={cn("text-base", size === "sm" && "text-sm")}>½</span>
    ) : Icon ? (
      <Icon className={cn(size === "md" ? "h-4 w-4" : "h-3.5 w-3.5")} />
    ) : null;

  const description = [label, priceRange].filter(Boolean).join(". ");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            indicatorClasses,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
          )}
          aria-label={description}
        >
          {iconElement}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs space-y-1 text-left text-white">
        <p className="text-sm font-semibold text-white">{label}</p>
        {priceRange ? <p className="text-xs leading-relaxed text-white/70">{priceRange}</p> : null}
      </TooltipContent>
    </Tooltip>
  );
}

export function PricingCompareTable() {
  const t = useTranslations("Pricing.Table");
  const locale = useLocale();
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  const availabilityLabels: Record<Availability, string> = {
    yes: t("legend.included"),
    no: t("legend.notIncluded"),
    partial: t("legend.partial"),
  };

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={200}>
      <section
        aria-labelledby="pricing-compare-heading"
        className="relative mx-auto w-full max-w-5xl"
      >
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/12 bg-neutral-950/80 px-6 py-12 shadow-[0_36px_160px_rgba(8,12,24,0.72)] ring-1 ring-white/5 backdrop-blur-2xl sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(56,189,248,0.16),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_90%_120%,rgba(157,114,255,0.24),transparent_75%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(100%_90%_at_0%_40%,rgba(76,29,149,0.18),transparent_70%)]" />
            <div className="absolute -top-44 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_68%)] blur-3xl" />
            <div className="absolute -bottom-48 right-12 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(157,114,255,0.4),_transparent_72%)] blur-[140px]" />
            <div className="absolute -left-28 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.36),_transparent_70%)] blur-[120px]" />
            <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />
          </div>
          <EnterpriseCardHighlight className="absolute -top-40 -right-32 w-[520px] opacity-60 mix-blend-screen" />
          <Particles
            className="pointer-events-none absolute inset-0 opacity-55 transition-opacity duration-700 motion-reduce:hidden"
            quantity={70}
            color={Color.Purple}
            vx={0.06}
            vy={-0.04}
          />
          <div className="relative z-10 flex flex-col gap-12">
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="pricing-compare-heading"
                className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-[2.25rem] sm:leading-tight"
              >
                {t("title")}
              </h2>
              <p className="mt-4 text-sm text-white/70 sm:text-base">{t("description")}</p>
            </div>

            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">{t("title")}</caption>
                <thead>
                  <tr className="text-sm text-white/80">
                    <th scope="col" className="px-6 pb-4 text-left font-medium text-white/70">
                      {t("headers.solution")}
                    </th>
                    {TABLE_DATA.tiers.map((tier) => (
                      <th key={tier.id} scope="col" className="px-6 pb-4 text-center font-semibold text-white">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-base sm:text-lg">{t(tier.labelKey)}</span>
                          <span className="text-xs font-medium text-white/60">{t(tier.subtitleKey)}</span>
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="px-6 pb-4 text-right font-semibold text-white">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={t("headers.info")}
                            className="group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.05] text-white/80 shadow-[0_16px_60px_rgba(79,70,229,0.4)] transition hover:border-white/35 hover:text-white hover:shadow-[0_22px_80px_rgba(99,102,241,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                          >
                            <span className="sr-only">{t("headers.info")}</span>
                            <span
                              aria-hidden
                              className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            />
                            <span
                              aria-hidden
                              className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(157,114,255,0.2),_transparent_70%)] opacity-60"
                            />
                            <Info className="relative z-10 h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="end"
                          alignOffset={-16}
                          sideOffset={16}
                          collisionPadding={{ left: 24, right: 24 }}
                          className="w-[min(90vw,360px)] overflow-hidden rounded-3xl border border-white/12 bg-neutral-950/95 p-6 text-left text-sm text-white/80 shadow-[0_32px_180px_rgba(8,12,24,0.75)] backdrop-blur-xl"
                        >
                          <div className="relative space-y-4">
                            <div aria-hidden className="pointer-events-none absolute inset-0">
                              <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.32),_transparent_70%)] blur-2xl" />
                              <div className="absolute -bottom-24 right-0 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(147,51,234,0.32),_transparent_72%)] blur-2xl" />
                              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-80" />
                            </div>
                            <p className="relative z-10 text-sm font-semibold text-white">{t("infoColumn.tooltip.title")}</p>
                            <p className="relative z-10 leading-relaxed text-white/70">{t("infoColumn.tooltip.description")}</p>
                            <Link
                              href="#"
                              className="relative z-10 inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/[0.08] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 min-[360px]:w-auto min-[360px]:self-start"
                            >
                              {t("infoColumn.tooltip.cta")}
                            </Link>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  </tr>
                </thead>
                {TABLE_DATA.categories.map((category) => {
                  const packageHref = category.packageSlug
                    ? `/${locale}/packages/${category.packageSlug}`
                    : null;
                  const isHighlighted = hoveredCategoryId === category.id;

                  const packageLabel = t(category.labelKey);

                  return (
                    <Fragment key={category.id}>
                      <tbody>
                        <tr>
                          <th
                            scope="colgroup"
                            colSpan={TABLE_DATA.tiers.length + 2}
                            className="px-6 pt-8 pb-3 text-left"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                                  {packageLabel}
                                </span>
                                <p className="text-xs font-medium text-white/55">
                                  {t(category.descriptionKey)}
                                </p>
                              </div>
                              {packageHref ? (
                                <Link
                                  href={packageHref}
                                  className="inline-flex items-center justify-center rounded-full border border-[#9D72FF]/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-[#CDBDFF] transition hover:border-[#C6B4FF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B39CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                                  aria-label={t("cta.viewPackageDealFor", { package: packageLabel })}
                                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                                  onMouseLeave={() => setHoveredCategoryId(null)}
                                  onFocus={() => setHoveredCategoryId(category.id)}
                                  onBlur={() => setHoveredCategoryId(null)}
                                >
                                  {t("cta.viewPackageDeal")}
                                </Link>
                              ) : null}
                            </div>
                          </th>
                        </tr>
                      </tbody>
                      <tbody
                        className={cn(
                          isHighlighted &&
                            "relative before:pointer-events-none before:absolute before:inset-x-2 before:top-1 before:bottom-1 before:rounded-[28px] before:border before:border-[#9D72FF]/60 before:shadow-[0_0_32px_rgba(157,114,255,0.45)] before:content-['']",
                        )}
                      >
                        {category.rows.map((row) => (
                          <tr
                            key={row.id}
                            className={cn(
                              "border-t border-white/10 text-sm transition-colors hover:bg-white/[0.05]",
                              isHighlighted &&
                                "relative z-10 bg-white/[0.04] hover:bg-white/[0.08] first:rounded-t-[24px] last:rounded-b-[24px]",
                            )}
                          >
                            <th scope="row" className="px-6 py-5 text-left font-medium text-white/90">
                              {t(row.labelKey)}
                            </th>
                            {TABLE_DATA.tiers.map((tier) => {
                              const availabilityValue = row.availability[tier.id];
                              return (
                                <td key={tier.id} className="px-6 py-5 text-center align-top">
                                  <AvailabilityIndicator
                                    value={availabilityValue}
                                    label={availabilityLabels[availabilityValue]}
                                    priceRange={
                                      row.priceRangeKey && availabilityValue !== "no"
                                        ? t(row.priceRangeKey)
                                        : undefined
                                    }
                                  />
                                </td>
                              );
                            })}
                            <td className="px-6 py-5 align-top">
                              <InformationSummary
                                availability={row.availability}
                                infoKey={row.infoKey}
                                className="mx-auto"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Fragment>
                  );
                })}
              </table>
            </div>

            <div className="md:hidden">
              <Accordion type="multiple" defaultValue={TABLE_DATA.categories.map((category) => category.id)}>
                {TABLE_DATA.categories.map((category) => {
                  const packageHref = category.packageSlug
                    ? `/${locale}/packages/${category.packageSlug}`
                    : null;
                  const isHighlighted = hoveredCategoryId === category.id;

                  const packageLabel = t(category.labelKey);

                  return (
                    <AccordionItem
                      key={category.id}
                      value={category.id}
                      className="relative border-b border-white/10"
                      onMouseLeave={() => setHoveredCategoryId(null)}
                    >
                      {packageHref ? (
                        <Link
                          href={packageHref}
                          className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full border border-[#9D72FF]/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#CDBDFF] transition hover:border-[#C6B4FF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B39CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                          aria-label={t("cta.viewPackageDealFor", { package: packageLabel })}
                          onMouseEnter={() => setHoveredCategoryId(category.id)}
                          onMouseLeave={() => setHoveredCategoryId(null)}
                          onFocus={() => setHoveredCategoryId(category.id)}
                          onBlur={() => setHoveredCategoryId(null)}
                        >
                          {t("cta.viewPackageDeal")}
                        </Link>
                      ) : null}
                      <AccordionTrigger className="pr-28 text-left">
                        <span className="block text-base font-semibold text-white">{packageLabel}</span>
                        <span className="mt-1 block text-sm text-white/60">{t(category.descriptionKey)}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-1">
                        <div
                          className={cn(
                            "relative space-y-4",
                            isHighlighted &&
                              "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:bottom-0 before:rounded-[26px] before:border before:border-[#9D72FF]/60 before:shadow-[0_0_32px_rgba(157,114,255,0.45)] before:content-['']",
                          )}
                          >
                          {category.rows.map((row) => (
                            <div
                              key={row.id}
                              className={cn(
                                "relative overflow-hidden rounded-3xl border border-white/12 bg-neutral-950/75 p-5 shadow-[0_24px_110px_rgba(8,12,24,0.6)] backdrop-blur-xl",
                                isHighlighted && "relative z-10",
                              )}
                            >
                              <div aria-hidden className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_20%,rgba(59,130,246,0.18),transparent_75%)]" />
                              <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_80%,rgba(157,114,255,0.22),transparent_75%)]" />
                              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-75" />
                            </div>
                            <div className="relative z-10 flex items-start justify-between gap-3">
                              <p className="flex-1 text-sm font-medium leading-snug text-white">{t(row.labelKey)}</p>
                              <InformationSummary
                                availability={row.availability}
                                infoKey={row.infoKey}
                                variant="card"
                                className="shrink-0"
                              />
                            </div>
                            <div className="relative z-10 mt-4 grid grid-cols-3 gap-3">
                              {TABLE_DATA.tiers.map((tier) => {
                                const availabilityValue = row.availability[tier.id];
                                return (
                                  <div key={tier.id} className="flex flex-col items-center gap-2 text-center">
                                    <span className="text-xs font-medium text-white/80">{t(tier.labelKey)}</span>
                                    <AvailabilityIndicator
                                      value={availabilityValue}
                                      label={availabilityLabels[availabilityValue]}
                                      priceRange={
                                        row.priceRangeKey && availabilityValue !== "no"
                                          ? t(row.priceRangeKey)
                                          : undefined
                                      }
                                      size="sm"
                                    />
                                    <span className="text-[11px] text-white/60">{t(tier.subtitleKey)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <p className="text-sm text-white/60">{t("cta.scrollLabel")}</p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {TABLE_DATA.tiers.map((tier) => (
                  <Link
                    key={tier.id}
                    href={tier.anchor}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                  >
                    {t(`cta.chooseTier${tier.id.slice(1)}`)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
