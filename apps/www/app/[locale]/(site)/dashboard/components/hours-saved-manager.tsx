"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateHoursSavedScheduleAction } from "../hours-saved-actions";

import { cn } from "@/lib/utils";


type ScheduleRowState = {
  scheduledFor: Date;
  input: string;
};

type DaySlot = {
  index: number;
  slot: ScheduleRowState;
};

type DayGroup = {
  key: string;
  label: string;
  date: Date;
  slots: DaySlot[];
  isToday: boolean;
};

type HoursSavedManagerStrings = {
  baseLabel: string;
  baseHelper: string;
  scheduleHeading: string;
  scheduleDescription: string;
  dayListLabel: string;
  todayBadge: string;
  nextBadge: string;
  hoursPlannedLabel: string;
  hourDetailHeading: string;
  hourDetailTimeLabel: string;
  hourDetailAmountLabel: string;
  hourDetailHelper: string;
  hourDetailEmpty: string;
  copyButtonLabel: string;
  copyPanelTitle: string;
  copyPanelDescription: string;
  copySourceLabel: string;
  copyTargetLabel: string;
  copyApplyLabel: string;
  copyCancelLabel: string;
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

function parsePositiveInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

export function HoursSavedManager({
  locale,
  timeZone,
  baseAmount,
  schedule,
  strings,
}: HoursSavedManagerProps) {
  const initialRows = useMemo(() => sortSchedule(schedule), [schedule]);
  const [baseValue, setBaseValue] = useState(baseAmount.toString());
  const [rows, setRows] = useState<ScheduleRowState[]>(initialRows);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(initialRows.length > 0 ? 0 : -1);
  const [copyMode, setCopyMode] = useState(false);
  const [copySource, setCopySource] = useState<string | null>(null);
  const [copyTargets, setCopyTargets] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isoFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone,
      }),
    [timeZone],
  );

  const dayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone,
      }),
    [locale, timeZone],
  );

  const timeLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }),
    [locale, timeZone],
  );

  const longTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }),
    [locale, timeZone],
  );

  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    setBaseValue(baseAmount.toString());
  }, [baseAmount]);

  const dayGroups = useMemo(() => {
    const todayKey = isoFormatter.format(new Date());
    const grouped = new Map<string, DayGroup>();

    rows.forEach((row, index) => {
      const key = isoFormatter.format(row.scheduledFor);
      const existing = grouped.get(key);

      if (existing) {
        existing.slots.push({ index, slot: row });
        return;
      }

      grouped.set(key, {
        key,
        label: dayLabelFormatter.format(row.scheduledFor),
        date: new Date(row.scheduledFor),
        slots: [{ index, slot: row }],
        isToday: key === todayKey,
      });
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [dayLabelFormatter, isoFormatter, rows]);

  useEffect(() => {
    if (dayGroups.length === 0) {
      setSelectedDayIndex(0);
      setSelectedSlotIndex(-1);
      return;
    }

    if (selectedDayIndex >= dayGroups.length) {
      setSelectedDayIndex(0);
      return;
    }

    const selectedGroup = dayGroups[selectedDayIndex];
    if (!selectedGroup) {
      setSelectedSlotIndex(-1);
      return;
    }

    if (!selectedGroup.slots.some((item) => item.index === selectedSlotIndex)) {
      setSelectedSlotIndex(selectedGroup.slots[0]?.index ?? -1);
    }
  }, [dayGroups, selectedDayIndex, selectedSlotIndex]);

  useEffect(() => {
    if (!copyMode) {
      return;
    }

    const availableKeys = new Set(dayGroups.map((group) => group.key));
    const fallback = dayGroups[selectedDayIndex]?.key ?? dayGroups[0]?.key ?? null;

    if (!copySource || !availableKeys.has(copySource)) {
      if (fallback !== copySource) {
        setCopySource(fallback);
      }
      return;
    }

    setCopyTargets((current) => {
      const filtered = current.filter((key) => availableKeys.has(key) && key !== copySource);
      if (filtered.length === current.length && filtered.every((value, index) => value === current[index])) {
        return current;
      }
      return filtered;
    });
  }, [copyMode, copySource, dayGroups, selectedDayIndex]);

  const resetStatus = () => {
    setStatus("idle");
    setStatusMessage(null);
  };

  const handleBaseChange = (value: string) => {
    setBaseValue(value);
    resetStatus();
  };

  const handleSlotChange = (index: number, value: string) => {
    setRows((current) => {
      const next = [...current];
      next[index] = { ...next[index], input: value };
      return next;
    });
    resetStatus();
  };

  const handleSelectDay = (index: number) => {
    setSelectedDayIndex(index);
    const firstSlot = dayGroups[index]?.slots[0];
    if (firstSlot) {
      setSelectedSlotIndex(firstSlot.index);
    }
    resetStatus();
  };

  const handleSelectSlot = (index: number) => {
    setSelectedSlotIndex(index);
    resetStatus();
  };

  const toggleCopyMode = () => {
    if (copyMode) {
      setCopyMode(false);
      setCopyTargets([]);
      resetStatus();
      return;
    }

    const defaultSource = dayGroups[selectedDayIndex]?.key ?? dayGroups[0]?.key ?? null;
    setCopyMode(true);
    setCopySource(defaultSource);
    setCopyTargets([]);
    resetStatus();
  };

  const handleCopySourceChange = (key: string) => {
    setCopySource(key);
    setCopyTargets((current) => current.filter((target) => target !== key));
    resetStatus();
  };

  const handleCopyTargetToggle = (key: string) => {
    setCopyTargets((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      return [...current, key];
    });
    resetStatus();
  };

  const applyCopySelection = () => {
    if (!copySource) {
      return;
    }

    const sourceGroup = dayGroups.find((group) => group.key === copySource);
    const targets = dayGroups.filter((group) => copyTargets.includes(group.key));

    if (!sourceGroup || targets.length === 0) {
      return;
    }

    setRows((current) => {
      const next = [...current];
      for (const target of targets) {
        const limit = Math.min(sourceGroup.slots.length, target.slots.length);
        for (let index = 0; index < limit; index += 1) {
          const sourceValue = sourceGroup.slots[index].slot.input;
          const targetIndex = target.slots[index].index;
          next[targetIndex] = { ...next[targetIndex], input: sourceValue };
        }
      }
      return next;
    });

    setCopyMode(false);
    setCopyTargets([]);
    resetStatus();
  };

  const cancelCopySelection = () => {
    setCopyMode(false);
    setCopyTargets([]);
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
          setSelectedDayIndex(0);
          setSelectedSlotIndex(nextRows.length > 0 ? 0 : -1);
        }
      } catch (error) {
        console.error("Failed to refresh hours saved overview", error);
      }

      setCopyMode(false);
      setCopyTargets([]);
      setStatus("success");
      setStatusMessage(strings.successMessage);
    });
  };

  const selectedGroup = dayGroups[selectedDayIndex];
  const selectedSlot = selectedSlotIndex >= 0 ? rows[selectedSlotIndex] : null;
  const nextSlotIndex = selectedGroup?.slots[0]?.index ?? -1;

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
        <p className="text-xs text-white/55">{strings.baseHelper}</p>
      </div>

      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(15,15,40,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">{strings.scheduleHeading}</p>
            <p className="text-xs text-white/55">{strings.scheduleDescription}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={toggleCopyMode}
            className={cn(
              "h-9 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:bg-white/20",
              copyMode && "border-white/40 bg-white/20 text-white",
            )}
            disabled={isPending}
          >
            {strings.copyButtonLabel}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">{strings.dayListLabel}</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {dayGroups.map((group, index) => {
                const isSelected = index === selectedDayIndex;
                const plannedText = strings.hoursPlannedLabel.replace(
                  "{count}",
                  numberFormatter.format(group.slots.length),
                );
                return (
                  <Button
                    key={group.key}
                    type="button"
                    variant="ghost"
                    onClick={() => handleSelectDay(index)}
                    className={cn(
                      "min-w-[8rem] rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white",
                      isSelected && "border-white/50 bg-white/10 text-white",
                    )}
                    disabled={isPending}
                  >
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.28em] text-white/45">
                      {group.label}
                    </span>
                    <span className="mt-1 block text-xs text-white/70">{plannedText}</span>
                    {group.isToday ? (
                      <span className="mt-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
                        {strings.todayBadge}
                      </span>
                    ) : null}
                  </Button>
                );
              })}
            </div>
          </div>

          {selectedGroup ? (
            <p className="text-xs text-white/55">
              {strings.hoursPlannedLabel.replace(
                "{count}",
                numberFormatter.format(selectedGroup.slots.length),
              )}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {selectedGroup?.slots.map((item) => {
                  const slot = rows[item.index];
                  const label = timeLabelFormatter.format(slot.scheduledFor);
                  const isSelected = item.index === selectedSlotIndex;
                  const isNext = selectedGroup?.isToday && item.index === nextSlotIndex;
                  const amount = slot.input === "" ? "0" : slot.input;

                  return (
                    <button
                      key={slot.scheduledFor.toISOString()}
                      type="button"
                      onClick={() => handleSelectSlot(item.index)}
                      className={cn(
                        "group rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-white/40 hover:bg-white/10",
                        isSelected && "border-white bg-white text-black hover:border-white hover:bg-white",
                      )}
                      disabled={isPending}
                    >
                      <span
                        className={cn(
                          "font-mono text-[11px] tracking-[0.28em] text-white/60 transition group-hover:text-white",
                          isSelected && "text-black/60",
                        )}
                      >
                        {label}
                      </span>
                      <span
                        className={cn(
                          "mt-2 block text-sm font-semibold text-white transition group-hover:text-white",
                          isSelected && "text-black",
                        )}
                      >
                        {amount}
                        <span className="ml-1 text-[10px] uppercase tracking-[0.3em] text-white/45 group-hover:text-white/60">
                          {strings.amountSuffix}
                        </span>
                      </span>
                      {isNext ? (
                        <span
                          className={cn(
                            "mt-2 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70",
                            isSelected && "border-black/20 bg-black/10 text-black/70",
                          )}
                        >
                          {strings.nextBadge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm font-semibold text-white">{strings.hourDetailHeading}</p>
              {selectedSlot ? (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                      {strings.hourDetailTimeLabel}
                    </Label>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm tracking-[0.18em] text-white/70">
                      {longTimeFormatter.format(selectedSlot.scheduledFor)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                      {strings.hourDetailAmountLabel}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        value={selectedSlot.input}
                        onChange={(event) => handleSlotChange(selectedSlotIndex, event.target.value)}
                        className="h-11 flex-1 border-white/15 bg-white/5 text-right text-sm text-white focus-visible:ring-white/40"
                      />
                      <span className="text-xs uppercase tracking-[0.32em] text-white/50">{strings.amountSuffix}</span>
                    </div>
                    <p className="text-xs text-white/45">{strings.hourDetailHelper}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-white/55">{strings.hourDetailEmpty}</p>
              )}
            </div>
          </div>
        </div>

        {copyMode ? (
          <div className="space-y-4 rounded-2xl border border-white/15 bg-black/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{strings.copyPanelTitle}</p>
                <p className="text-xs text-white/55">{strings.copyPanelDescription}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={cancelCopySelection}
                className="h-8 rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/65 transition hover:bg-white/15"
              >
                {strings.copyCancelLabel}
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
                  {strings.copySourceLabel}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dayGroups.map((group) => {
                    const isActive = group.key === copySource;
                    return (
                      <Button
                        key={group.key}
                        type="button"
                        variant="ghost"
                        onClick={() => handleCopySourceChange(group.key)}
                        className={cn(
                          "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/65 transition hover:bg-white/15",
                          isActive && "border-white/40 bg-white/20 text-white",
                        )}
                      >
                        {group.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
                  {strings.copyTargetLabel}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dayGroups.map((group) => {
                    const isDisabled = group.key === copySource;
                    const isActive = copyTargets.includes(group.key);
                    return (
                      <Button
                        key={group.key}
                        type="button"
                        variant="ghost"
                        onClick={() => handleCopyTargetToggle(group.key)}
                        disabled={isDisabled}
                        className={cn(
                          "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/65 transition hover:bg-white/15 disabled:opacity-40",
                          isActive && "border-white/40 bg-white/20 text-white",
                        )}
                      >
                        {group.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={applyCopySelection}
                disabled={!copySource || copyTargets.length === 0 || isPending}
                className="h-9 rounded-full bg-white px-5 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {strings.copyApplyLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {statusMessage ? (
        <p
          className={cn(
            "text-xs",
            status === "success"
              ? "text-emerald-400"
              : status === "error"
              ? "text-rose-400"
              : "text-white/60",
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
            className="h-10 rounded-full border border-white/10 bg-white/5 px-6 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 hover:bg-white/10"
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
