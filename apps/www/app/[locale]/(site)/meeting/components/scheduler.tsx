"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CalendarDays, CheckCircle2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { formatDateWithZone } from "@/lib/date";
import type { MeetingSlotStatus } from "@/lib/db/schema";
import {
  MEETING_TIME_ZONE,
  MEETING_TIME_ZONE_OPTIONS,
} from "@/lib/meetings/constants";
import { cn } from "@/lib/utils";

import { scheduleMeetingAction } from "../actions";
import { initialScheduleState, type ScheduleMeetingState } from "../state";

type SchedulerSlot = {
  id: string;
  startAt: string;
  endAt: string;
  status: MeetingSlotStatus;
  isPublished: boolean;
  publicDescription?: string | null;
  staffName?: string | null;
  hasBooking: boolean;
};

type SchedulerDay = {
  dateKey: string;
  date: string;
  availableSlots: number;
  totalSlots: number;
  status: "available" | "limited" | "full";
  slots: SchedulerSlot[];
};

type SchedulerProps = {
  days: SchedulerDay[];
  locale: string;
  outreachSlug?: string | null;
};

const statusDotMap: Record<SchedulerDay["status"], string> = {
  available: "bg-emerald-400",
  limited: "bg-amber-400",
  full: "bg-rose-500",
};

const statusHighlightMap: Record<SchedulerDay["status"], string> = {
  available: "shadow-[0_14px_48px_rgba(16,185,129,0.25)]",
  limited: "shadow-[0_14px_48px_rgba(251,191,36,0.25)]",
  full: "shadow-[0_14px_48px_rgba(244,63,94,0.28)]",
};

const statusKeyMap: Record<SchedulerDay["status"], string> = {
  available: "Calendar.status.available",
  limited: "Calendar.status.limited",
  full: "Calendar.status.full",
};

function formatTimeWithPeriod({
  date,
  locale,
  timeZone,
}: {
  date: Date;
  locale: string;
  timeZone: string;
}) {
  const formatted = formatDateWithZone(
    date,
    {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      hour12: false,
    },
    locale,
    timeZone,
  );
  const hourPart = Number.parseInt(formatted.split(":")[0] ?? "", 10);
  const suffix = Number.isFinite(hourPart) && hourPart >= 12 ? "pm" : "am";

  return `${formatted} ${suffix}`.trim();
}

function formatTimeRange({
  start,
  end,
  locale,
  timeZone,
}: {
  start: Date;
  end: Date;
  locale: string;
  timeZone: string;
}) {
  const startLabel = formatTimeWithPeriod({ date: start, locale, timeZone });
  const endLabel = formatTimeWithPeriod({ date: end, locale, timeZone });

  return `${startLabel} – ${endLabel}`;
}

function getTimeZoneLabel(timeZone: string, locale: string) {
  const friendlyName = timeZone.replace(/_/g, " ");

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = formatter.formatToParts(new Date());
    const zoneName = parts.find((part) => part.type === "timeZoneName")?.value;

    if (zoneName) {
      return `${friendlyName} (${zoneName})`;
    }
  } catch {
    // Unsupported time zone formatting; fall back to the friendly name only.
  }

  return friendlyName;
}

function DayButton({
  day,
  locale,
  selected,
  onSelect,
}: {
  day: SchedulerDay;
  locale: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("Meeting");
  const { weekday, month, dayNumber } = useMemo(() => {
    const date = new Date(day.date);
    return {
      weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
      month: new Intl.DateTimeFormat(locale, { month: "short" }).format(date),
      dayNumber: new Intl.DateTimeFormat(locale, { day: "numeric" }).format(date),
    };
  }, [day.date, locale]);

  const statusLabel = t(statusKeyMap[day.status] as any);
  const totalSlots = Math.max(day.totalSlots, day.availableSlots);
  const slotsLabel =
    totalSlots > 0
      ? t("Calendar.slotsCount", {
          available: day.availableSlots,
          total: totalSlots,
        })
      : t("Calendar.noSlots");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        selected
          ? cn("border-white/60 bg-white/12", statusHighlightMap[day.status])
          : "hover:border-white/35 hover:bg-white/10",
      )}
      aria-pressed={selected}
      aria-label={`${weekday} ${dayNumber} ${month}. ${statusLabel}. ${slotsLabel}`}
    >
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
        <span>{weekday}</span>
        <span>{month}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-white">{dayNumber}</span>
        <span className="inline-flex items-center gap-2">
          <span
            className={cn("h-2.5 w-2.5 rounded-full", statusDotMap[day.status])}
            aria-hidden
          />
          <span className="sr-only">{statusLabel}</span>
        </span>
      </div>
      <div className="text-[11px] leading-snug text-white/65">{slotsLabel}</div>
    </button>
  );
}

