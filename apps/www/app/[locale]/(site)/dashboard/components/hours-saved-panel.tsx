import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOURS_SAVED_TIME_ZONE, getHoursSavedDashboardData } from "@/lib/hours-saved";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

import {
  regenerateHoursSavedPlanAction,
  updateHoursSavedAdjustmentAction,
  updateHoursSavedSettingsAction,
} from "../actions/hours-saved";

type HoursSavedPanelProps = {
  locale: string;
};

export async function HoursSavedPanel({ locale }: HoursSavedPanelProps) {
  const dashboardData = await getHoursSavedDashboardData();
  const t = await getTranslations({ locale, namespace: "Dashboard.hoursSaved" });

  const { config, summary, upcoming } = dashboardData;

  const numberFormatter = new Intl.NumberFormat(locale);
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: HOURS_SAVED_TIME_ZONE,
  });

  return (
    <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-semibold text-white/80">
          {t("title")}
        </CardTitle>
        <p className="mt-2 text-sm text-white/60">{t("description")}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                {t("summary.current")}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {numberFormatter.format(summary.total)}+
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                {t("summary.lastApplied")}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {timeFormatter.format(summary.lastAppliedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                {t("summary.nextUpdate")}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {summary.nextUpdateAt ? timeFormatter.format(summary.nextUpdateAt) : t("summary.noUpcoming")}
              </p>
            </div>
          </div>
        </div>

        <form
          action={updateHoursSavedSettingsAction}
          className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              id="hours-saved-base"
              label={t("fields.baseAmount.label")}
              description={t("fields.baseAmount.help")}
            >
              <Input
                id="hours-saved-base"
                name="baseAmount"
                type="number"
                min={0}
                step={1}
                defaultValue={Math.round(config.baseAmount)}
                className="bg-black/50 text-white"
              />
            </Field>
            <Field
              id="hours-saved-day"
              label={t("fields.dayIncrement.label")}
              description={t("fields.dayIncrement.help")}
            >
              <Input
                id="hours-saved-day"
                name="dayIncrement"
                type="number"
                min={0}
                step={1}
                defaultValue={config.dayIncrement}
                className="bg-black/50 text-white"
              />
            </Field>
            <Field
              id="hours-saved-night"
              label={t("fields.nightIncrement.label")}
              description={t("fields.nightIncrement.help")}
            >
              <Input
                id="hours-saved-night"
                name="nightIncrement"
                type="number"
                min={0}
                step={1}
                defaultValue={config.nightIncrement}
                className="bg-black/50 text-white"
              />
            </Field>
          </div>
          <Button type="submit" variant="secondary" className="w-full bg-white/10 text-white hover:bg-white/20 sm:w-auto">
            {t("actions.saveSettings")}
          </Button>
        </form>

        <form
          action={regenerateHoursSavedPlanAction}
          className="inline-flex w-full flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">{t("regenerate.title")}</p>
            <p className="text-xs text-white/60">{t("regenerate.description")}</p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:flex-nowrap">
            <input type="hidden" name="locale" value={locale} />
            <Button
              type="submit"
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              {t("actions.regenerate")}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{t("schedule.title")}</p>
              <p className="text-xs text-white/60">{t("schedule.description")}</p>
            </div>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
              {t("schedule.empty")}
            </p>
          ) : (
            <div className="grid gap-3">
              {upcoming.map((entry) => (
                <form
                  key={entry.id}
                  action={updateHoursSavedAdjustmentAction}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={entry.id} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      {timeFormatter.format(entry.applyAt)}
                    </p>
                    <p className="text-xs text-white/60">
                      {t(`schedule.period.${entry.period}`)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Label htmlFor={`hours-saved-amount-${entry.id}`} className="sr-only">
                      {t("fields.overrideLabel")}
                    </Label>
                    <Input
                      id={`hours-saved-amount-${entry.id}`}
                      name="amount"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={entry.amount}
                      className="w-28 bg-black/50 text-white"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      className="bg-white/10 text-white hover:bg-white/20"
                    >
                      {t("actions.updateHour")}
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  id: string;
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

function Field({ id, label, description, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
        {label}
      </Label>
      {children}
      {description ? <p className="text-xs text-white/50">{description}</p> : null}
    </div>
  );
}
