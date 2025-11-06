import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { CTA } from "@/components/cta";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/outreach/countdown-timer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOutreachPageBySlug, recordOutreachVisit } from "@/lib/outreach";

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export default async function OutreachLandingPage({ params }: PageProps) {
  const { locale, slug } = params;
  const t = await getTranslations({ locale, namespace: "OutreachPage" });
  const record = await recordOutreachVisit(slug);

  if (!record) {
    notFound();
  }

  const firstVisit = record.firstVisitedAt ?? record.createdAt;
  const countdownTarget = new Date(firstVisit);
  countdownTarget.setHours(countdownTarget.getHours() + 48);
  const meetingHref = `/${locale}/meeting?outreach=${record.slug}` as const;
  const templateLabel = t("templateBadge", { id: record.templateId });

  const paragraphs = record.displayText
    .split(/\r?\n\r?\n+/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
  const leadParagraph = paragraphs[0] ?? record.displayText;
  const detailParagraphs = paragraphs.slice(1);

  return (
    <div className="bg-black text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(76,161,255,0.25),rgba(0,0,0,0.9))]" />
        <div className="container flex flex-col gap-6 py-24 sm:gap-8 sm:py-32">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              {t("eyebrow")}
            </p>
            <Badge className="w-fit border-white/20 bg-white/5 text-[11px] uppercase tracking-[0.3em] text-white/60" variant="outline">
              {templateLabel}
            </Badge>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("headline", { company: record.displayName })}
            </h1>
            <p className="text-sm text-white/50">/outreach/{record.slug}</p>
          </div>

          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-white/70 sm:text-lg">
            <p className="whitespace-pre-line">{leadParagraph}</p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto bg-white text-black hover:bg-white/90",
              )}
              href={meetingHref}
            >
              {t("primaryCta")}
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto border-white/40 text-white/80 hover:bg-white/10",
              )}
              href={`/${locale}/newsupdates`}
            >
              {t("secondaryCta")}
            </Link>
          </div>

          {record.bookedMeeting ? (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {t("bookedBanner")}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                {t("timer.eyebrow")}
              </p>
              <CountdownTimer
                expiredLabel={t("timer.expired")}
                runningTemplate={t("timer.running")}
                target={countdownTarget.toISOString()}
              />
            </div>
            <p className="text-xs text-white/50 sm:text-sm">{t("timer.helper")}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/90 py-16 sm:py-24">
        <div className="container space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-[38px]">
              {t("bodyTitle", { company: record.displayName })}
            </h2>
            <p className="text-base text-white/60 sm:text-lg">{t("bodySubtitle")}</p>
          </div>

          <div className="grid gap-6 text-base leading-relaxed text-white/70 sm:grid-cols-[minmax(0,1fr)]">
            {(detailParagraphs.length > 0 ? detailParagraphs : [leadParagraph]).map((paragraph, index) => (
              <div key={`detail-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="whitespace-pre-line text-sm sm:text-base">{paragraph}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">{t("commitment.title")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
              {t("commitment.body")}
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = params;
  const page = await getOutreachPageBySlug(slug);

  if (!page) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "OutreachPage" });
  const title = t("metaTitle", { company: page.displayName });
  const description = t("metaDescription");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}
