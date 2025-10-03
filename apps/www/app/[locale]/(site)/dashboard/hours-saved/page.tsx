import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { HoursSavedManager } from "../components/hours-saved-manager";
import { getAuthSession } from "@/lib/auth";
import { formatDateWithZone } from "@/lib/date";
import { getHoursSavedOverview } from "@/lib/hours-saved";
import { HOURS_SAVED_TIME_ZONE } from "@/lib/hours-saved/constants";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function HoursSavedDashboardPage({ params }: PageProps) {
  const { locale } = params;
  const session = await getAuthSession();

  if (session?.user?.role !== "staff") {
    redirect(`/${locale}/newsupdates`);
  }

  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const referenceDate = new Date();
  const hoursSavedOverview = await getHoursSavedOverview(referenceDate);

  const hoursSavedSchedule = hoursSavedOverview.schedule.map((entry) => ({
    scheduledFor: entry.scheduledFor.toISOString(),
    amount: entry.amount,
  }));

  const nextUpdateLabel = hoursSavedOverview.nextUpdateAt
    ? formatDateWithZone(
        hoursSavedOverview.nextUpdateAt,
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        },
        locale,
        HOURS_SAVED_TIME_ZONE,
      )
    : null;

  const currentAmountLabel = t("summary.currentValue", {
    amount: hoursSavedOverview.currentAmount.toLocaleString(locale),
  });

  const nextUpdateValue = nextUpdateLabel
    ? t("summary.nextValue", { time: nextUpdateLabel })
    : t("summary.noUpcoming");

  return (
    <div className="bg-black py-12 sm:py-16">
      <div className="container max-w-4xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-sm text-white/60 sm:text-base">{t("subtitle")}</p>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            {t("currentUser", { email: session.user.email ?? "" })}
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur">
          <div className="grid gap-4 text-sm text-white/70 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                {t("summary.currentLabel")}
              </p>
              <p className="mt-2 text-xl font-semibold text-white">{currentAmountLabel}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                {t("summary.nextLabel")}
              </p>
              <p className="mt-2 text-base font-medium text-white">{nextUpdateValue}</p>
            </div>
          </div>

          <HoursSavedManager
            locale={locale}
            timeZone={HOURS_SAVED_TIME_ZONE}
            baseAmount={hoursSavedOverview.baseAmount}
            schedule={hoursSavedSchedule}
            referenceTimestamp={referenceDate.toISOString()}
          />
        </section>
      </div>
    </div>
  );
}
