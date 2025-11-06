import { addDays } from "date-fns";
import { and, asc, eq, gte, lt } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { meetingBookings, meetingSlots, users } from "@/lib/db/schema";
import { formatIsoDateUtc } from "@/lib/date";

import { MEETING_DAY_RANGE } from "./constants";
import type { MeetingDaySummary, MeetingSlotWithRelations } from "./types";
import {
  createMeetingDayRange,
  getDateFromMeetingKey,
  getMeetingDateKey,
} from "./utils";

function normalizeSlots(
  slots: MeetingSlotWithRelations[],
  { includeHidden }: { includeHidden: boolean },
): MeetingDaySummary[] {
  const byDay = new Map<string, MeetingDaySummary>();

  for (const slot of slots) {
    const key = getMeetingDateKey(slot.startAt);
    if (!byDay.has(key)) {
      byDay.set(key, {
        dateKey: key,
        date: getDateFromMeetingKey(key),
        availableSlots: 0,
        totalSlots: 0,
        status: "full",
        slots: [],
      });
    }

    const summary = byDay.get(key)!;
    summary.slots.push(slot);

    const slotIsVisible = slot.isPublished || includeHidden;
    if (slotIsVisible) {
      summary.totalSlots += 1;
    }

    const slotIsAvailable =
      slotIsVisible &&
      slot.status === "available" &&
      !slot.booking &&
      slot.isPublished;

    if (slotIsAvailable) {
      summary.availableSlots += 1;
    }
  }

  for (const summary of byDay.values()) {
    if (summary.availableSlots === 0) {
      summary.status = "full";
    } else if (summary.availableSlots <= 2) {
      summary.status = "limited";
    } else {
      summary.status = "available";
    }

    summary.slots.sort((a, b) =>
      a.startAt.getTime() - b.startAt.getTime(),
    );
  }

  return Array.from(byDay.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}

export async function getMeetingCalendar(
  options: {
    start?: Date;
    end?: Date;
    includeHidden?: boolean;
  } = {},
): Promise<MeetingDaySummary[]> {
  const now = options.start ?? new Date();
  const dayRange = createMeetingDayRange(now, MEETING_DAY_RANGE);
  const lastDay = dayRange.at(-1)?.date ?? now;
  const rangeEnd = options.end ?? addDays(lastDay, 1);
  const includeHidden = options.includeHidden ?? false;

  const slots = await db.query.meetingSlots.findMany({
    where: (slots, { and: andFn, gte: gteFn, lt: ltFn, eq: eqFn }) =>
      andFn(
        gteFn(slots.startAt, now),
        ltFn(slots.startAt, rangeEnd),
        includeHidden ? undefined : eqFn(slots.isPublished, true),
      ),
    with: {
      booking: true,
      assignedStaff: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: (slots, { asc: ascFn }) => ascFn(slots.startAt),
  });

  const summaries = normalizeSlots(slots, { includeHidden });
  const summaryByKey = new Map(summaries.map((summary) => [summary.dateKey, summary]));

  return dayRange.map(({ date, dateKey }) => {
    const match = summaryByKey.get(dateKey);
    if (match) {
      return match;
    }

    return {
      date,
      dateKey,
      availableSlots: 0,
      totalSlots: 0,
      status: "full" as const,
      slots: [],
    } satisfies MeetingDaySummary;
  });
}

export async function getUpcomingMeetings(limit = 8) {
  const now = new Date();

  const results = await db
    .select({
      slotId: meetingSlots.id,
      startAt: meetingSlots.startAt,
      endAt: meetingSlots.endAt,
      assignedStaffName: meetingSlots.assignedStaffName,
      publicDescription: meetingSlots.publicDescription,
      personName: meetingBookings.personName,
      company: meetingBookings.company,
      email: meetingBookings.email,
      reason: meetingBookings.reason,
      bookingCreatedAt: meetingBookings.createdAt,
    })
    .from(meetingSlots)
    .innerJoin(
      meetingBookings,
      eq(meetingBookings.slotId, meetingSlots.id),
    )
    .where(and(gte(meetingSlots.startAt, now), eq(meetingSlots.status, "booked")))
    .orderBy(asc(meetingSlots.startAt))
    .limit(limit);

  return results.map((row) => ({
    ...row,
    dayKey: getMeetingDateKey(row.startAt),
    isoDate: formatIsoDateUtc(row.startAt),
  }));
}

export async function getStaffMembers() {
  const staff = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, "staff"))
    .orderBy(asc(users.name));

  return staff;
}

export async function getSlotById(id: string): Promise<MeetingSlotWithRelations | null> {
  const slot = await db.query.meetingSlots.findFirst({
    where: (slots, { eq }) => eq(slots.id, id),
    with: {
      booking: true,
      assignedStaff: {
        columns: { id: true, name: true, email: true },
      },
    },
  });

  return slot ?? null;
}
