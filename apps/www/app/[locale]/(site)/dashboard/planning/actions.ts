"use server";

import { revalidatePath } from "next/cache";

import type { MeetingSlotStatus } from "@/lib/db/schema";
import { createMeetingSlot, updateMeetingSlot, deleteMeetingSlot } from "@/lib/meetings/mutations";
import { getSlotById } from "@/lib/meetings/queries";

export type SerializedMeetingSlot = {
  id: string;
  startAt: string;
  endAt: string;
  status: MeetingSlotStatus;
  isPublished: boolean;
  publicDescription?: string | null;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  hasBooking: boolean;
  booking?: {
    personName: string;
    email: string;
    company?: string | null;
    reason: string;
    description?: string | null;
  } | null;
};

function serializeSlot(slot: Awaited<ReturnType<typeof getSlotById>>): SerializedMeetingSlot | null {
  if (!slot) {
    return null;
  }

  return {
    id: slot.id,
    startAt: slot.startAt.toISOString(),
    endAt: slot.endAt.toISOString(),
    status: slot.status,
    isPublished: slot.isPublished,
    publicDescription: slot.publicDescription,
    assignedStaffId: slot.assignedStaffId ?? null,
    assignedStaffName: slot.assignedStaffName ?? slot.assignedStaff?.name ?? null,
    hasBooking: Boolean(slot.booking),
    booking: slot.booking
      ? {
          personName: slot.booking.personName,
          email: slot.booking.email,
          company: slot.booking.company,
          reason: slot.booking.reason,
          description: slot.booking.description,
        }
      : null,
  };
}

export async function createSlotAction(
  locale: string,
  payload: {
    startAt: string;
    endAt: string;
    status?: MeetingSlotStatus;
    publicDescription?: string;
    assignedStaffId?: string;
    assignedStaffName?: string;
    isPublished?: boolean;
  },
) {
  const result = await createMeetingSlot(payload);

  if (!result.success) {
    return {
      success: false as const,
      error: result.error ?? "validation",
      issues: result.issues,
    };
  }

  await revalidatePath(`/${locale}/dashboard/planning`);

  return {
    success: true as const,
    slot: serializeSlot(result.slot) ?? null,
  };
}

export async function updateSlotAction(
  locale: string,
  payload: {
    slotId: string;
    startAt: string;
    endAt: string;
    status?: MeetingSlotStatus;
    publicDescription?: string;
    assignedStaffId?: string;
    assignedStaffName?: string;
    isPublished?: boolean;
  },
) {
  const result = await updateMeetingSlot(payload);

  if (!result.success) {
    return {
      success: false as const,
      error: result.error ?? "validation",
      issues: result.issues,
    };
  }

  await revalidatePath(`/${locale}/dashboard/planning`);

  return {
    success: true as const,
    slot: serializeSlot(result.slot) ?? null,
  };
}

export async function deleteSlotAction(locale: string, slotId: string) {
  const result = await deleteMeetingSlot(slotId);

  if (!result.success) {
    return {
      success: false as const,
      error: result.error ?? "unknown",
    };
  }

  await revalidatePath(`/${locale}/dashboard/planning`);
  return { success: true as const };
}