function SlotButton({
  slot,
  locale,
  timeZone,
  selected,
  disabled,
  onSelect,
}: {
  slot: SchedulerSlot;
  locale: string;
  timeZone: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const start = useMemo(() => new Date(slot.startAt), [slot.startAt]);
  const end = useMemo(() => new Date(slot.endAt), [slot.endAt]);
  const timeRange = useMemo(
    () =>
      formatTimeRange({
        start,
        end,
        locale,
        timeZone,
      }),
    [end, locale, start, timeZone],
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full rounded-2xl border border-white/15 bg-white/[0.05] p-4 text-left transition hover:border-white/40 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        selected && "border-white/70 bg-white/10",
        disabled && "cursor-not-allowed opacity-50 hover:border-white/15 hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-white">{timeRange}</span>
        {selected ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
        ) : null}
      </div>
      <div className="mt-2 flex flex-col gap-2 text-xs text-white/60">
        {slot.staffName ? (
          <span className="inline-flex items-center gap-2">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {slot.staffName}
          </span>
        ) : null}
        {slot.publicDescription ? <p>{slot.publicDescription}</p> : null}
      </div>
    </button>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Meeting");

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || disabled}
    >
      {pending ? t("Form.submitPending") : t("Form.submit")}
    </button>
  );
}

function TakenSlot({
  slot,
  locale,
  timeZone,
}: {
  slot: SchedulerSlot;
  locale: string;
  timeZone: string;
}) {
  const t = useTranslations("Meeting");
  const start = useMemo(() => new Date(slot.startAt), [slot.startAt]);
  const end = useMemo(() => new Date(slot.endAt), [slot.endAt]);
  const timeRange = useMemo(
    () =>
      formatTimeRange({
        start,
        end,
        locale,
        timeZone,
      }),
    [end, locale, start, timeZone],
  );

  return (
    <div className="rounded-2xl border border-rose-500/45 bg-rose-500/10 p-4 text-sm text-rose-100">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{timeRange}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
          {t("Slots.takenBadge")}
        </span>
      </div>
      <div className="mt-2 space-y-1 text-xs text-rose-100/85">
        {slot.staffName ? (
          <p className="inline-flex items-center gap-2">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {slot.staffName}
          </p>
        ) : null}
        {slot.publicDescription ? <p>{slot.publicDescription}</p> : null}
      </div>
    </div>
  );
}

