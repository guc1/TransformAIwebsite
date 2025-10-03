"use client";

import type { FormEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import { updateHoursSavedScheduleAction } from "../hours-saved-actions";
import {
  HOURS_SAVED_WINDOW_HOURS,
  startOfHour,
} from "@/lib/hours-saved/constants";

type ScheduleRowState = {
  scheduledFor: Date;
  input: string;
};

type HoursSavedManagerProps = {
  locale: string;
  timeZone: string;
  baseAmount: number;
  schedule: { scheduledFor: string; amount: number }[];
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

function sortSchedule(entries: { scheduledFor: string; amount: number }[]): ScheduleRowState[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
  );

  const seenHours = new Set<string>();
  const sanitized: ScheduleRowState[] = [];

  for (const entry of sorted) {
    const scheduledFor = new Date(entry.scheduledFor);
    const hourKey = startOfHour(scheduledFor).toISOString();

    if (seenHours.has(hourKey)) {
      continue;
    }

    seenHours.add(hourKey);
    sanitized.push({
      scheduledFor,
      input: entry.amount.toString(),
    });

    if (sanitized.length === HOURS_SAVED_WINDOW_HOURS) {
      break;
    }
  }

  return sanitized;
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPart["type"]) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function HoursSavedManager({ locale, timeZone, baseAmount, schedule }: HoursSavedManagerProps) {
  const t = useTranslations("Dashboard.hoursSaved");

  const [baseValue, setBaseValue] = useState(baseAmount.toString());
  const [rows, setRows] = useState<ScheduleRowState[]>(() => sortSchedule(schedule));
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [activeHour, setActiveHour] = useState<string>("");
  const [copyMode, setCopyMode] = useState(false);
  const [copySource, setCopySource] = useState<string | null>(null);
  const [copyTargets, setCopyTargets] = useState<string[]>([]);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }),
    [locale, timeZone],
  );

  const dayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone,
      }),
    [locale, timeZone],
  );

  const dayKeyFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone,
      }),
    [timeZone],
  );

  const getHourCode = useCallback(
    (date: Date) => {
      const parts = timeFormatter.formatToParts(date);
      const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
      return hour.padStart(2, "0");
    },
    [timeFormatter],
  );

  const getRangeLabel = useCallback(
    (date: Date) => {
      const hourCode = getHourCode(date);
      const startLabel = `${hourCode}:00`;
      const endHour = (Number.parseInt(hourCode, 10) + 1) % 24;
      const endLabel = `${endHour.toString().padStart(2, "0")}:00`;
      return `${startLabel} – ${endLabel}`;
    },
    [getHourCode],
  );

  const getDayKey = useCallback(
    (date: Date) => {
      const parts = dayKeyFormatter.formatToParts(date);
      const year = getPart(parts, "year");
      const month = getPart(parts, "month");
      const day = getPart(parts, "day");
      return `${year}-${month}-${day}`;
    },
    [dayKeyFormatter],
  );

  const todayKey = useMemo(() => getDayKey(new Date()), [getDayKey]);

  const dayBuckets: DayBucket[] = useMemo(() => {
    const byDay = new Map<string, DayBucket>();

    for (const row of rows) {
      const key = getDayKey(row.scheduledFor);
      const label = dayLabelFormatter.format(row.scheduledFor);
      const bucket = byDay.get(key);

      if (bucket) {
        bucket.entries.push({
          id: row.scheduledFor.toISOString(),
          hourCode: getHourCode(row.scheduledFor),
          rangeLabel: getRangeLabel(row.scheduledFor),
          row,
        });
        continue;
      }

      byDay.set(key, {
        key,
        label,
        isToday: key === todayKey,
        entries: [
          {
            id: row.scheduledFor.toISOString(),
            hourCode: getHourCode(row.scheduledFor),
            rangeLabel: getRangeLabel(row.scheduledFor),
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
  }, [rows, getDayKey, dayLabelFormatter, getHourCode, getRangeLabel, todayKey]);

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

  const handleActiveValueChange = (value: string) => {
    if (!activeEntry) {
      return;
    }

    setRows((current) =>
      current.map((row) =>
        row.scheduledFor.toISOString() === activeEntry.id ? { ...row, input: value } : row,
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
    if (baseTrimmed === "") {
      setStatus("error");
      setStatusMessage(t("status.validation"));
      return;
    }

    const parsedBase = Number(baseTrimmed);

    if (!Number.isFinite(parsedBase) || parsedBase < 0 || !Number.isInteger(parsedBase)) {
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
        scheduledFor: row.scheduledFor.toISOString(),
        amount: parsed,
      });
    }

    startTransition(async () => {
      const result = await updateHoursSavedScheduleAction(locale, {
        baseAmount: parsedBase,
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
          setRows(sortSchedule(data.schedule));
          setBaseValue(data.baseAmount.toString());
        }
      } catch (error) {
        console.error("Failed to refresh hours saved overview", error);
      }

      setStatus("success");
      setStatusMessage(t("status.success"));
      setCopyMode(false);
      setCopySource(null);
      setCopyTargets([]);
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
        const dayKey = getDayKey(row.scheduledFor);
        if (!copyTargets.includes(dayKey)) {
          return row;
        }

        const hourCode = getHourCode(row.scheduledFor);
        const replacement = sourceValues.get(hourCode);
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          onClick={toggleCopyMode}
          className="h-10 rounded-full border border-white/20 bg-white/10 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 hover:bg-white/15"
        >
          {copyMode ? t("actions.copyClose") : t("actions.copy")}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-white/90 disabled:opacity-60"
        >
          {isPending ? t("actions.saving") : t("actions.submit")}
        </Button>
      </div>
    </form>
  );
}
