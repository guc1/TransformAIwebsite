import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getAuthSession } from "@/lib/auth";
import { getMeetingCalendar, getStaffMembers } from "@/lib/meetings/queries";

import { StaffPlanner } from "./components/planner";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function PlanningPage({ params }: PageProps) {
  const session = await getAuthSession();
  const { locale } = params;

  if (session?.user?.role !== "staff") {
    redirect(`/${locale}/newsupdates`);
  }

  const t = await getTranslations({ locale, namespace: "Planning" });

  const [calendar, staffMembers] = await Promise.all([
    getMeetingCalendar({ includeHidden: true }),
    getStaffMembers(),
  ]);

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
      assignedStaffId: slot.assignedStaffId ?? null,
      assignedStaffName: slot.assignedStaffName ?? slot.assignedStaff?.name ?? null,
      hasBooking: Boolean(slot.booking),
      booking: slot.booking
        ? {
            personName: slot.booking.personName,
            email: slot.booking.email,
            company: slot.booking.company,
            reason: slot.booking.reason,
            description: slot.booking.description,
          }
        : null,
    })),
  }));

  const staff = staffMembers.map((member) => ({
    id: member.id,
    name: member.name ?? member.email ?? "Unnamed",
    email: member.email ?? null,
  }));

  return (
    <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_55%)] py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-320px] h-[600px] bg-gradient-to-b from-purple-500/25 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-7xl space-y-16">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
            {t("eyebrow")}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-lg text-white/70 sm:text-xl">{t("subtitle")}</p>
        </div>

        <StaffPlanner days={days} staff={staff} locale={locale} />
      </div>
    </div>
  );
}
