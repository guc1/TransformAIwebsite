"use client";

import { Color, EnterpriseCardHighlight } from "@/app/[locale]/(site)/pricing/components";
import { Particles } from "@/components/particles";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Info, Minus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type TierId = "t1" | "t2" | "t3";
type Availability = "yes" | "no" | "partial";

type PricingTableRow = {
  id: string;
  labelKey: string;
  availability: Record<TierId, Availability>;
  noteKey?: string;
};

type PricingTableCategory = {
  id: string;
  labelKey: string;
  rows: PricingTableRow[];
};

type PricingTableData = {
  tiers: Array<{ id: TierId; labelKey: string; priceKey: string; anchor: string; priceRangeKey: string }>;
  categories: PricingTableCategory[];
};

const TABLE_DATA: PricingTableData = {
  tiers: [
    {
      id: "t1",
      labelKey: "tiers.t1",
      priceKey: "tiers.price.t1",
      anchor: "#pricing-tier-1",
      priceRangeKey: "priceRanges.t1",
    },
    {
      id: "t2",
      labelKey: "tiers.t2",
      priceKey: "tiers.price.t2",
      anchor: "#pricing-tier-2",
      priceRangeKey: "priceRanges.t2",
    },
    {
      id: "t3",
      labelKey: "tiers.t3",
      priceKey: "tiers.price.t3",
      anchor: "#pricing-tier-3",
      priceRangeKey: "priceRanges.t3",
    },
  ],
  categories: [
    {
      id: "educationEnablement",
      labelKey: "categories.educationEnablement",
      rows: [
        {
          id: "educationCourseV1",
          labelKey: "rows.educationCourseV1",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "educationCourseV2",
          labelKey: "rows.educationCourseV2",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "workshops",
          labelKey: "rows.workshops",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "trainingMaterials",
          labelKey: "rows.trainingMaterials",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "certification",
          labelKey: "rows.certification",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
      ],
    },
    {
      id: "implementation",
      labelKey: "categories.implementation",
      rows: [
        {
          id: "aiReadiness",
          labelKey: "rows.aiReadiness",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "automationSetup",
          labelKey: "rows.automationSetup",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "pilotIntegration",
          labelKey: "rows.pilotIntegration",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "assessment",
          labelKey: "rows.assessment",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "guidance",
          labelKey: "rows.guidance",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
      ],
    },
    {
      id: "enterprise",
      labelKey: "categories.enterprise",
      rows: [
        {
          id: "tailoredIntegrations",
          labelKey: "rows.tailoredIntegrations",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "researchSupport",
          labelKey: "rows.researchSupport",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "customModel",
          labelKey: "rows.customModel",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "consulting",
          labelKey: "rows.consulting",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "continuousSupport",
          labelKey: "rows.continuousSupport",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
      ],
    },
  ],
};

const AVAILABILITY_META: Record<Availability, { icon: LucideIcon; className: string }> = {
  yes: {
    icon: Check,
    className: "border-emerald-400/50 bg-emerald-400/20 text-emerald-200",
  },
  partial: {
    icon: Minus,
    className: "border-amber-300/40 bg-amber-400/20 text-amber-100",
  },
  no: {
    icon: X,
    className: "border-white/20 bg-white/5 text-white/60",
  },
};

type AvailabilityIndicatorProps = {
  value: Availability;
  label: string;
  note?: string;
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
  className?: string;
  variant?: "table" | "card";
};

function InformationSummary({ availability, className, variant = "table" }: InformationSummaryProps) {
  const t = useTranslations("Pricing.Table");
  const locale = useLocale();

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

  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] px-4 py-4 text-left shadow-[0_28px_120px_rgba(15,23,42,0.45)] transition duration-500 hover:border-white/20 hover:shadow-[0_40px_160px_rgba(15,23,42,0.65)]",
        variant === "table" ? "max-w-[260px]" : "w-full",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(2,222,252,0.35),_transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-24 right-0 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(157,114,255,0.38),_transparent_72%)] blur-3xl" />
        <div className="absolute -left-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.28),_transparent_68%)] blur-2xl" />
      </div>
      <div className="relative z-10 flex items-center justify-between gap-4">
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
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/50">
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
      <div className="relative z-10 text-xs leading-relaxed text-white/70">
        {infoLines.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
      <span className="sr-only">{infoLines.join(" ")}</span>
    </div>
  );
}

