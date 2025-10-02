"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { formatDateWithZone } from "@/lib/date";
import type { MeetingSlotStatus } from "@/lib/db/schema";
import { MEETING_TIME_ZONE } from "@/lib/meetings/constants";
import { cn } from "@/lib/utils";

import {
  initialScheduleState,
  scheduleMeetingAction,
  type ScheduleMeetingState,
} from "../actions";

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
};

const statusStyles: Record<SchedulerDay["status"], string> = {
  available:
    "border-emerald-400/70 bg-emerald-500/10 text-emerald-200 shadow-[0_18px_60px_rgba(16,185,129,0.18)]",
  limited:
    "border-amber-400/70 bg-amber-500/10 text-amber-200 shadow-[0_18px_60px_rgba(251,191,36,0.18)]",
  full:
    "border-rose-500/70 bg-rose-500/10 text-rose-200/80 shadow-[0_18px_60px_rgba(244,63,94,0.18)]",
};

const statusKeyMap: Record<SchedulerDay["status"], string> = {
  available: "Meeting.Calendar.status.available",
  limited: "Meeting.Calendar.status.limited",
  full: "Meeting.Calendar.status.full",
};

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
  const label = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date(day.date)),
    [day.date, locale],
  );

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
        "group flex w-full flex-col gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        statusStyles[day.status],
        selected && "ring-2 ring-white/70",
        !selected && "hover:border-white/70 hover:bg-white/10",
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          {label}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/70">
        <Clock className="h-4 w-4" aria-hidden />
        <span>{slotsLabel}</span>
      </div>
    </button>
  );
}

function SlotButton({
  slot,
  locale,
  selected,
  disabled,
  onSelect,
}: {
  slot: SchedulerSlot;
  locale: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const start = useMemo(() => new Date(slot.startAt), [slot.startAt]);
  const end = useMemo(() => new Date(slot.endAt), [slot.endAt]);
  const timeRange = useMemo(
    () =>
      `${formatDateWithZone(start, { hour: "2-digit", minute: "2-digit" }, locale, MEETING_TIME_ZONE)} – ${formatDateWithZone(end, { hour: "2-digit", minute: "2-digit" }, locale, MEETING_TIME_ZONE)}`,
    [end, locale, start],
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

export function MeetingScheduler({ days, locale }: SchedulerProps) {
  const t = useTranslations("Meeting");
  const router = useRouter();
  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const firstWithAvailability = days.find((day) => day.availableSlots > 0);
    return (firstWithAvailability ?? days[0])?.dateKey ?? "";
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
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

  const successMessage = useMemo(() => {
    if (state.status !== "success" || !state.slot) {
      return null;
    }
    const start = new Date(state.slot.startAt);
    return t("Form.success.message", {
      date: formatDateWithZone(
        start,
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
        locale,
        MEETING_TIME_ZONE,
      ),
    });
  }, [locale, state, t]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_32px_120px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-3 text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t("Calendar.heading")}
              </h2>
              <p className="text-sm text-white/70">{t("Calendar.caption")}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
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
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_32px_120px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                        MEETING_TIME_ZONE,
                      )
                    : "",
                })}
              </h2>
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
                  selected={slot.id === selectedSlotId}
                  disabled={false}
                  onSelect={() => setSelectedSlotId(slot.id)}
                />
              ))
            )}
          </div>
          {state.errors?.slotId ? (
            <p className="text-xs font-medium text-rose-200">
              {t("Slots.selectError")}
            </p>
          ) : null}
        </div>

        <form
          action={formAction}
          className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_32px_120px_rgba(15,23,42,0.45)]"
        >
          <input type="hidden" name="slotId" value={selectedSlotId ?? ""} />
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white">{t("Form.heading")}</h3>
              <p className="mt-1 text-sm text-white/70">{t("Form.caption")}</p>
            </div>

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
              <p className="text-xs text-white/60">
                {t("Form.privacy")}
              </p>
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
