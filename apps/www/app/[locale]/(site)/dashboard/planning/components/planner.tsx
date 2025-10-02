"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Building2,
  CalendarDays,
  Loader2,
  Mail,
  MessageSquare,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import type { MeetingSlotStatus } from "@/lib/db/schema";
import { formatDateWithZone } from "@/lib/date";
import {
  MEETING_SLOT_INCREMENT_MINUTES,
  MEETING_TIME_ZONE,
} from "@/lib/meetings/constants";
import {
  getMeetingDateKey,
  getMeetingDayLengthMinutes,
  getMeetingMinutesFromIso,
  meetingMinutesToIso,
} from "@/lib/meetings/utils";

import { cn } from "@/lib/utils";

import {
  createSlotAction,
  deleteSlotAction,
  updateSlotAction,
  type SerializedMeetingSlot,
} from "../actions";

const PIXELS_PER_MINUTE = 1.2;
const SNAP_MINUTES = MEETING_SLOT_INCREMENT_MINUTES;

const slotColorMap: Record<MeetingSlotStatus, string> = {
  available: "bg-emerald-500/20 border-emerald-400/70",
  booked: "bg-rose-500/25 border-rose-400/70",
  unavailable: "bg-slate-500/20 border-slate-400/60",
};

const dayStatusDotMap: Record<PlannerDay["status"], string> = {
  available: "bg-emerald-400",
  limited: "bg-amber-400",
  full: "bg-rose-500",
};

const dayStatusHighlightMap: Record<PlannerDay["status"], string> = {
  available: "shadow-[0_14px_48px_rgba(16,185,129,0.25)]",
  limited: "shadow-[0_14px_48px_rgba(251,191,36,0.25)]",
  full: "shadow-[0_14px_48px_rgba(244,63,94,0.28)]",
};

type PlannerSlot = SerializedMeetingSlot & {
  assignedStaffId?: string | null;
};

type PlannerDay = {
  dateKey: string;
  date: string;
  availableSlots: number;
  totalSlots: number;
  status: "available" | "limited" | "full";
  slots: PlannerSlot[];
};

type StaffMember = {
  id: string;
  name: string;
  email: string | null;
};

type StaffPlannerProps = {
  days: PlannerDay[];
  staff: StaffMember[];
  locale: string;
};

type DraftRange = {
  dayKey: string;
  startMinutes: number;
  endMinutes: number;
};

type ResizeDraft = DraftRange & {
  slotId: string;
};

type FormState = {
  assignedStaffId: string;
  customStaffName: string;
  publicDescription: string;
  status: MeetingSlotStatus;
  isPublished: boolean;
};

function clampMinutes(value: number, dayLength: number): number {
  return Math.min(Math.max(value, 0), dayLength);
}

function snapMinutes(value: number, dayLength: number): number {
  const snapped = Math.round(value / SNAP_MINUTES) * SNAP_MINUTES;
  return clampMinutes(snapped, dayLength);
}

