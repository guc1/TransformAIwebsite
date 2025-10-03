"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HOURS_SAVED_DEFAULT_DAY_INCREMENT,
  HOURS_SAVED_DEFAULT_NIGHT_INCREMENT,
  HOURS_SAVED_WINDOW_HOURS,
  addHours,
  getDefaultIncrementFor,
  isDaytimeInZone,
  nextHour,
} from "@/lib/hours-saved/constants";
import { cn } from "@/lib/utils";

import { updateHoursSavedScheduleAction } from "../hours-saved-actions";

type ScheduleRowState = {
  scheduledFor: Date;
  input: string;
};

type HoursSavedManagerStrings = {
  baseLabel: string;
  baseHelper: string;
  quickHeading: string;
  quickDescription: string;
  dayLabel: string;
  nightLabel: string;
  varianceLabel: string;
  varianceHelper: string;
  applyDefaultsLabel: string;
  randomizeLabel: string;
  manualHeading: string;
  manualDescription: string;
  resetLabel: string;
  submitLabel: string;
  savingLabel: string;
  cancelLabel: string;
  successMessage: string;
  errorMessage: string;
  validationError: string;
  amountSuffix: string;
};

type HoursSavedManagerProps = {
  locale: string;
  timeZone: string;
  baseAmount: number;
  schedule: { scheduledFor: string; amount: number }[];
  strings: HoursSavedManagerStrings;
};

function sortSchedule(entries: { scheduledFor: string; amount: number }[]): ScheduleRowState[] {
  return [...entries]
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .map((entry) => ({
      scheduledFor: new Date(entry.scheduledFor),
      input: entry.amount.toString(),
    }));
}

function calculateDefaultAmount(rows: ScheduleRowState[], predicate: (row: ScheduleRowState) => boolean, fallback: number) {
  const candidates = rows
    .filter(predicate)
    .map((row) => Number.parseInt(row.input, 10))
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (candidates.length === 0) {
    return fallback;
  }

  const total = candidates.reduce((sum, value) => sum + value, 0);
  return Math.round(total / candidates.length);
}

function parsePositiveInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function HoursSavedManager({ locale, timeZone, baseAmount, schedule, strings }: HoursSavedManagerProps) {
  const initialRows = useMemo(() => sortSchedule(schedule), [schedule]);
  const [baseValue, setBaseValue] = useState(baseAmount.toString());
  const [rows, setRows] = useState<ScheduleRowState[]>(initialRows);
  const [dayDefault, setDayDefault] = useState(() =>
    calculateDefaultAmount(
      initialRows,
      (row) => isDaytimeInZone(row.scheduledFor),
      HOURS_SAVED_DEFAULT_DAY_INCREMENT,
    ).toString(),
  );
  const [nightDefault, setNightDefault] = useState(() =>
    calculateDefaultAmount(
      initialRows,
      (row) => !isDaytimeInZone(row.scheduledFor),
      HOURS_SAVED_DEFAULT_NIGHT_INCREMENT,
    ).toString(),
  );
  const [variance, setVariance] = useState("12");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }),
    [locale, timeZone],
  );

  useEffect(() => {
    setRows(initialRows);
    setDayDefault(
      calculateDefaultAmount(
        initialRows,
        (row) => isDaytimeInZone(row.scheduledFor),
        HOURS_SAVED_DEFAULT_DAY_INCREMENT,
      ).toString(),
    );
    setNightDefault(
      calculateDefaultAmount(
        initialRows,
        (row) => !isDaytimeInZone(row.scheduledFor),
        HOURS_SAVED_DEFAULT_NIGHT_INCREMENT,
      ).toString(),
    );
  }, [initialRows]);

  useEffect(() => {
    setBaseValue(baseAmount.toString());
  }, [baseAmount]);

  const resetStatus = () => {
    setStatus("idle");
    setStatusMessage(null);
  };

  const handleBaseChange = (value: string) => {
    setBaseValue(value);
    resetStatus();
  };

  const handleRowChange = (index: number, value: string) => {
    setRows((current) => {
      const next = [...current];
      next[index] = { ...next[index], input: value };
      return next;
    });
    resetStatus();
  };

  const handleDayDefaultChange = (value: string) => {
    setDayDefault(value);
    resetStatus();
  };

  const handleNightDefaultChange = (value: string) => {
    setNightDefault(value);
    resetStatus();
  };

  const handleVarianceChange = (value: string) => {
    setVariance(value);
    resetStatus();
  };

  const applyDefaultsToSchedule = () => {
    const dayValue = parsePositiveInteger(dayDefault, HOURS_SAVED_DEFAULT_DAY_INCREMENT);
    const nightValue = parsePositiveInteger(nightDefault, HOURS_SAVED_DEFAULT_NIGHT_INCREMENT);

    setRows((current) =>
      current.map((row) => {
        const amount = isDaytimeInZone(row.scheduledFor) ? dayValue : nightValue;
        return { ...row, input: amount.toString() };
      }),
    );
    resetStatus();
  };

  const randomizeSchedule = () => {
    const dayValue = parsePositiveInteger(dayDefault, HOURS_SAVED_DEFAULT_DAY_INCREMENT);
    const nightValue = parsePositiveInteger(nightDefault, HOURS_SAVED_DEFAULT_NIGHT_INCREMENT);
    const varianceValue = clamp(parsePositiveInteger(variance, 0), 0, 100) / 100;

    setRows((current) =>
      current.map((row) => {
        const baseAmount = isDaytimeInZone(row.scheduledFor) ? dayValue : nightValue;
        if (baseAmount <= 0 || varianceValue === 0) {
          return { ...row, input: Math.max(0, baseAmount).toString() };
        }

        const jitter = Math.random() * 2 - 1; // -1..1
        const multiplier = 1 + jitter * varianceValue;
        const randomized = Math.max(0, Math.round(baseAmount * multiplier));

        return { ...row, input: randomized.toString() };
      }),
    );
    resetStatus();
  };

  const resetToDefaults = () => {
    const reference = new Date();
    const windowStart = nextHour(reference);

    const defaults: ScheduleRowState[] = Array.from({ length: HOURS_SAVED_WINDOW_HOURS }, (_, index) => {
      const scheduledFor = addHours(windowStart, index);
      return {
        scheduledFor,
        input: getDefaultIncrementFor(scheduledFor).toString(),
      };
    });

    setRows(defaults);
    setDayDefault(HOURS_SAVED_DEFAULT_DAY_INCREMENT.toString());
    setNightDefault(HOURS_SAVED_DEFAULT_NIGHT_INCREMENT.toString());
    setVariance("12");
    resetStatus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();

    const parsedBase = Number.parseInt(baseValue, 10);

    if (Number.isNaN(parsedBase) || parsedBase < 0) {
      setStatus("error");
      setStatusMessage(strings.validationError);
      return;
    }

    const schedulePayload = rows.map((row) => ({
      scheduledFor: row.scheduledFor.toISOString(),
      amount: parsePositiveInteger(row.input, 0),
    }));

    startTransition(async () => {
      const result = await updateHoursSavedScheduleAction(locale, {
        baseAmount: parsedBase,
        schedule: schedulePayload,
      });

      if (!result.success) {
        setStatus("error");
        setStatusMessage(result.error === "validation" ? strings.validationError : strings.errorMessage);
        return;
      }

      try {
        const response = await fetch("/api/hours-saved", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const nextRows = sortSchedule(data.schedule);
          setRows(nextRows);
          setBaseValue(data.baseAmount.toString());
          setDayDefault(
            calculateDefaultAmount(
              nextRows,
              (row) => isDaytimeInZone(row.scheduledFor),
              HOURS_SAVED_DEFAULT_DAY_INCREMENT,
            ).toString(),
          );
          setNightDefault(
            calculateDefaultAmount(
              nextRows,
              (row) => !isDaytimeInZone(row.scheduledFor),
              HOURS_SAVED_DEFAULT_NIGHT_INCREMENT,
            ).toString(),
          );
        }
      } catch (error) {
        console.error("Failed to refresh hours saved overview", error);
      }

      setStatus("success");
      setStatusMessage(strings.successMessage);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white/80">{strings.baseLabel}</Label>
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={baseValue}
          min={0}
          onChange={(event) => handleBaseChange(event.target.value)}
          className="border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40"
        />
        <p className="text-xs text-white/50">{strings.baseHelper}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(15,15,40,0.25)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{strings.quickHeading}</p>
            <p className="text-xs text-white/55">{strings.quickDescription}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={resetToDefaults}
            className="h-9 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/20"
          >
            {strings.resetLabel}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{strings.dayLabel}</Label>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              value={dayDefault}
              onChange={(event) => handleDayDefaultChange(event.target.value)}
              className="border-white/15 bg-black/50 text-white focus-visible:ring-white/40"
            />
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/35">{strings.amountSuffix}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{strings.nightLabel}</Label>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              value={nightDefault}
              onChange={(event) => handleNightDefaultChange(event.target.value)}
              className="border-white/15 bg-black/50 text-white focus-visible:ring-white/40"
            />
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/35">{strings.amountSuffix}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{strings.varianceLabel}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                max={100}
                value={variance}
                onChange={(event) => handleVarianceChange(event.target.value)}
                className="border-white/15 bg-black/50 text-white focus-visible:ring-white/40"
              />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">%</span>
            </div>
            <p className="text-[11px] text-white/45">{strings.varianceHelper}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={applyDefaultsToSchedule}
            className="h-10 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-white/90"
          >
            {strings.applyDefaultsLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={randomizeSchedule}
            className="h-10 rounded-full border-white/20 bg-black/40 px-6 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-white/10"
          >
            {strings.randomizeLabel}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">{strings.manualHeading}</p>
          <p className="text-xs text-white/55">{strings.manualDescription}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <ScrollArea className="max-h-[26rem]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row, index) => {
                const label = timeFormatter.format(row.scheduledFor);
                const dayPeriod = isDaytimeInZone(row.scheduledFor);

                return (
                  <div
                    key={row.scheduledFor.toISOString()}
                    className="rounded-xl border border-white/10 bg-black/40 p-4 transition hover:border-white/20"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">
                      <span className="font-mono text-[10px] tracking-[0.4em] text-white/60 sm:text-[11px]">{label}</span>
                      <span className={cn("text-[10px]", dayPeriod ? "text-emerald-300/80" : "text-sky-300/80")}>
                        {dayPeriod ? strings.dayLabel : strings.nightLabel}
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        value={row.input}
                        onChange={(event) => handleRowChange(index, event.target.value)}
                        className="h-10 w-full border-white/15 bg-black/70 text-right text-sm text-white focus-visible:ring-white/40"
                      />
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">{strings.amountSuffix}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

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

      <DialogFooter className="gap-2 sm:gap-3">
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-full border border-white/10 bg-white/5 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:bg-white/10"
            disabled={isPending}
          >
            {strings.cancelLabel}
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="h-10 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-white/90"
          disabled={isPending}
        >
          {isPending ? strings.savingLabel : strings.submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