function AvailabilityIndicator({ value, label, note, priceRange, size = "md" }: AvailabilityIndicatorProps) {
  const meta = AVAILABILITY_META[value];
  const Icon = meta.icon;

  const indicatorClasses = cn(
    "inline-flex items-center justify-center rounded-full border bg-opacity-20 font-medium transition-colors",
    sizeMap[size],
    meta.className,
  );

  const iconElement = <Icon className={cn(size === "md" ? "h-4 w-4" : "h-3.5 w-3.5")} />;

  const shouldShowPriceTooltip = value === "yes" && Boolean(priceRange);

  return (
    <div className="flex items-center justify-center gap-2">
      {shouldShowPriceTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                indicatorClasses,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
              )}
              aria-label={`${label}. ${priceRange}`}
            >
              {iconElement}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-left text-white">
            <p>{priceRange}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span aria-hidden className={indicatorClasses}>
          {iconElement}
        </span>
      )}
      {shouldShowPriceTooltip ? null : <span className="sr-only">{label}</span>}
      {value === "partial" && note ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-white/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 hover:text-white"
              aria-label={note}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-left text-white">
            <p>{note}</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function PricingCompareTable() {
  const t = useTranslations("Pricing.Table");

  const availabilityLabels: Record<Availability, string> = {
    yes: t("legend.included"),
    no: t("legend.notIncluded"),
    partial: t("legend.partial"),
  };

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={200}>
      <section
        aria-labelledby="pricing-compare-heading"
        className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.04] px-6 py-12 shadow-[0_32px_160px_rgba(15,23,42,0.55)] backdrop-blur-lg sm:px-10 sm:py-14">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(2,222,252,0.32),_transparent_70%)] blur-3xl" />
            <div className="absolute -bottom-40 right-12 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(157,114,255,0.35),_transparent_70%)] blur-3xl" />
            <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.25),_transparent_68%)] blur-3xl" />
          </div>
          <EnterpriseCardHighlight className="absolute -top-40 -right-32 w-[520px] opacity-60 mix-blend-screen" />
          <Particles
            className="pointer-events-none absolute inset-0 opacity-45 transition-opacity duration-700 motion-reduce:hidden"
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
            </div>

            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">{t("title")}</caption>
                <thead>
                  <tr className="text-sm text-white/80">
                    <th scope="col" className="px-6 pb-4 text-left font-medium text-white/70">
                      {t("headers.feature")}
                    </th>
                    {TABLE_DATA.tiers.map((tier) => (
                      <th key={tier.id} scope="col" className="px-6 pb-4 text-center font-semibold text-white">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-base sm:text-lg">{t(tier.labelKey)}</span>
                          <span className="text-xs font-medium text-white/60">{t(tier.priceKey)}</span>
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="px-6 pb-4 text-right font-semibold text-white">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                          >
                            <span>{t("headers.info")}</span>
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          sideOffset={12}
                          className="w-[260px] rounded-2xl border border-white/12 bg-neutral-950/90 p-5 text-left text-sm text-white/80 shadow-[0_24px_120px_rgba(10,16,35,0.6)] backdrop-blur-xl"
                        >
                          <div className="space-y-3">
                            <p>{t("infoColumn.tooltip.line1")}</p>
                            <p>{t("infoColumn.tooltip.line2")}</p>
                            <Link
                              href="#"
                              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                            >
                              {t("infoColumn.tooltip.cta")}
                            </Link>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  </tr>
                </thead>
                {TABLE_DATA.categories.map((category) => (
                  <tbody key={category.id}>
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={TABLE_DATA.tiers.length + 2}
                        className="px-6 pt-8 pb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60"
                      >
                        {t(category.labelKey)}
                      </th>
                    </tr>
                    {category.rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-white/10 text-sm transition-colors hover:bg-white/[0.03]"
                      >
                        <th scope="row" className="px-6 py-5 text-left font-medium text-white/90">
                          {t(row.labelKey)}
                        </th>
                        {TABLE_DATA.tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-5 text-center align-top">
                            <AvailabilityIndicator
                              value={row.availability[tier.id]}
                              label={availabilityLabels[row.availability[tier.id]]}
                              note={row.noteKey ? t(row.noteKey) : undefined}
                              priceRange={
                                row.availability[tier.id] === "yes"
                                  ? t(tier.priceRangeKey)
                                  : undefined
                              }
                            />
                          </td>
                        ))}
                        <td className="px-6 py-5 align-top">
                          <InformationSummary availability={row.availability} className="mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>

            <div className="md:hidden">
              <Accordion type="multiple" defaultValue={TABLE_DATA.categories.map((category) => category.id)}>
                {TABLE_DATA.categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id} className="border-b border-white/10">
                    <AccordionTrigger className="text-left text-base font-semibold text-white">
                      {t(category.labelKey)}
                    </AccordionTrigger>
                    <AccordionContent className="px-1">
                      <div className="space-y-4">
                        {category.rows.map((row) => (
                          <div
                            key={row.id}
                            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm shadow-[0_18px_80px_rgba(12,18,32,0.55)]"
                          >
                            <p className="text-sm font-medium text-white">{t(row.labelKey)}</p>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                              {TABLE_DATA.tiers.map((tier) => (
                                <div key={tier.id} className="flex flex-col items-center gap-2 text-center">
                                  <span className="text-xs font-medium text-white/80">{t(tier.labelKey)}</span>
                                  <AvailabilityIndicator
                                    value={row.availability[tier.id]}
                                    label={availabilityLabels[row.availability[tier.id]]}
                                    note={row.noteKey ? t(row.noteKey) : undefined}
                                    priceRange={
                                      row.availability[tier.id] === "yes"
                                        ? t(tier.priceRangeKey)
                                        : undefined
                                    }
                                    size="sm"
                                  />
                                  <span className="text-[11px] text-white/60">{t(tier.priceKey)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4">
                              <InformationSummary availability={row.availability} variant="card" />
                            </div>
                            {row.noteKey ? (
                              <p className="mt-3 text-xs text-white/60 md:hidden">{t(row.noteKey)}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
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
