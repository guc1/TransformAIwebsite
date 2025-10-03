"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import { updateHoursSavedScheduleAction } from "../hours-saved-actions";
import { HOURS_SAVED_WINDOW_HOURS } from "@/lib/hours-saved/constants";
import {
  buildScheduleDisplay,
  createHoursSavedFormatters,
  type ScheduleDisplayEntry,
} from "@/lib/hours-saved/format";

type ScheduleRowState = {
  scheduledFor: Date;
  scheduledForIso: string;
  input: string;
  dayKey: string;
  dayLabel: string;
  hourCode: string;
  rangeLabel: string;
};

type HoursSavedManagerProps = {
  locale: string;
  timeZone: string;
  baseAmount: number;
  dailyTarget: number;
  schedule: ScheduleDisplayEntry[];
  referenceDayKey: string;
};

type DayEntry = {
  id: string;
  hourCode: string;
  rangeLabel: string;
  row: ScheduleRowState;
};

type DayBucket = {
  key: string;
  label: string;
  isToday: boolean;
  entries: DayEntry[];
};

export function HoursSavedManager({
  locale,
  timeZone,
  baseAmount,
  dailyTarget,
  schedule,
  referenceDayKey,
}: HoursSavedManagerProps) {
  const t = useTranslations("Dashboard.hoursSaved");

  const [baseValue, setBaseValue] = useState(baseAmount.toString());
  const [dailyTargetValue, setDailyTargetValue] = useState(dailyTarget.toString());
  const [rows, setRows] = useState<ScheduleRowState[]>(() =>
    schedule.slice(0, HOURS_SAVED_WINDOW_HOURS).map((entry) => ({
      scheduledFor: new Date(entry.scheduledFor),
      scheduledForIso: entry.scheduledFor,
      input: entry.amount.toString(),
      dayKey: entry.dayKey,
      dayLabel: entry.dayLabel,
      hourCode: entry.hourCode,
      rangeLabel: entry.rangeLabel,
    })),
  );
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"manual" | "auto" | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(referenceDayKey);
  const [activeHour, setActiveHour] = useState<string>(schedule[0]?.scheduledFor ?? "");
  const [copyMode, setCopyMode] = useState(false);
  const [copySource, setCopySource] = useState<string | null>(null);
  const [copyTargets, setCopyTargets] = useState<string[]>([]);

  const formatters = useMemo(
    () => createHoursSavedFormatters(locale, timeZone),
    [locale, timeZone],
  );

  const todayKey = referenceDayKey;

  useEffect(() => {
    setDailyTargetValue(dailyTarget.toString());
  }, [dailyTarget]);

  const buildRowsFromSchedule = useCallback(
    (entries: { scheduledFor: string; amount: number }[]) =>
      buildScheduleDisplay(entries, formatters).map((entry) => ({
        scheduledFor: new Date(entry.scheduledFor),
        scheduledForIso: entry.scheduledFor,
        input: entry.amount.toString(),
        dayKey: entry.dayKey,
        dayLabel: entry.dayLabel,
        hourCode: entry.hourCode,
        rangeLabel: entry.rangeLabel,
      })),
    [formatters],
  );

  const dayBuckets: DayBucket[] = useMemo(() => {
    const byDay = new Map<string, DayBucket>();

    for (const row of rows) {
      const bucket = byDay.get(row.dayKey);

      if (bucket) {
        bucket.entries.push({
          id: row.scheduledForIso,
          hourCode: row.hourCode,
          rangeLabel: row.rangeLabel,
          row,
        });
        continue;
      }

      byDay.set(row.dayKey, {
        key: row.dayKey,
        label: row.dayLabel,
        isToday: row.dayKey === todayKey,
        entries: [
          {
            id: row.scheduledForIso,
            hourCode: row.hourCode,
            rangeLabel: row.rangeLabel,
            row,
          },
        ],
      });
    }

    return Array.from(byDay.values()).map((bucket) => ({
      ...bucket,
      entries: bucket.entries.sort(
        (a, b) => a.row.scheduledFor.getTime() - b.row.scheduledFor.getTime(),
      ),
    }));
  }, [rows, todayKey]);

  useEffect(() => {
    if (selectedDay && dayBuckets.some((bucket) => bucket.key === selectedDay)) {
      return;
    }

    const fallback = dayBuckets[0]?.key ?? "";
    if (fallback) {
      setSelectedDay(fallback);
      setActiveHour(dayBuckets[0]?.entries[0]?.id ?? "");
    }
  }, [dayBuckets, selectedDay]);

  const selectedDayBucket = useMemo(
    () => dayBuckets.find((bucket) => bucket.key === selectedDay),
    [dayBuckets, selectedDay],
  );

  useEffect(() => {
    if (!selectedDayBucket) {
      return;
    }

    if (!selectedDayBucket.entries.some((entry) => entry.id === activeHour)) {
      const fallback = selectedDayBucket.entries[0]?.id ?? "";
      setActiveHour(fallback);
    }
  }, [selectedDayBucket, activeHour]);

  const activeEntry = useMemo(
    () => selectedDayBucket?.entries.find((entry) => entry.id === activeHour) ?? null,
    [selectedDayBucket, activeHour],
  );

  const handleBaseChange = (value: string) => {
    setBaseValue(value);
    setStatus("idle");
    setStatusMessage(null);
  };

  const handleDailyTargetChange = (value: string) => {
    setDailyTargetValue(value);
    setStatus("idle");
    setStatusMessage(null);
  };

  const handleActiveValueChange = (value: string) => {
    if (!activeEntry) {
      return;
    }

    setRows((current) =>
      current.map((row) =>
        row.scheduledForIso === activeEntry.id ? { ...row, input: value } : row,
      ),
    );
    setStatus("idle");
    setStatusMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setStatusMessage(null);

    const baseTrimmed = baseValue.trim();
    const targetTrimmed = dailyTargetValue.trim();

    if (baseTrimmed === "" || targetTrimmed === "") {
      setStatus("error");
      setStatusMessage(t("status.validation"));
      return;
    }

    const parsedBase = Number(baseTrimmed);
    const parsedTarget = Number(targetTrimmed);

    if (
      !Number.isFinite(parsedBase) ||
      parsedBase < 0 ||
      !Number.isInteger(parsedBase) ||
      !Number.isFinite(parsedTarget) ||
      parsedTarget < 0 ||
      !Number.isInteger(parsedTarget)
    ) {
      setStatus("error");
      setStatusMessage(t("status.validation"));
      return;
    }

    const schedulePayload: { scheduledFor: string; amount: number }[] = [];

    for (const row of rows) {
      const trimmed = row.input.trim();
      if (trimmed === "") {
        setStatus("error");
        setStatusMessage(t("status.validation"));
        return;
      }

      const parsed = Number(trimmed);

      if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
        setStatus("error");
        setStatusMessage(t("status.validation"));
        return;
      }

      schedulePayload.push({
        scheduledFor: row.scheduledForIso,
        amount: parsed,
      });
    }

    setPendingAction("manual");
    startTransition(async () => {
      try {
        const result = await updateHoursSavedScheduleAction(locale, {
          mode: "manual",
          baseAmount: parsedBase,
          dailyTarget: parsedTarget,
          schedule: schedulePayload,
        });

        if (!result.success) {
          setStatus("error");
          setStatusMessage(
            result.error === "validation" ? t("status.validation") : t("status.error"),
          );
          return;
        }

        try {
          const response = await fetch("/api/hours-saved", { cache: "no-store" });
          if (response.ok) {
            const data = await response.json();
            setRows(buildRowsFromSchedule(data.schedule));
            setBaseValue(data.baseAmount.toString());
            if (typeof data.dailyTarget === "number") {
              setDailyTargetValue(data.dailyTarget.toString());
            }
          }
        } catch (error) {
          console.error("Failed to refresh hours saved overview", error);
        }

        setStatus("success");
        setStatusMessage(t("status.success"));
        setCopyMode(false);
        setCopySource(null);
        setCopyTargets([]);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleRegenerate = () => {
    setStatus("idle");
    setStatusMessage(null);

    const baseTrimmed = baseValue.trim();
    const targetTrimmed = dailyTargetValue.trim();

    if (baseTrimmed === "" || targetTrimmed === "") {
      setStatus("error");
      setStatusMessage(t("status.validation"));
      return;
    }

    const parsedBase = Number(baseTrimmed);
    const parsedTarget = Number(targetTrimmed);

    if (
      !Number.isFinite(parsedBase) ||
      parsedBase < 0 ||
      !Number.isInteger(parsedBase) ||
      !Number.isFinite(parsedTarget) ||
      parsedTarget < 0 ||
      !Number.isInteger(parsedTarget)
    ) {
      setStatus("error");
      setStatusMessage(t("status.validation"));
      return;
    }

    setPendingAction("auto");
    startTransition(async () => {
      try {
        const result = await updateHoursSavedScheduleAction(locale, {
          mode: "auto",
          baseAmount: parsedBase,
          dailyTarget: parsedTarget,
        });

        if (!result.success) {
          setStatus("error");
          setStatusMessage(
            result.error === "validation" ? t("status.validation") : t("status.error"),
          );
          return;
        }

        try {
          const response = await fetch("/api/hours-saved", { cache: "no-store" });
          if (response.ok) {
            const data = await response.json();
            setRows(buildRowsFromSchedule(data.schedule));
            setBaseValue(data.baseAmount.toString());
            if (typeof data.dailyTarget === "number") {
              setDailyTargetValue(data.dailyTarget.toString());
            }
          }
        } catch (error) {
          console.error("Failed to refresh hours saved overview", error);
        }

        setStatus("success");
        setStatusMessage(t("status.success"));
        setCopyMode(false);
        setCopySource(null);
        setCopyTargets([]);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const toggleCopyMode = () => {
    setCopyMode((current) => {
      const next = !current;
      if (next) {
        setCopySource(selectedDayBucket?.key ?? null);
        setCopyTargets([]);
      } else {
        setCopySource(null);
        setCopyTargets([]);
      }
      return next;
    });
    setStatus("idle");
    setStatusMessage(null);
  };

  const toggleCopyTarget = (dayKey: string) => {
    setCopyTargets((current) =>
      current.includes(dayKey)
        ? current.filter((key) => key !== dayKey)
        : [...current, dayKey],
    );
  };

  const applyCopy = () => {
    if (!copySource || copyTargets.length === 0) {
      setStatus("error");
      setStatusMessage(t("status.copyValidation"));
      return;
    }

    const sourceBucket = dayBuckets.find((bucket) => bucket.key === copySource);

    if (!sourceBucket) {
      setStatus("error");
      setStatusMessage(t("status.copyValidation"));
      return;
    }

    const sourceValues = new Map<string, string>(
      sourceBucket.entries.map((entry) => [entry.hourCode, entry.row.input]),
    );

    setRows((current) =>
      current.map((row) => {
        if (!copyTargets.includes(row.dayKey)) {
          return row;
        }

        const replacement = sourceValues.get(row.hourCode);
        if (replacement === undefined) {
          return row;
        }

        return { ...row, input: replacement };
      }),
    );

    setStatus("success");
    setStatusMessage(t("status.copySuccess"));
    setCopyMode(false);
    setCopySource(null);
    setCopyTargets([]);
  };

  const daySummary = (() => {
    if (!selectedDayBucket) {
      return "";
    }

    if (selectedDayBucket.isToday) {
      const nextLabel = selectedDayBucket.entries[0]?.rangeLabel ?? "";
      return t("days.todaySummary", {
        window: nextLabel,
        remaining: selectedDayBucket.entries.length,
      });
    }

    return t("days.daySummary", { count: selectedDayBucket.entries.length });
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white/80">{t("base.label")}</Label>
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          step={1}
          value={baseValue}
          min={0}
          onChange={(event) => handleBaseChange(event.target.value)}
          className="h-11 rounded-xl border-white/15 bg-white/5 text-base text-white placeholder:text-white/40 focus-visible:ring-white/40"
        />
        <p className="text-xs text-white/50">{t("base.helper")}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-white/80">{t("dailyTarget.label")}</Label>
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          step={1}
          min={0}
          value={dailyTargetValue}
          onChange={(event) => handleDailyTargetChange(event.target.value)}
          className="h-11 rounded-xl border-white/15 bg-white/5 text-base text-white placeholder:text-white/40 focus-visible:ring-white/40"
        />
        <p className="text-xs text-white/50">{t("dailyTarget.helper")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{t("days.heading")}</p>
          <p className="text-xs text-white/50">{t("days.helper")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dayBuckets.map((bucket) => (
            <button
              key={bucket.key}
              type="button"
              onClick={() => {
                setSelectedDay(bucket.key);
                setStatus("idle");
                setStatusMessage(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                selectedDay === bucket.key
                  ? "border-white/90 bg-white text-black shadow"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-white/40",
              )}
            >
              <span>{bucket.label}</span>
              {bucket.isToday ? (
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  {t("days.todayBadge")}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        {daySummary ? <p className="text-xs text-white/60">{daySummary}</p> : null}
      </div>

      {selectedDayBucket ? (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {selectedDayBucket.entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setActiveHour(entry.id);
                  setStatus("idle");
                  setStatusMessage(null);
                }}
                aria-label={t("days.hourButtonAria", {
                  time: entry.rangeLabel,
                  amount: entry.row.input || "0",
                })}
                className={cn(
                  "flex h-14 items-center justify-center rounded-xl border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  activeHour === entry.id
                    ? "border-white/80 bg-white text-black shadow"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/40",
                )}
              >
                {entry.rangeLabel}
              </button>
            ))}
          </div>

          {activeEntry ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {t("editor.title", { time: activeEntry.rangeLabel })}
                </p>
                <p className="text-xs text-white/50">{t("editor.helper")}</p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Label htmlFor="hour-amount" className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                  {t("editor.amountLabel")}
                </Label>
                <Input
                  id="hour-amount"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  step={1}
                  min={0}
                  value={activeEntry.row.input}
                  onChange={(event) => handleActiveValueChange(event.target.value)}
                  className="h-10 w-28 rounded-xl border-white/15 bg-black/60 text-right text-sm text-white focus-visible:ring-white/40"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
                  {t("editor.amountSuffix")}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {copyMode ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-5">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">{t("copy.title")}</p>
            <p className="text-xs text-white/50">{t("copy.description")}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              {t("copy.sourceLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {dayBuckets.map((bucket) => (
                <button
                  key={`source-${bucket.key}`}
                  type="button"
                  onClick={() => setCopySource(bucket.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                    copySource === bucket.key
                      ? "border-white/90 bg-white text-black"
                      : "border-white/15 bg-white/5 text-white/70 hover:border-white/40",
                  )}
                >
                  {bucket.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              {t("copy.targetLabel")}
            </p>
            <p className="text-[11px] text-white/50">{t("copy.helper")}</p>
            <div className="flex flex-wrap gap-2">
              {dayBuckets
                .filter((bucket) => bucket.key !== copySource)
                .map((bucket) => {
                  const isSelected = copyTargets.includes(bucket.key);
                  return (
                    <button
                      key={`target-${bucket.key}`}
                      type="button"
                      onClick={() => toggleCopyTarget(bucket.key)}
                      aria-pressed={isSelected}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                        isSelected
                          ? "border-white/90 bg-white text-black"
                          : "border-white/15 bg-white/5 text-white/70 hover:border-white/40",
                      )}
                    >
                      {bucket.label}
                    </button>
                  );
                })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => {
                setCopyMode(false);
                setCopySource(null);
                setCopyTargets([]);
              }}
              className="h-9 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 hover:bg-white/15"
            >
              {t("copy.cancel")}
            </Button>
            <Button
              type="button"
              onClick={applyCopy}
              className="h-9 rounded-full bg-white px-4 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-white/90"
            >
              {t("copy.apply")}
            </Button>
          </div>
        </div>
      ) : null}

      {statusMessage ? (
        <p
          className={cn(
            "text-xs",
            status === "success" ? "text-emerald-400" : status === "error" ? "text-rose-400" : "text-white/60",
          )}
        >
          {statusMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          <Button
            type="button"
            onClick={toggleCopyMode}
            className="h-10 rounded-full border border-white/20 bg-white/10 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 hover:bg-white/15"
          >
            {copyMode ? t("actions.copyClose") : t("actions.copy")}
          </Button>
          <Button
            type="button"
            onClick={handleRegenerate}
            disabled={isPending}
            className="h-10 rounded-full border border-white/20 bg-white/15 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && pendingAction === "auto"
              ? t("actions.regenerating")
              : t("actions.regenerate")}
          </Button>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && pendingAction === "manual" ? t("actions.saving") : t("actions.submit")}
        </Button>
      </div>
    </form>
  );
}
