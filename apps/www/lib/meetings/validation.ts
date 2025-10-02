import { z } from "zod";

import { MEETING_SLOT_INCREMENT_MINUTES } from "./constants";

const dateValueSchema = z
  .union([z.date(), z.string().datetime({ offset: true })])
  .transform((value) => (value instanceof Date ? value : new Date(value)));

const slotTimingObjectSchema = z.object({
  startAt: dateValueSchema,
  endAt: dateValueSchema,
});

function validateSlotTiming(
  value: z.infer<typeof slotTimingObjectSchema>,
  ctx: z.RefinementCtx,
) {
  if (value.endAt.getTime() <= value.startAt.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "End time must be after start time",
    });
  }

  const duration = (value.endAt.getTime() - value.startAt.getTime()) / (1000 * 60);
  if (duration < MEETING_SLOT_INCREMENT_MINUTES) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "Slot duration must be at least 15 minutes",
    });
  }
}

export const meetingBookingSchema = z.object({
  slotId: z.string().min(1),
  reason: z.string().min(3).max(240),
  company: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined),
  personName: z.string().min(2).max(160),
  email: z.string().email().max(320),
  description: z.string().min(10).max(1000),
  locale: z.string().min(2).max(8),
});

export const slotTimingSchema = slotTimingObjectSchema.superRefine(
  validateSlotTiming,
);

export const slotMetadataSchema = z.object({
  publicDescription: z
    .string()
    .max(280)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined),
  assignedStaffId: z
    .string()
    .min(1)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined),
  assignedStaffName: z
    .string()
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined),
  isPublished: z.boolean().optional(),
});

const createSlotObjectSchema = slotTimingObjectSchema
  .merge(slotMetadataSchema)
  .extend({
    status: z
      .enum(["available", "booked", "unavailable"] as const)
      .optional()
      .default("available"),
  });

export const createSlotSchema = createSlotObjectSchema.superRefine(
  validateSlotTiming,
);

export const updateSlotSchema = createSlotObjectSchema
  .extend({
    slotId: z.string().min(1),
  })
  .superRefine(validateSlotTiming);
