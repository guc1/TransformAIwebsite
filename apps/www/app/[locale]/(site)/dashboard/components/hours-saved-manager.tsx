"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HOURS_SAVED_WINDOW_HOURS,
  addHours,
  getDefaultIncrementFor,
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
  scheduleHeading: string;
  scheduleDescription: string;
  timeColumnLabel: string;
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

export function HoursSavedManager({ locale, timeZone, baseAmount, schedule, strings }: HoursSavedManagerProps) {
  const [baseValue, setBaseValue] = useState(baseAmount.toString());
  const [rows, setRows] = useState<ScheduleRowState[]>(() => sortSchedule(schedule));
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

  const handleBaseChange = (value: string) => {
    setBaseValue(value);
    setStatus("idle");
    setStatusMessage(null);
  };

  const handleRowChange = (index: number, value: string) => {
    setRows((current) => {
      const next = [...current];
      next[index] = { ...next[index], input: value };
      return next;
    });
    setStatus("idle");
    setStatusMessage(null);
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
    setStatus("idle");
    setStatusMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setStatusMessage(null);

    const parsedBase = Number.parseInt(baseValue, 10);

    if (Number.isNaN(parsedBase) || parsedBase < 0) {
      setStatus("error");
      setStatusMessage(strings.validationError);
      return;
    }

    const schedulePayload = rows.map((row) => {
      const parsed = Number.parseInt(row.input, 10);
      return {
        scheduledFor: row.scheduledFor.toISOString(),
        amount: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed,
      };
    });

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
          setRows(sortSchedule(data.schedule));
          setBaseValue(data.baseAmount.toString());
        }
      } catch (error) {
        console.error("Failed to refresh hours saved overview", error);
      }

      setStatus("success");
      setStatusMessage(strings.successMessage);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">{strings.scheduleHeading}</p>
            <p className="text-xs text-white/50">{strings.scheduleDescription}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={resetToDefaults}
            className="h-9 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:bg-white/10"
          >
            {strings.resetLabel}
          </Button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <span>{strings.timeColumnLabel}</span>
            <span className="text-right">{strings.amountSuffix}</span>
          </div>
          <ScrollArea className="max-h-72">
            <div className="divide-y divide-white/5">
              {rows.map((row, index) => {
                const label = timeFormatter.format(row.scheduledFor);
                return (
                  <div
                    key={row.scheduledFor.toISOString()}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 text-sm text-white/80"
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/60 sm:text-sm">
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        value={row.input}
                        onChange={(event) => handleRowChange(index, event.target.value)}
                        className="h-9 w-24 border-white/15 bg-black/60 text-right text-sm text-white focus-visible:ring-white/40"
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
