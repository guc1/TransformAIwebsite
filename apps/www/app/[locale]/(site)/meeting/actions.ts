"use server";

import { revalidatePath } from "next/cache";

import { bookMeetingSlot } from "@/lib/meetings/mutations";
import { meetingBookingSchema } from "@/lib/meetings/validation";

import type { ScheduleMeetingState } from "./state";

export async function scheduleMeetingAction(
  prevState: ScheduleMeetingState,
  formData: FormData,
) {
  const input = {
    slotId: String(formData.get("slotId") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    company: String(formData.get("company") ?? ""),
    personName: String(formData.get("personName") ?? ""),
    email: String(formData.get("email") ?? ""),
    description: String(formData.get("description") ?? ""),
    locale: String(formData.get("locale") ?? "en"),
    outreachSlug: String(formData.get("outreachSlug") ?? ""),
  };

  const parsed = meetingBookingSchema.safeParse(input);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    if (!input.slotId) {
      errors.slotId = errors.slotId ?? ["Slots.selectError"];
    }
    return {
      status: "error" as const,
      errors,
    } satisfies ScheduleMeetingState;
  }

  const result = await bookMeetingSlot(parsed.data);

  if (!result.success) {
    if (result.error === "validation") {
      return {
        status: "error" as const,
        errors: result.issues,
      } satisfies ScheduleMeetingState;
    }

    const errorKey =
      result.error === "unavailable"
        ? "Meeting.Form.errors.unavailable"
        : "Meeting.Form.errors.generic";

    return {
      status: "error" as const,
      message: errorKey,
    } satisfies ScheduleMeetingState;
  }

  const slot = result.slot;
  if (slot?.startAt && slot?.endAt) {
    await revalidatePath(`/${parsed.data.locale}/meeting`);
    if (parsed.data.outreachSlug) {
      await revalidatePath(`/${parsed.data.locale}/outreach/${parsed.data.outreachSlug}`);
      await revalidatePath(`/outreach/${parsed.data.outreachSlug}`);
    }
    return {
      status: "success" as const,
      slot: {
        startAt: new Date(slot.startAt).toISOString(),
        endAt: new Date(slot.endAt).toISOString(),
      },
    } satisfies ScheduleMeetingState;
  }

  return {
    status: "error" as const,
    message: "Meeting.Form.errors.generic",
  } satisfies ScheduleMeetingState;
}