export function StaffPlanner({ days, staff, locale }: StaffPlannerProps) {
  const t = useTranslations("Planning");
  const router = useRouter();
  const [selectedDayKey, setSelectedDayKey] = useState(
    () => days.find((day) => day.status !== "full")?.dateKey ?? days[0]?.dateKey ?? "",
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftRange | null>(null);
  const [resizeDraft, setResizeDraft] = useState<ResizeDraft | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDay = useMemo(
    () => days.find((day) => day.dateKey === selectedDayKey) ?? days[0] ?? null,
    [days, selectedDayKey],
  );

  const dayLength = useMemo(
    () =>
      selectedDay
        ? getMeetingDayLengthMinutes(selectedDay.dateKey)
        : 24 * 60,
    [selectedDay],
  );

  const hourLabels = useMemo(() => {
    const count = Math.floor(dayLength / 60) + 1;
    return Array.from({ length: count }, (_, index) => index);
  }, [dayLength]);

  const selectedSlot = useMemo(() => {
    if (!selectedDay || !selectedSlotId) {
      return null;
    }
    return selectedDay.slots.find((slot) => slot.id === selectedSlotId) ?? null;
  }, [selectedDay, selectedSlotId]);

  useEffect(() => {
    if (!selectedDay && days.length > 0) {
      setSelectedDayKey(days[0].dateKey);
    }
  }, [days, selectedDay]);

  useEffect(() => {
    if (!selectedSlot) {
      setFormState(null);
      return;
    }

    setFormState({
      assignedStaffId: selectedSlot.assignedStaffId ?? "",
      customStaffName: selectedSlot.assignedStaffName ?? "",
      publicDescription: selectedSlot.publicDescription ?? "",
      status: selectedSlot.status,
      isPublished: selectedSlot.isPublished,
    });
  }, [selectedSlot]);

  const handleBackgroundPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!selectedDay || isPending || event.button !== 0) {
        return;
      }
      if (event.currentTarget !== event.target) {
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const maxStart = Math.max(0, dayLength - SNAP_MINUTES);
      const anchorRaw = positionToMinutes(event.clientY, container, dayLength);
      const anchorSnapped = snapMinutes(anchorRaw, dayLength);
      const initialStart = Math.min(anchorSnapped, maxStart);
      const initialEnd = clampMinutes(initialStart + SNAP_MINUTES, dayLength);
      setDraft({
        dayKey: selectedDay.dateKey,
        startMinutes: initialStart,
        endMinutes: initialEnd,
      });
      container.setPointerCapture(event.pointerId);

      const handleMove = (moveEvent: PointerEvent) => {
        const nextRaw = positionToMinutes(
          moveEvent.clientY,
          container,
          dayLength,
        );
        const nextSnapped = snapMinutes(nextRaw, dayLength);
        const startCandidate = Math.min(initialStart, nextSnapped);
        const endCandidate = Math.max(initialStart, nextSnapped);
        const safeStart = Math.min(startCandidate, maxStart);
        const safeEnd = clampMinutes(
          Math.max(endCandidate, safeStart + SNAP_MINUTES),
          dayLength,
        );
        setDraft({
          dayKey: selectedDay.dateKey,
          startMinutes: safeStart,
          endMinutes: safeEnd,
        });
      };

      const finalize = (finalEvent: PointerEvent) => {
        container.releasePointerCapture(event.pointerId);
        container.removeEventListener("pointermove", handleMove);
        container.removeEventListener("pointerup", finalize);
        container.removeEventListener("pointercancel", finalize);

        const nextRaw = positionToMinutes(
          finalEvent.clientY,
          container,
          dayLength,
        );
        const nextSnapped = snapMinutes(nextRaw, dayLength);
        const startCandidate = Math.min(initialStart, nextSnapped);
        const endCandidate = Math.max(initialStart, nextSnapped);
        const safeStart = Math.min(startCandidate, maxStart);
        const safeEnd = clampMinutes(
          Math.max(endCandidate, safeStart + SNAP_MINUTES),
          dayLength,
        );
        setDraft(null);

        startTransition(async () => {
          setActionError(null);
          const response = await createSlotAction(locale, {
            startAt: meetingMinutesToIso(selectedDay.dateKey, safeStart),
            endAt: meetingMinutesToIso(selectedDay.dateKey, safeEnd),
            status: "available",
            isPublished: true,
          });
          if (!response.success) {
            setActionError("form.error");
          } else {
            setSelectedSlotId(response.slot?.id ?? null);
          }
          router.refresh();
        });
      };

      container.addEventListener("pointermove", handleMove);
      container.addEventListener("pointerup", finalize);
      container.addEventListener("pointercancel", finalize);
    },
    [dayLength, isPending, locale, router, selectedDay],
  );

  const beginResize = useCallback(
    (
      slot: PlannerSlot,
      handle: "start" | "end",
      event: React.PointerEvent<HTMLDivElement>,
    ) => {
      if (isPending || slot.hasBooking) {
        return;
      }
      event.stopPropagation();
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const startMinutes = getMeetingMinutesFromIso(slot.startAt);
      const endMinutes = getMeetingMinutesFromIso(slot.endAt);
      const draftState: ResizeDraft = {
        dayKey: getMeetingDateKey(new Date(slot.startAt)),
        slotId: slot.id,
        startMinutes,
        endMinutes,
      };
      setResizeDraft(draftState);
      container.setPointerCapture(event.pointerId);

      const handleMove = (moveEvent: PointerEvent) => {
        setResizeDraft((current) => {
          if (!current) {
            return current;
          }
          const dayLimit = getMeetingDayLengthMinutes(current.dayKey);
          const minutePosition = snapMinutes(
            positionToMinutes(moveEvent.clientY, container, dayLimit),
            dayLimit,
          );
          if (handle === "start") {
            const maxStart = Math.max(0, dayLimit - SNAP_MINUTES);
            const nextStart = Math.min(
              minutePosition,
              current.endMinutes - SNAP_MINUTES,
            );
            return {
              ...current,
              startMinutes: Math.max(0, Math.min(nextStart, maxStart)),
            };
          }
          const nextEnd = Math.max(
            minutePosition,
            current.startMinutes + SNAP_MINUTES,
          );
          return {
            ...current,
            endMinutes: clampMinutes(nextEnd, dayLimit),
          };
        });
      };

      const finalize = () => {
        container.releasePointerCapture(event.pointerId);
        container.removeEventListener("pointermove", handleMove);
        container.removeEventListener("pointerup", finalize);
        container.removeEventListener("pointercancel", finalize);

        setResizeDraft((current) => {
          if (!current) {
            return null;
          }
          const dayLimit = getMeetingDayLengthMinutes(current.dayKey);
          const maxStart = Math.max(0, dayLimit - SNAP_MINUTES);
          const nextStart = Math.min(
            current.startMinutes,
            current.endMinutes - SNAP_MINUTES,
          );
          const safeStart = Math.max(0, Math.min(nextStart, maxStart));
          const nextEnd = Math.max(current.endMinutes, safeStart + SNAP_MINUTES);
          const safeEnd = clampMinutes(nextEnd, dayLimit);
          startTransition(async () => {
            setActionError(null);
            const response = await updateSlotAction(locale, {
              slotId: current.slotId,
              startAt: meetingMinutesToIso(current.dayKey, safeStart),
              endAt: meetingMinutesToIso(current.dayKey, safeEnd),
              status: slot.status,
              publicDescription: slot.publicDescription ?? undefined,
              assignedStaffId: slot.assignedStaffId ?? undefined,
              assignedStaffName: slot.assignedStaffName ?? undefined,
              isPublished: slot.isPublished,
            });
            if (!response.success) {
              setActionError("form.error");
            }
            router.refresh();
          });
          return null;
        });
      };

      container.addEventListener("pointermove", handleMove);
      container.addEventListener("pointerup", finalize);
      container.addEventListener("pointercancel", finalize);
    },
    [isPending, locale, router],
  );

  const handleSave = useCallback(() => {
    if (!selectedSlot || !formState) {
      return;
    }

    startTransition(async () => {
      setActionError(null);
      const staffMember =
        formState.assignedStaffId !== ""
          ? staff.find((member) => member.id === formState.assignedStaffId)
          : undefined;
      const assignedName =
        staffMember?.name?.trim() || formState.customStaffName.trim() || undefined;

      const response = await updateSlotAction(locale, {
        slotId: selectedSlot.id,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        status: selectedSlot.hasBooking ? "booked" : formState.status,
        publicDescription: formState.publicDescription.trim() || undefined,
        assignedStaffId:
          formState.assignedStaffId !== "" ? formState.assignedStaffId : undefined,
        assignedStaffName: assignedName,
        isPublished: formState.isPublished,
      });

      if (!response.success) {
        setActionError("form.error");
      }

      router.refresh();
    });
  }, [formState, locale, router, selectedSlot, staff]);

  const handleDelete = useCallback(() => {
    if (!selectedSlot || selectedSlot.hasBooking) {
      return;
    }
    startTransition(async () => {
      setActionError(null);
      const response = await deleteSlotAction(locale, selectedSlot.id);
      if (!response.success) {
        setActionError(
          response.error === "has_booking"
            ? "form.errors.deleteBooked"
            : "form.error",
        );
        router.refresh();
        return;
      }

      setSelectedSlotId(null);
      router.refresh();
    });
  }, [locale, router, selectedSlot]);

  const renderSlot = useCallback(
    (slot: PlannerSlot) => {
      const startMinutes = getMeetingMinutesFromIso(slot.startAt);
      const endMinutes = getMeetingMinutesFromIso(slot.endAt);
      const isSelected = slot.id === selectedSlotId;

      const displayStatus: MeetingSlotStatus = slot.hasBooking
        ? "booked"
        : slot.isPublished
          ? slot.status
          : "unavailable";
      const colorClass = slotColorMap[displayStatus];
      const draftForSlot = resizeDraft?.slotId === slot.id ? resizeDraft : null;
      const top = (draftForSlot?.startMinutes ?? startMinutes) * PIXELS_PER_MINUTE;
      const height = Math.max(
        (draftForSlot?.endMinutes ?? endMinutes) * PIXELS_PER_MINUTE - top,
        SNAP_MINUTES * PIXELS_PER_MINUTE,
      );

      return (
        <div
          key={slot.id}
          className="absolute left-2 right-2 rounded-2xl border px-4 py-3 text-xs text-white transition"
          style={{ top, height }}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedSlotId(slot.id);
          }}
        >
          <div
            className={`${colorClass} absolute inset-0 rounded-2xl border transition ${
              isSelected ? "ring-2 ring-white/80" : ""
            } ${slot.isPublished ? "" : "border-dashed"}`}
          />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-white">
              <span>
                {formatDateWithZone(
                  slot.startAt,
                  { hour: "2-digit", minute: "2-digit" },
                  locale,
                  MEETING_TIME_ZONE,
                )}
                {" – "}
                {formatDateWithZone(
                  slot.endAt,
                  { hour: "2-digit", minute: "2-digit" },
                  locale,
                  MEETING_TIME_ZONE,
                )}
              </span>
              {slot.hasBooking ? (
                <span className="rounded-full bg-rose-500/30 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-50">
                  {t("legend.booked")}
                </span>
              ) : !slot.isPublished ? (
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80">
                  {t("legend.hidden")}
                </span>
              ) : null}
            </div>
            {slot.hasBooking && slot.booking ? (
              <div className="space-y-1 text-[11px] text-white/80">
                <p className="font-semibold">{slot.booking.personName}</p>
                <p>{slot.booking.reason}</p>
              </div>
            ) : slot.publicDescription ? (
              <p className="text-[11px] text-white/70">{slot.publicDescription}</p>
            ) : (
              <p className="text-[11px] text-white/60">{t("timeline.availableLabel")}</p>
            )}
          </div>
          {slot.hasBooking ? null : (
            <>
              <div
                className="absolute left-2 right-2 top-0 h-3 cursor-ns-resize rounded-t-2xl bg-white/10"
                onPointerDown={(event) => beginResize(slot, "start", event)}
              />
              <div
                className="absolute bottom-0 left-2 right-2 h-3 cursor-ns-resize rounded-b-2xl bg-white/10"
                onPointerDown={(event) => beginResize(slot, "end", event)}
              />
            </>
          )}
        </div>
      );
    },
    [beginResize, locale, resizeDraft, selectedSlotId, t],
  );

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_30px_120px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-3 text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">{t("calendar.heading")}</h2>
            <p className="text-sm text-white/70">{t("calendar.caption")}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day) => {
            const available = day.slots.filter(
              (slot) => slot.status === "available" && !slot.hasBooking,
            ).length;
            const booked = day.slots.filter((slot) => slot.hasBooking).length;
            const hidden = day.slots.filter((slot) => !slot.isPublished).length;
            const total = Math.max(day.totalSlots, available + booked + hidden);
            const weekday = formatDateWithZone(
              day.date,
              { weekday: "short" },
              locale,
              MEETING_TIME_ZONE,
            );
            const month = formatDateWithZone(
              day.date,
              { month: "short" },
              locale,
              MEETING_TIME_ZONE,
            );
            const dayNumber = formatDateWithZone(
              day.date,
              { day: "numeric" },
              locale,
              MEETING_TIME_ZONE,
            );

            const isSelected = day.dateKey === selectedDayKey;
            const statusLabel = t(`calendar.status.${day.status}` as const);

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => {
                  setSelectedDayKey(day.dateKey);
                  setSelectedSlotId(null);
                }}
                className={cn(
                  "relative flex flex-col gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  isSelected
                    ? cn("border-white/60 bg-white/12", dayStatusHighlightMap[day.status])
                    : "hover:border-white/35 hover:bg-white/10",
                )}
                aria-pressed={isSelected}
                aria-label={`${weekday} ${dayNumber} ${month}. ${statusLabel}. ${t("calendar.count.available", { count: available })}, ${t("calendar.count.booked", { count: booked })}, ${t("calendar.count.hidden", { count: hidden })}`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
                  <span>{weekday}</span>
                  <span>{month}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-white">{dayNumber}</span>
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", dayStatusDotMap[day.status])} aria-hidden />
                    <span className="sr-only">{statusLabel}</span>
                  </span>
                </div>
                <div className="text-[11px] leading-snug text-white/65">
                  <div className="flex items-center justify-between">
                    <span>{t("calendar.metrics.available", { count: available })}</span>
                    <span>{t("calendar.metrics.booked", { count: booked })}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/55">
                    <span>{t("calendar.metrics.hidden", { count: hidden })}</span>
                    <span>{t("calendar.metrics.total", { count: total })}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-2 text-xs text-white/60">
          <p className="font-semibold uppercase tracking-[0.3em] text-white/50">
            {t("legend.title")}
          </p>
          <div className="flex flex-wrap gap-3">
            <LegendBadge color="bg-emerald-500/40" label={t("legend.available")} />
            <LegendBadge color="bg-rose-500/40" label={t("legend.booked")} />
            <LegendBadge color="bg-white/20" label={t("legend.hidden")} />
          </div>
          <p>{t("timeline.createHint")}</p>
          <p>{t("timeline.updateHint")}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_30px_120px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {t("timeline.heading")}
              </p>
              {selectedDay ? (
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {formatDateWithZone(
                    selectedDay.date,
                    { weekday: "long", month: "long", day: "numeric" },
                    locale,
                    MEETING_TIME_ZONE,
                  )}
                </h2>
              ) : null}
            </div>
            {isPending ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : null}
          </div>

          <div className="mt-6 h-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-black/40">
            <div
              ref={containerRef}
              className="relative w-full"
              style={{ height: dayLength * PIXELS_PER_MINUTE }}
              onPointerDown={handleBackgroundPointerDown}
            >
              {hourLabels.map((hour) => {
                const top = hour * 60 * PIXELS_PER_MINUTE;
                const label =
                  selectedDay
                    ? formatDateWithZone(
                        meetingMinutesToIso(
                          selectedDay.dateKey,
                          hour * 60,
                        ),
                        { hour: "2-digit", minute: "2-digit" },
                        locale,
                        MEETING_TIME_ZONE,
                      )
                    : `${hour.toString().padStart(2, "0")}:00`;
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-white/[0.06]"
                    style={{ top }}
                  >
                    <span className="absolute left-0 top-0 translate-y-[-50%] px-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {label}
                    </span>
                  </div>
                );
              })}

              {selectedDay?.slots.map((slot) => renderSlot(slot))}

              {draft ? (
                <div
                  className="absolute left-2 right-2 rounded-2xl border border-dashed border-emerald-300/70 bg-emerald-500/20"
                  style={{
                    top: draft.startMinutes * PIXELS_PER_MINUTE,
                    height: Math.max(
                      (draft.endMinutes - draft.startMinutes) * PIXELS_PER_MINUTE,
                      SNAP_MINUTES * PIXELS_PER_MINUTE,
                    ),
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_30px_120px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {t("form.heading")}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {selectedSlot
                  ? formatDateWithZone(
                      selectedSlot.startAt,
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                      locale,
                      MEETING_TIME_ZONE,
                    )
                  : t("form.empty")}
              </h3>
            </div>
            {isPending ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : null}
          </div>

          {actionError ? (
            <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {t(actionError as any)}
            </div>
          ) : null}

          {selectedSlot && formState ? (
            <div className="mt-6 space-y-5 text-sm text-white/80">
              {selectedSlot.hasBooking && selectedSlot.booking ? (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/70">
                  <p className="font-semibold uppercase tracking-[0.25em] text-white/50">
                    {t("form.booking.heading")}
                  </p>
                  <div className="grid gap-2">
                    <InfoRow
                      icon={<Users className="h-3.5 w-3.5" aria-hidden />}
                      label={t("form.booking.person")}
                      value={selectedSlot.booking.personName}
                    />
                    {selectedSlot.booking.company ? (
                      <InfoRow
                        icon={<Building2 className="h-3.5 w-3.5" aria-hidden />}
                        label={t("form.booking.company")}
                        value={selectedSlot.booking.company}
                      />
                    ) : null}
                    <InfoRow
                      icon={<MessageSquare className="h-3.5 w-3.5" aria-hidden />}
                      label={t("form.booking.reason")}
                      value={selectedSlot.booking.reason}
                    />
                    <InfoRow
                      icon={<Mail className="h-3.5 w-3.5" aria-hidden />}
                      label={t("form.booking.email")}
                      value={selectedSlot.booking.email}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    {t("form.labels.staff")}
                  </span>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    value={formState.assignedStaffId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFormState((state) =>
                        state
                          ? {
                              ...state,
                              assignedStaffId: value,
                              customStaffName:
                                value === ""
                                  ? state.customStaffName
                                  : staff.find((member) => member.id === value)?.name ?? "",
                            }
                          : state,
                      );
                    }}
                  >
                    <option value="">{t("form.staff.unassigned")}</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    {t("form.labels.customStaff")}
                  </span>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    value={formState.customStaffName}
                    onChange={(event) =>
                      setFormState((state) =>
                        state ? { ...state, customStaffName: event.target.value } : state,
                      )
                    }
                    placeholder={t("form.placeholders.customStaff")}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    {t("form.labels.status")}
                  </span>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60"
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((state) =>
                        state
                          ? {
                              ...state,
                              status: event.target.value as MeetingSlotStatus,
                            }
                          : state,
                      )
                    }
                    disabled={selectedSlot.hasBooking}
                  >
                    <option value="available">{t("form.status.available")}</option>
                    <option value="unavailable">{t("form.status.unavailable")}</option>
                  </select>
                  {selectedSlot.hasBooking ? (
                    <p className="text-xs text-white/50">{t("form.alerts.bookedLocked")}</p>
                  ) : null}
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-white/20 bg-black/40"
                    checked={formState.isPublished}
                    onChange={(event) =>
                      setFormState((state) =>
                        state ? { ...state, isPublished: event.target.checked } : state,
                      )
                    }
                  />
                  <span>{t("form.labels.published")}</span>
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  {t("form.labels.description")}
                </span>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  value={formState.publicDescription}
                  onChange={(event) =>
                    setFormState((state) =>
                      state ? { ...state, publicDescription: event.target.value } : state,
                    )
                  }
                  placeholder={t("form.placeholders.description")}
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? t("form.actions.saving") : t("form.actions.save")}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60 transition hover:border-rose-400/60 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 disabled:opacity-40"
                  onClick={handleDelete}
                  disabled={isPending || selectedSlot.hasBooking}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  {isPending ? t("form.actions.deleting") : t("form.actions.delete")}
                </button>
                {selectedSlot.hasBooking ? (
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white/60">
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                    {t("form.alerts.deleteDisabled")}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-white/60">{t("form.instructions")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
  );
}

type LegendBadgeProps = {
  color: string;
  label: string;
};

function LegendBadge({ color, label }: LegendBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
      <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[2px] text-white/50">{icon}</span>
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
          {label}
        </p>
        <p className="text-xs text-white/70">{value}</p>
      </div>
    </div>
  );
}

function positionToMinutes(
  clientY: number,
  container: HTMLDivElement,
  dayLength: number,
): number {
  const rect = container.getBoundingClientRect();
  const offset = clientY - rect.top + container.scrollTop;
  return clampMinutes(offset / PIXELS_PER_MINUTE, dayLength);
}
