"use client";

import { Color, EnterpriseCardHighlight } from "@/app/[locale]/(site)/pricing/components";
import { Particles } from "@/components/particles";
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
  noteKey?: string;
};

type PricingTableCategory = {
  id: string;
  labelKey: string;
  rows: PricingTableRow[];
};

type PricingTableData = {
  tiers: Array<{ id: TierId; labelKey: string; priceKey: string; anchor: string }>;
  categories: PricingTableCategory[];
};

const TABLE_DATA: PricingTableData = {
  tiers: [
    { id: "t1", labelKey: "tiers.t1", priceKey: "tiers.price.t1", anchor: "#pricing-tier-1" },
    { id: "t2", labelKey: "tiers.t2", priceKey: "tiers.price.t2", anchor: "#pricing-tier-2" },
    { id: "t3", labelKey: "tiers.t3", priceKey: "tiers.price.t3", anchor: "#pricing-tier-3" },
  ],
  categories: [
    {
      id: "research",
      labelKey: "categories.research",
      rows: [
        {
          id: "analyzeIntegrations",
          labelKey: "rows.analyzeIntegrations",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "buildCustomModel",
          labelKey: "rows.buildCustomModel",
          availability: { t1: "no", t2: "partial", t3: "yes" },
          noteKey: "rows.notes.buildCustomModel.limited",
        },
        {
          id: "exploreResearch",
          labelKey: "rows.exploreResearch",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
      ],
    },
    {
      id: "education",
      labelKey: "categories.education",
      rows: [
        {
          id: "courseV1",
          labelKey: "rows.courseV1",
          availability: { t1: "yes", t2: "yes", t3: "yes" },
        },
        {
          id: "courseV2",
          labelKey: "rows.courseV2",
          availability: { t1: "no", t2: "yes", t3: "yes" },
        },
        {
          id: "courseV3",
          labelKey: "rows.courseV3",
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
  size?: "md" | "sm";
};

const sizeMap = {
  md: "h-10 w-10 text-base",
  sm: "h-8 w-8 text-sm",
} satisfies Record<NonNullable<AvailabilityIndicatorProps["size"]>, string>;

function AvailabilityIndicator({ value, label, note, size = "md" }: AvailabilityIndicatorProps) {
  const meta = AVAILABILITY_META[value];
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-center gap-2">
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full border bg-opacity-20 font-medium transition-colors",
          sizeMap[size],
          meta.className,
        )}
      >
        <Icon className={cn(size === "md" ? "h-4 w-4" : "h-3.5 w-3.5")} />
      </span>
      <span className="sr-only">{label}</span>
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
      <section aria-labelledby="pricing-compare-heading" className="relative w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-[0_40px_120px_-60px_rgba(88,54,179,0.85)]">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[#140F2C]/90 via-[#1A1440]/70 to-[#031B4A]/80"
          />
          <div
            aria-hidden
            className="absolute inset-x-8 -top-40 h-96 bg-[radial-gradient(circle_at_top,_rgba(157,114,255,0.45),_transparent_60%)]"
          />
          <EnterpriseCardHighlight className="absolute -top-28 -right-24 w-[420px] opacity-60 mix-blend-screen" />
          <Particles
            className="absolute inset-0 opacity-40 transition-opacity duration-700 pointer-events-none motion-reduce:hidden"
            quantity={60}
            color={Color.Purple}
            vx={0.08}
            vy={-0.06}
          />
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12">
            <div className="text-center">
              <h2
                id="pricing-compare-heading"
                className="text-3xl font-semibold tracking-tight text-white sm:text-[2.25rem]"
              >
                {t("title")}
              </h2>
            </div>

            <div className="mt-10 hidden md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">{t("title")}</caption>
                <thead>
                  <tr className="text-sm text-white/80">
                    <th scope="col" className="px-6 py-4 text-left font-medium text-white/70">
                      {t("headers.feature")}
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
                        colSpan={TABLE_DATA.tiers.length + 1}
                        className="px-6 pt-8 pb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60"
                      >
                        {t(category.labelKey)}
                      </th>
                    </tr>
                    {category.rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-white/10 text-sm"
                      >
                        <th scope="row" className="px-6 py-5 text-left font-medium text-white/90">
                          {t(row.labelKey)}
                        </th>
                        {TABLE_DATA.tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-5 text-center">
                            <AvailabilityIndicator
                              value={row.availability[tier.id]}
                              label={availabilityLabels[row.availability[tier.id]]}
                              note={row.noteKey ? t(row.noteKey) : undefined}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>

            <div className="mt-10 md:hidden">
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
                            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
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
                                    size="sm"
                                  />
                                  <span className="text-[11px] text-muted-foreground">{t(tier.priceKey)}</span>
                                </div>
                              ))}
                            </div>
                            {row.noteKey ? (
                              <p className="mt-3 text-xs text-muted-foreground md:hidden">{t(row.noteKey)}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
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
        </div>
      </section>
    </TooltipProvider>
  );
}
