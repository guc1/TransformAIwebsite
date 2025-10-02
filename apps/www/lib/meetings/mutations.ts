import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { meetingBookings, meetingSlots } from "@/lib/db/schema";

import { getSlotById } from "./queries";

import {
  createSlotSchema,
  meetingBookingSchema,
  updateSlotSchema,
} from "./validation";

export async function bookMeetingSlot(input: unknown) {
  const parsed = meetingBookingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  return db.transaction(async (tx) => {
    const slot = await tx.query.meetingSlots.findFirst({
      where: (slots, { eq }) => eq(slots.id, data.slotId),
      with: { booking: true },
    });

    if (!slot) {
      return {
        success: false as const,
        error: "not_found" as const,
      };
    }

    if (slot.status !== "available" || slot.booking) {
      return {
        success: false as const,
        error: "unavailable" as const,
      };
    }

    await tx.insert(meetingBookings).values({
      slotId: data.slotId,
      reason: data.reason,
      company: data.company,
      personName: data.personName,
      email: data.email,
      description: data.description,
      locale: data.locale,
    });

    await tx
      .update(meetingSlots)
      .set({ status: "booked", updatedAt: new Date() })
      .where(eq(meetingSlots.id, data.slotId));

    const updatedSlot = await tx.query.meetingSlots.findFirst({
      where: (slots, { eq }) => eq(slots.id, data.slotId),
      with: { booking: true },
    });

    return {
      success: true as const,
      slot: updatedSlot ?? slot,
    };
  });
}

export async function createMeetingSlot(input: unknown) {
  const parsed = createSlotSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation" as const,
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const [created] = await db
    .insert(meetingSlots)
    .values({
      startAt: data.startAt,
      endAt: data.endAt,
      publicDescription: data.publicDescription,
      assignedStaffId: data.assignedStaffId,
      assignedStaffName: data.assignedStaffName,
      status: data.status ?? "available",
      isPublished: data.isPublished ?? true,
    })
    .returning();

  const slot = created ? await getSlotById(created.id) : null;

  return { success: true as const, slot: slot ?? created };
}

export async function updateMeetingSlot(input: unknown) {
  const parsed = updateSlotSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation" as const,
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const [updated] = await db
    .update(meetingSlots)
    .set({
      startAt: data.startAt,
      endAt: data.endAt,
      publicDescription: data.publicDescription,
      assignedStaffId: data.assignedStaffId,
      assignedStaffName: data.assignedStaffName,
      status: data.status ?? "available",
      isPublished: data.isPublished ?? true,
      updatedAt: new Date(),
    })
    .where(eq(meetingSlots.id, data.slotId))
    .returning();

  return {
    success: true as const,
    slot: updated ? await getSlotById(updated.id) : updated,
  };
}

export async function deleteMeetingSlot(slotId: string) {
  const slot = await db.query.meetingSlots.findFirst({
    where: (slots, { eq: eqFn }) => eqFn(slots.id, slotId),
    with: { booking: true },
  });

  if (!slot) {
    return { success: false as const, error: "not_found" as const };
  }

  if (slot.booking) {
    return { success: false as const, error: "has_booking" as const };
  }

  await db.delete(meetingSlots).where(eq(meetingSlots.id, slotId));
  return { success: true as const };
}