export function MeetingScheduler({ days, locale, outreachSlug }: SchedulerProps) {
  const t = useTranslations("Meeting");
  const router = useRouter();
  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const firstWithAvailability = days.find((day) => day.availableSlots > 0);
    return (firstWithAvailability ?? days[0])?.dateKey ?? "";
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState(MEETING_TIME_ZONE);
  const [state, formAction] = useFormState<ScheduleMeetingState, FormData>(
    scheduleMeetingAction,
    initialScheduleState,
  );

  useEffect(() => {
    if (state.status === "success") {
      setSelectedSlotId(null);
      router.refresh();
    }
  }, [router, state.status]);

  const selectedDay = useMemo(
    () => days.find((day) => day.dateKey === selectedDayKey),
    [days, selectedDayKey],
  );

  useEffect(() => {
    if (!selectedDay && days.length > 0) {
      setSelectedDayKey(days[0]?.dateKey ?? "");
    }
  }, [days, selectedDay]);

  const availableSlots = useMemo(() => {
    if (!selectedDay) {
      return [];
    }

    return selectedDay.slots.filter(
      (slot) => slot.status === "available" && !slot.hasBooking && slot.isPublished,
    );
  }, [selectedDay]);

  const takenSlots = useMemo(() => {
    if (!selectedDay) {
      return [];
    }

    return selectedDay.slots.filter(
      (slot) =>
        slot.isPublished && (slot.status !== "available" || slot.hasBooking),
    );
  }, [selectedDay]);

  const timezoneOptions = useMemo(
    () =>
      Array.from(new Set(MEETING_TIME_ZONE_OPTIONS)).map((timeZone) => ({
        value: timeZone,
        label: getTimeZoneLabel(timeZone, locale),
      })),
    [locale],
  );

  const successMessage = useMemo(() => {
    if (state.status !== "success" || !state.slot) {
      return null;
    }
    const start = new Date(state.slot.startAt);
    const dateLabel = formatDateWithZone(
      start,
      {
        weekday: "long",
        month: "long",
        day: "numeric",
      },
      locale,
      selectedTimeZone,
    );
    const timeLabel = formatTimeWithPeriod({
      date: start,
      locale,
      timeZone: selectedTimeZone,
    });
    return t("Form.success.message", {
      date: `${dateLabel} ${timeLabel}`,
    });
  }, [locale, selectedTimeZone, state, t]);

  const isSlotSelected = Boolean(selectedSlotId);

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 shadow-[0_32px_120px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-3 text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">{t("Calendar.heading")}</h2>
            <p className="text-sm text-white/70">{t("Calendar.caption")}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day) => (
            <DayButton
              key={day.dateKey}
              day={day}
              locale={locale}
              selected={day.dateKey === selectedDayKey}
              onSelect={() => {
                setSelectedDayKey(day.dateKey);
                setSelectedSlotId(null);
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,420px)]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_32px_120px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {t("Slots.badge")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {t("Slots.heading", {
                  day: selectedDay
                    ? formatDateWithZone(
                        new Date(selectedDay.date),
                        { weekday: "long", month: "long", day: "numeric" },
                        locale,
                        selectedTimeZone,
                      )
                    : "",
                })}
              </h2>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-60">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {t("Slots.timeZoneLabel")}
              </label>
              <select
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white shadow-[0_10px_40px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                value={selectedTimeZone}
                onChange={(event) => {
                  setSelectedTimeZone(event.target.value);
                }}
              >
                {timezoneOptions.map((option) => (
                  <option className="bg-slate-900" key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] leading-relaxed text-white/55">
                {t("Slots.timeZoneHelper")}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {availableSlots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                {t("Slots.empty")}
              </div>
            ) : (
              availableSlots.map((slot) => (
                <SlotButton
                  key={slot.id}
                  slot={slot}
                  locale={locale}
                  timeZone={selectedTimeZone}
                  selected={slot.id === selectedSlotId}
                  disabled={false}
                  onSelect={() => setSelectedSlotId(slot.id)}
                />
              ))
            )}
          </div>
          {takenSlots.length > 0 ? (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                {t("Slots.takenHeading")}
              </p>
              <div className="grid gap-3">
                {takenSlots.map((slot) => (
                  <TakenSlot
                    key={`taken-${slot.id}`}
                    slot={slot}
                    locale={locale}
                    timeZone={selectedTimeZone}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {state.errors?.slotId ? (
            <p className="text-xs font-medium text-rose-200">{t("Slots.selectError")}</p>
          ) : null}
        </div>

        <form
          action={formAction}
          className={cn(
            "rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_32px_120px_rgba(15,23,42,0.45)] transition-all duration-300",
            isSlotSelected &&
              "border-emerald-400/60 bg-emerald-500/10 shadow-[0_32px_140px_rgba(16,185,129,0.35)] ring-1 ring-emerald-300/40 ring-offset-0",
          )}
        >
          <input type="hidden" name="slotId" value={selectedSlotId ?? ""} />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="outreachSlug" value={outreachSlug ?? ""} />

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white">{t("Form.heading")}</h3>
              <p className="mt-1 text-sm text-white/70">{t("Form.caption")}</p>
            </div>

            {outreachSlug ? (
              <div className="rounded-2xl border border-sky-400/40 bg-sky-500/10 p-4 text-xs text-sky-100 sm:text-sm">
                <p className="font-medium tracking-wide uppercase text-sky-100/80">
                  {t("Form.outreachTracking.title")}
                </p>
                <p className="mt-1 text-sky-100/80">
                  {t("Form.outreachTracking.body", {
                    slug: outreachSlug,
                  })}
                </p>
              </div>
            ) : null}

            {state.status === "success" && successMessage ? (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-semibold">{t("Form.success.title")}</p>
                <p className="mt-1 text-emerald-100/90">{successMessage}</p>
              </div>
            ) : null}

            {state.status === "error" && state.message ? (
              <div className="rounded-2xl border border-rose-400/50 bg-rose-500/10 p-4 text-sm text-rose-100">
                <p>{t(state.message as any)}</p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={t("Form.fields.reason.label")}
                name="reason"
                placeholder={t("Form.fields.reason.placeholder")}
                error={state.errors?.reason?.[0]}
                required
              />
              <Field
                label={t("Form.fields.company.label")}
                name="company"
                placeholder={t("Form.fields.company.placeholder")}
                error={state.errors?.company?.[0]}
              />
              <Field
                label={t("Form.fields.personName.label")}
                name="personName"
                placeholder={t("Form.fields.personName.placeholder")}
                error={state.errors?.personName?.[0]}
                required
              />
              <Field
                label={t("Form.fields.email.label")}
                name="email"
                type="email"
                placeholder={t("Form.fields.email.placeholder")}
                error={state.errors?.email?.[0]}
                required
              />
            </div>

            <Field
              label={t("Form.fields.description.label")}
              name="description"
              as="textarea"
              placeholder={t("Form.fields.description.placeholder")}
              error={state.errors?.description?.[0]}
              required
              rows={4}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SubmitButton disabled={!selectedSlotId} />
              <p className="text-xs text-white/60">{t("Form.privacy")}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
};

function Field({
  label,
  name,
  placeholder,
  error,
  required,
  type = "text",
  as = "input",
  rows = 3,
}: FieldProps) {
  const id = `${name}-field`;
  const Element = as === "textarea" ? "textarea" : "input";
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60"
      >
        {label}
        {required ? <span className="ml-1 text-white/40">*</span> : null}
      </label>
      <Element
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          error && "border-rose-400/60 text-white",
        )}
        {...(as === "textarea"
          ? {
              rows,
            }
          : {
              type,
            })}
      />
      {error ? <p className="text-xs font-medium text-rose-200">{error}</p> : null}
    </div>
  );
}
