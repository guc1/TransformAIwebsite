"use client";

import { Particles } from "@/components/particles";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Info, Minus, X } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { useTranslations } from "next-intl";

type TierId = "t1" | "t2" | "t3";

type Availability = "yes" | "no" | "partial";

type TierDefinition = {
  id: TierId;
  labelKey: string;
  priceKey: string;
  ctaKey: string;
  href?: string;
};

type RowDefinition = {
  id: string;
  labelKey: string;
  availability: Record<TierId, Availability>;
  noteKey?: Partial<Record<TierId, string>>;
};

type CategoryDefinition = {
  id: string;
  labelKey: string;
  rows: RowDefinition[];
};

const tiers: TierDefinition[] = [
  {
    id: "t1",
    labelKey: "tiers.t1",
    priceKey: "tiers.price.t1",
    ctaKey: "cta.chooseT1",
    href: "#tier-1",
  },
  {
    id: "t2",
    labelKey: "tiers.t2",
    priceKey: "tiers.price.t2",
    ctaKey: "cta.chooseT2",
    href: "#tier-2",
  },
  {
    id: "t3",
    labelKey: "tiers.t3",
    priceKey: "tiers.price.t3",
    ctaKey: "cta.chooseT3",
    href: "#tier-3",
  },
];

const categories: CategoryDefinition[] = [
  {
    id: "research",
    labelKey: "categories.research",
    rows: [
      {
        id: "analyzeIntegrations",
        labelKey: "rows.analyzeIntegrations",
        availability: {
          t1: "yes",
          t2: "yes",
          t3: "yes",
        },
      },
      {
        id: "buildCustomModel",
        labelKey: "rows.buildCustomModel",
        availability: {
          t1: "no",
          t2: "partial",
          t3: "yes",
        },
        noteKey: {
          t2: "notes.limitedScope",
          t3: "notes.fullSupport",
        },
      },
      {
        id: "exploreResearch",
        labelKey: "rows.exploreResearch",
        availability: {
          t1: "no",
          t2: "yes",
          t3: "yes",
        },
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
        availability: {
          t1: "yes",
          t2: "yes",
          t3: "yes",
        },
      },
      {
        id: "courseV2",
        labelKey: "rows.courseV2",
        availability: {
          t1: "no",
          t2: "yes",
          t3: "yes",
        },
      },
      {
        id: "courseV3",
        labelKey: "rows.courseV3",
        availability: {
          t1: "no",
          t2: "no",
          t3: "yes",
        },
      },
    ],
  },
];

const availabilityIcon: Record<Availability, typeof Check> = {
  yes: Check,
  no: X,
  partial: Minus,
};

const availabilityTone: Record<Availability, string> = {
  yes: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  no: "border-white/10 bg-white/5 text-white/40",
  partial: "border-amber-300/40 bg-amber-400/10 text-amber-200",
};

export const PricingCompareTable: React.FC = () => {
  const t = useTranslations("Pricing.Table");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-black/80 shadow-[0_0_60px_rgba(14,8,62,0.45)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7002FC]/30 via-[#0239FC]/20 to-transparent" aria-hidden />
        <div className="absolute -inset-x-32 -top-32 h-64 bg-gradient-radial from-[#02DEFC]/40 via-transparent to-transparent opacity-60" aria-hidden />
        {!shouldReduceMotion ? (
          <Particles
            className="absolute inset-0 opacity-60"
            quantity={45}
            color="#9D72FF"
            vx={0.06}
            vy={-0.08}
          />
        ) : null}

        <div className="relative z-10 flex flex-col gap-8 px-4 py-8 sm:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-[2.25rem]">
              {t("title")}
            </h2>
          </div>

          <div className="hidden text-sm md:block">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <table className="w-full border-collapse text-left text-sm text-white">
                <thead className="bg-white/10">
                  <tr className="text-xs uppercase tracking-wide text-white/60">
                    <th
                      scope="col"
                      className="px-6 py-4 text-left font-medium text-white/60"
                    >
                      {t("columns.features")}
                    </th>
                    {tiers.map((tier) => (
                      <th
                        key={tier.id}
                        scope="col"
                        className="px-6 py-4 text-center font-medium text-white"
                      >
                        <div className="flex flex-col items-center gap-1 text-sm">
                          <span className="font-semibold text-white">
                            {t(tier.labelKey)}
                          </span>
                          <span className="text-xs font-medium text-white/60">
                            {t(tier.priceKey)}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {categories.map((category) => (
                    <Fragment key={category.id}>
                      <tr className="bg-white/10">
                        <th
                          colSpan={tiers.length + 1}
                          scope="colgroup"
                          className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/70"
                        >
                          {t(category.labelKey)}
                        </th>
                      </tr>
                      {category.rows.map((row) => (
                        <tr key={row.id} className="align-top text-sm">
                          <th
                            scope="row"
                            className="px-6 py-4 text-left font-medium text-white"
                          >
                            {t(row.labelKey)}
                          </th>
                          {tiers.map((tier) => (
                            <td key={tier.id} className="px-6 py-4">
                              <AvailabilityBadge
                                state={row.availability[tier.id]}
                                label={t(`availability.${row.availability[tier.id]}`)}
                                note={row.noteKey?.[tier.id] ? t(row.noteKey[tier.id] as string) : undefined}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm md:hidden">
            <Accordion type="multiple" defaultValue={categories.map((category) => category.id)}>
              {categories.map((category) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4"
                >
                  <AccordionTrigger className="text-left text-base font-semibold text-white">
                    {t(category.labelKey)}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {category.rows.map((row) => (
                      <div
                        key={row.id}
                        className="rounded-2xl border border-white/10 bg-black/40 p-4"
                      >
                        <p className="text-sm font-medium text-white">
                          {t(row.labelKey)}
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-white/70">
                          {tiers.map((tier) => (
                            <div key={tier.id} className="flex flex-col items-center gap-2">
                              <span className="font-medium text-white/70">
                                {t(tier.labelKey)}
                              </span>
                              <AvailabilityBadge
                                state={row.availability[tier.id]}
                                label={t(`availability.${row.availability[tier.id]}`)}
                                note={row.noteKey?.[tier.id] ? t(row.noteKey[tier.id] as string) : undefined}
                                compact
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {tiers.map((tier) => (
              <Link
                key={tier.id}
                href={tier.href ?? "#"}
                className="group flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
              >
                <span>{t(tier.ctaKey)}</span>
                <ArrowRight className="h-4 w-4 text-white/60 transition group-hover:text-white" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

type AvailabilityBadgeProps = {
  state: Availability;
  label: string;
  note?: string;
  compact?: boolean;
};

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({ state, label, note, compact }) => {
  const Icon = availabilityIcon[state];
  const tone = availabilityTone[state];

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        role="img"
        aria-label={label}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border text-base",
          tone,
          compact && "h-9 w-9 text-sm",
        )}
      >
        <Icon aria-hidden className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
      </div>
      {note ? (
        <div className="flex items-center gap-1 text-[0.7rem] font-medium text-white/60">
          <Info className="h-3.5 w-3.5" aria-hidden />
          <span className="max-w-[9rem] text-left leading-tight">{note}</span>
        </div>
      ) : null}
    </div>
  );
};
