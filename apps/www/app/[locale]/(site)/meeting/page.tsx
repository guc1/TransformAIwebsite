import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { getMeetingCalendar } from "@/lib/meetings/queries";

import { MeetingScheduler } from "./components/scheduler";

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "Meeting",
  });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function MeetingPage({ params }: PageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Meeting" });
  const calendar = await getMeetingCalendar();

  const days = calendar.map((day) => ({
    dateKey: day.dateKey,
    date: day.date.toISOString(),
    availableSlots: day.availableSlots,
    totalSlots: day.totalSlots,
    status: day.status,
    slots: day.slots.map((slot) => ({
      id: slot.id,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      status: slot.status,
      isPublished: slot.isPublished,
      publicDescription: slot.publicDescription,
      staffName: slot.assignedStaffName ?? slot.assignedStaff?.name ?? null,
      hasBooking: Boolean(slot.booking),
    })),
  }));

  return (
    <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)] py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-280px] h-[520px] bg-gradient-to-b from-blue-500/30 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-6xl space-y-16">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
            {t("Hero.badge")}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("Hero.title")}
          </h1>
          <p className="text-lg text-white/70 sm:text-xl">{t("Hero.subtitle")}</p>
        </div>

        <MeetingScheduler days={days} locale={locale} />
      </div>
    </div>
  );
}
