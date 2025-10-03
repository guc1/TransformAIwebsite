import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { formatDateWithZone } from "@/lib/date";
import { MEETING_TIME_ZONE } from "@/lib/meetings/constants";
import { getUpcomingMeetings } from "@/lib/meetings/queries";
import { getVisitorOverview, type VisitorOverview } from "@/lib/visitors";
import { getHoursSavedOverview, type HoursSavedScheduleEntry } from "@/lib/hours-saved";
import { HOURS_SAVED_TIME_ZONE } from "@/lib/hours-saved/constants";
import { VisitorsChartSection, type VisitorsChartBucket } from "./components/visitors-chart";
import { HoursSavedManager } from "./components/hours-saved-manager";
import { desc, eq, sql } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function DashboardPage({ params }: PageProps) {
  const session = await getAuthSession();
  const locale = params.locale;

  if (session?.user?.role !== "staff") {
    redirect(`/${locale}/newsupdates`);
  }

  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const [
    roleCounts,
    upcomingMeetings,
    clientAccounts,
    staffAccounts,
    visitorOverview,
    hoursSavedOverview,
  ] =
    await Promise.all([
      db
        .select({
          role: users.role,
          total: sql<number>`count(*)`,
        })
        .from(users)
        .groupBy(users.role),
      getUpcomingMeetings(8),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.role, "client"))
        .orderBy(desc(users.createdAt)),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.role, "staff"))
        .orderBy(desc(users.createdAt)),
      getVisitorOverview(),
      getHoursSavedOverview(),
    ]);

  type UpcomingMeeting = (typeof upcomingMeetings)[number];

  const totals: Record<string, number> = { client: 0, staff: 0 };
  for (const row of roleCounts) {
    totals[row.role] = Number(row.total);
  }

  const visitorTabs = {
    hourly: t("visitors.tabs.hourly"),
    daily: t("visitors.tabs.daily"),
  } as const;

  const visitorEmptyMessages = {
    hourly: t("visitors.empty.hourly"),
    daily: t("visitors.empty.daily"),
  } as const;

  const hourLabelFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dayLabelFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
  });
  const dayTooltipFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
  });

  const hourlyChartData = visitorOverview.hourly.map(
    (bucket: VisitorOverview["hourly"][number]): VisitorsChartBucket => ({
      id: bucket.start.toISOString(),
      label: hourLabelFormatter.format(bucket.start),
      count: bucket.count,
      tooltip: t("visitors.tooltip.hour", {
        count: bucket.count,
        start: hourLabelFormatter.format(bucket.start),
        end: hourLabelFormatter.format(bucket.end),
      }),
    }),
  );

  const dailyChartData = visitorOverview.daily.map(
    (bucket: VisitorOverview["daily"][number]): VisitorsChartBucket => ({
      id: bucket.day.toISOString(),
      label: dayLabelFormatter.format(bucket.day),
      count: bucket.count,
      tooltip: t("visitors.tooltip.day", {
        count: bucket.count,
        day: dayTooltipFormatter.format(bucket.day),
      }),
    }),
  );

  const accountColumnLabels = {
    name: t("accounts.columns.name"),
    email: t("accounts.columns.email"),
    createdAt: t("accounts.columns.createdAt"),
  } as const;

  const hoursSavedSchedule = hoursSavedOverview.schedule.map((entry: HoursSavedScheduleEntry) => ({
    scheduledFor: entry.scheduledFor.toISOString(),
    amount: entry.amount,
  }));

  const hoursSavedDialogStrings = {
    baseLabel: t("hoursSaved.dialog.baseLabel"),
    baseHelper: t("hoursSaved.dialog.baseHelper"),
    quickHeading: t("hoursSaved.dialog.quickHeading"),
    quickDescription: t("hoursSaved.dialog.quickDescription"),
    dayLabel: t("hoursSaved.dialog.dayLabel"),
    nightLabel: t("hoursSaved.dialog.nightLabel"),
    varianceLabel: t("hoursSaved.dialog.varianceLabel"),
    varianceHelper: t("hoursSaved.dialog.varianceHelper"),
    applyDefaultsLabel: t("hoursSaved.dialog.applyDefaults"),
    randomizeLabel: t("hoursSaved.dialog.randomize"),
    manualHeading: t("hoursSaved.dialog.manualHeading"),
    manualDescription: t("hoursSaved.dialog.manualDescription", { timeZone: HOURS_SAVED_TIME_ZONE }),
    resetLabel: t("hoursSaved.dialog.reset"),
    submitLabel: t("hoursSaved.dialog.submit"),
    savingLabel: t("hoursSaved.dialog.saving"),
    cancelLabel: t("hoursSaved.dialog.cancel"),
    successMessage: t("hoursSaved.dialog.success"),
    errorMessage: t("hoursSaved.dialog.error"),
    validationError: t("hoursSaved.dialog.validation"),
    amountSuffix: t("hoursSaved.dialog.amountSuffix"),
  } as const;

  const ratioValue =
    totals.staff === 0 ? "–" : `${(totals.client / Math.max(totals.staff, 1)).toFixed(1)} : 1`;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),_transparent_55%)] py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-280px] h-[560px] bg-gradient-to-b from-blue-500/20 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{t("eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("title")}</h1>
            <p className="mt-4 text-base text-white/60 sm:text-lg">{t("subtitle")}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-xs text-white/70">
            {t("currentUser", { email: session.user.email ?? "" })}
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Card className="relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl transition hover:border-white/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white/70">
                      {t("metrics.clients.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-4xl font-semibold tracking-tight text-white">
                      {totals.client.toLocaleString(locale)}
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      {t("metrics.clients.caption", { count: totals.client })}
                    </p>
                  </CardContent>
                </Card>
              </button>
            </DialogTrigger>
            <AccountListDialog
              title={t("accounts.clients.title")}
              description={t("accounts.clients.description")}
              emptyLabel={t("accounts.clients.empty")}
              accounts={clientAccounts}
              locale={locale}
              columns={accountColumnLabels}
            />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Card className="relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl transition hover:border-white/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white/70">
                      {t("metrics.staff.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-4xl font-semibold tracking-tight text-white">
                      {totals.staff.toLocaleString(locale)}
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      {t("metrics.staff.caption", { count: totals.staff })}
                    </p>
                  </CardContent>
                </Card>
              </button>
            </DialogTrigger>
            <AccountListDialog
              title={t("accounts.staff.title")}
              description={t("accounts.staff.description")}
              emptyLabel={t("accounts.staff.empty")}
              accounts={staffAccounts}
              locale={locale}
              columns={accountColumnLabels}
            />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Card className="relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl transition hover:border-white/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white/70">
                      {t("metrics.visitors.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-4xl font-semibold tracking-tight text-white">
                      {visitorOverview.total.toLocaleString(locale)}
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      {t("metrics.visitors.caption", { count: visitorOverview.total })}
                    </p>
                  </CardContent>
                </Card>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-neutral-950 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {t("visitors.title")}
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  {t("visitors.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <VisitorsChartSection
                  hourly={hourlyChartData}
                  daily={dailyChartData}
                  tabLabels={visitorTabs}
                  emptyMessages={visitorEmptyMessages}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Card className="relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl transition hover:border-white/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white/70">
                      {t("metrics.hoursSaved.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-4xl font-semibold tracking-tight text-white">
                      {hoursSavedOverview.currentAmount.toLocaleString(locale)}
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      {t("metrics.hoursSaved.caption", { count: hoursSavedOverview.currentAmount })}
                    </p>
                  </CardContent>
                </Card>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-neutral-950 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{t("hoursSaved.dialog.title")}</DialogTitle>
                <DialogDescription className="text-white/60">
                  {t("hoursSaved.dialog.description", { timeZone: HOURS_SAVED_TIME_ZONE })}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <HoursSavedManager
                  locale={locale}
                  timeZone={HOURS_SAVED_TIME_ZONE}
                  baseAmount={hoursSavedOverview.baseAmount}
                  schedule={hoursSavedSchedule}
                  strings={hoursSavedDialogStrings}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Card className="relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white/70">
                {t("metrics.ratio.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-4xl font-semibold tracking-tight text-white">{ratioValue}</p>
              <p className="mt-2 text-sm text-white/60">{t("metrics.ratio.caption")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {t("meetings.title")}
            </h2>
            {upcomingMeetings.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/70">
                {t("meetings.empty")}
              </p>
            ) : (
              <div className="mt-4 grid gap-4">
                {upcomingMeetings.map((meeting: UpcomingMeeting) => {
                  const startLabel = formatDateWithZone(
                    meeting.startAt,
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                    locale,
                    MEETING_TIME_ZONE,
                  );
                  const endLabel = formatDateWithZone(
                    meeting.endAt,
                    { hour: "2-digit", minute: "2-digit" },
                    locale,
                    MEETING_TIME_ZONE,
                  );
                  const contactLines = [
                    meeting.personName,
                    meeting.company,
                    meeting.email,
                  ].filter(Boolean);

                  return (
                    <div
                      key={meeting.slotId}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/80"
                    >
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <DashboardMeetingField
                          label={t("meetings.fields.when")}
                          value={`${startLabel} – ${endLabel}`}
                        />
                        <DashboardMeetingField
                          label={t("meetings.fields.reason")}
                          value={meeting.reason}
                        />
                        <DashboardMeetingField
                          label={t("meetings.fields.contact")}
                          value={contactLines.join(" • ")}
                        />
                        <DashboardMeetingField
                          label={t("meetings.fields.staff")}
                          value={meeting.assignedStaffName ?? "–"}
                        />
                      </div>
                      {meeting.publicDescription ? (
                        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/70">
                          <p className="font-semibold uppercase tracking-[0.3em] text-white/50">
                            {t("meetings.fields.notes")}
                          </p>
                          <p className="mt-1 leading-relaxed text-white/70">
                            {meeting.publicDescription}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-sm leading-relaxed text-white/70">
          <h2 className="text-xl font-semibold text-white">{t("nextSteps.title")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>{t("nextSteps.items.audit")}</li>
            <li>{t("nextSteps.items.outreach")}</li>
            <li>{t("nextSteps.items.briefings")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

type DashboardMeetingFieldProps = {
  label: string;
  value: string;
};

type AccountSummary = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date | null;
};

type AccountListDialogProps = {
  title: string;
  description: string;
  accounts: AccountSummary[];
  locale: string;
  emptyLabel: string;
  columns: {
    name: string;
    email: string;
    createdAt: string;
  };
};

function AccountListDialog({
  title,
  description,
  accounts,
  locale,
  emptyLabel,
  columns,
}: AccountListDialogProps) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <DialogContent className="max-w-2xl bg-neutral-950 text-white sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-white">{title}</DialogTitle>
        <DialogDescription className="text-white/60">{description}</DialogDescription>
      </DialogHeader>

      {accounts.length === 0 ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">{emptyLabel}</p>
      ) : (
        <div className="mt-6 rounded-xl border border-white/10 bg-black/30">
          <div className="max-h-[320px] overflow-y-auto">
            <Table className="min-w-full text-sm text-white/80">
              <TableHeader>
                <TableRow className="border-white/10 text-white/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                    {columns.name}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                    {columns.email}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                    {columns.createdAt}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const createdAt = account.createdAt ? new Date(account.createdAt) : null;

                  return (
                    <TableRow key={account.id} className="border-white/10 text-white/80">
                      <TableCell className="align-top font-medium text-white">
                        {account.name?.trim() || "–"}
                      </TableCell>
                      <TableCell className="align-top text-white/70">{account.email}</TableCell>
                      <TableCell className="align-top text-white/60">
                        {createdAt ? dateFormatter.format(createdAt) : "–"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

function DashboardMeetingField({ label, value }: DashboardMeetingFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
        {label}
      </p>
      <p className="text-sm text-white/80">{value}</p>
    </div>
  );
}
