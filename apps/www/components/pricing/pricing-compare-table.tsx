"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Info, Minus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type TierId = "t1" | "t2" | "t3";
type Availability = "yes" | "no" | "partial";

type PricingTableRow = {
  id: string;
  labelKey: string;
  availability: Record<TierId, Availability>;
  infoKey: string;
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

type PricingCompareTableProps = {
  className?: string;
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
          infoKey: "info.items.educationCourseV1",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "educationCourseV2",
          labelKey: "rows.educationCourseV2",
          infoKey: "info.items.educationCourseV2",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "workshops",
          labelKey: "rows.workshops",
          infoKey: "info.items.workshops",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "trainingMaterials",
          labelKey: "rows.trainingMaterials",
          infoKey: "info.items.trainingMaterials",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "certification",
          labelKey: "rows.certification",
          infoKey: "info.items.certification",
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
          infoKey: "info.items.aiReadiness",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "automationSetup",
          labelKey: "rows.automationSetup",
          infoKey: "info.items.automationSetup",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "pilotIntegration",
          labelKey: "rows.pilotIntegration",
          infoKey: "info.items.pilotIntegration",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "assessment",
          labelKey: "rows.assessment",
          infoKey: "info.items.assessment",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "guidance",
          labelKey: "rows.guidance",
          infoKey: "info.items.guidance",
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
          infoKey: "info.items.tailoredIntegrations",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "researchSupport",
          labelKey: "rows.researchSupport",
          infoKey: "info.items.researchSupport",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "customModel",
          labelKey: "rows.customModel",
          infoKey: "info.items.customModel",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "consulting",
          labelKey: "rows.consulting",
          infoKey: "info.items.consulting",
          availability: { t1: "no", t2: "no", t3: "yes" },
        },
        {
          id: "continuousSupport",
          labelKey: "rows.continuousSupport",
          infoKey: "info.items.continuousSupport",
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

const infoTriggerSizeMap = {
  md: "h-9 w-9 text-sm",
  sm: "h-8 w-8 text-xs",
} satisfies Record<"md" | "sm", string>;

const infoLetterSizeMap = {
  md: "text-base",
  sm: "text-sm",
} satisfies Record<"md" | "sm", string>;

type RowInfoProps = {
  info: string;
  readMoreLabel: string;
  ariaLabel: string;
  size?: "md" | "sm";
};

function RowInfo({ info, readMoreLabel, ariaLabel, size = "md" }: RowInfoProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
            infoTriggerSizeMap[size],
          )}
          aria-label={ariaLabel}
        >
          <span aria-hidden className={cn("font-semibold", infoLetterSizeMap[size])}>i</span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={12}
        className="max-w-xs space-y-3 border-white/10 bg-neutral-950/90 px-4 py-4 text-left text-white shadow-[0_30px_90px_rgba(15,23,42,0.45)] backdrop-blur-md"
      >
        <p className="text-sm leading-relaxed text-white/80">{info}</p>
        <Link
          href="#"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
        >
          {readMoreLabel}
        </Link>
      </TooltipContent>
    </Tooltip>
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

export function PricingCompareTable({ className }: PricingCompareTableProps) {
  const t = useTranslations("Pricing.Table");

  const availabilityLabels: Record<Availability, string> = {
    yes: t("legend.included"),
    no: t("legend.notIncluded"),
    partial: t("legend.partial"),
  };

  const infoReadMoreLabel = t("info.readMore");
  const getInfoAriaLabel = (feature: string) => t("info.ariaLabel", { feature });

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={200}>
      <section
        aria-labelledby="pricing-compare-heading"
        className={cn("relative w-full max-w-4xl mx-auto", className)}
      >
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2 text-left">
            <h2
              id="pricing-compare-heading"
              className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60"
            >
              {t("title")}
            </h2>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_24px_90px_rgba(15,23,42,0.35)] backdrop-blur-sm md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{t("title")}</caption>
              <thead>
                <tr className="text-sm text-white/80">
                  <th scope="col" className="px-6 py-4 text-left font-medium text-white/70">
                    {t("headers.feature")}
                  </th>
                  <th scope="col" className="px-4 py-4 text-left font-medium text-white/70">
                    {t("headers.info")}
                  </th>
                  {TABLE_DATA.tiers.map((tier) => (
                    <th key={tier.id} scope="col" className="px-6 py-4 text-center font-semibold text-white">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base sm:text-lg">{t(tier.labelKey)}</span>
                        <span className="text-sm font-normal text-muted-foreground">{t(tier.priceKey)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              {TABLE_DATA.categories.map((category) => (
                <tbody key={category.id}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={TABLE_DATA.tiers.length + 2}
                      className="px-6 pt-8 pb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/50"
                    >
                      {t(category.labelKey)}
                    </th>
                  </tr>
                  {category.rows.map((row) => {
                    const featureLabel = t(row.labelKey);
                    const infoText = t(row.infoKey);
                    const infoAriaLabel = getInfoAriaLabel(featureLabel);

                    return (
                      <tr key={row.id} className="border-t border-white/10 text-sm">
                        <th scope="row" className="px-6 py-5 text-left font-medium text-white/90">
                          {featureLabel}
                        </th>
                        <td className="px-4 py-5 text-left align-top">
                          <RowInfo
                            info={infoText}
                            readMoreLabel={infoReadMoreLabel}
                            ariaLabel={infoAriaLabel}
                          />
                        </td>
                        {TABLE_DATA.tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-5 text-center">
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
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>

          <div className="md:hidden">
            <Accordion
              type="multiple"
              defaultValue={TABLE_DATA.categories.map((category) => category.id)}
            >
              {TABLE_DATA.categories.map((category) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border-b border-white/10"
                >
                  <AccordionTrigger className="text-left text-base font-semibold text-white">
                    {t(category.labelKey)}
                  </AccordionTrigger>
                  <AccordionContent className="px-1">
                    <div className="space-y-4">
                      {category.rows.map((row) => {
                        const featureLabel = t(row.labelKey);
                        const infoText = t(row.infoKey);
                        const infoAriaLabel = getInfoAriaLabel(featureLabel);

                        return (
                          <div
                            key={row.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-white">{featureLabel}</p>
                              <RowInfo
                                info={infoText}
                                readMoreLabel={infoReadMoreLabel}
                                ariaLabel={infoAriaLabel}
                                size="sm"
                              />
                            </div>
                            <p className="mt-2 text-xs text-white/60">{infoText}</p>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                              {TABLE_DATA.tiers.map((tier) => (
                                <div
                                  key={tier.id}
                                  className="flex flex-col items-center gap-2 text-center"
                                >
                                  <span className="text-xs font-medium text-white/80">
                                    {t(tier.labelKey)}
                                  </span>
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
                                  <span className="text-[11px] text-muted-foreground">
                                    {t(tier.priceKey)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {row.noteKey ? (
                              <p className="mt-3 text-xs text-muted-foreground md:hidden">
                                {t(row.noteKey)}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-sm text-muted-foreground">{t("cta.scrollLabel")}</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {TABLE_DATA.tiers.map((tier) => (
                <Link
                  key={tier.id}
                  href={tier.anchor}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                >
                  {t(`cta.chooseTier${tier.id.slice(1)}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
