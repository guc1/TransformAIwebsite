import type { InferSelectModel } from "drizzle-orm";

import type {
  meetingBookings,
  meetingSlots,
  users,
} from "@/lib/db/schema";

export type MeetingSlot = InferSelectModel<typeof meetingSlots>;
export type MeetingBooking = InferSelectModel<typeof meetingBookings>;
export type MeetingSlotWithRelations = MeetingSlot & {
  assignedStaff?: Pick<InferSelectModel<typeof users>, "id" | "name" | "email"> | null;
  booking?: MeetingBooking | null;
};

export type MeetingDaySummary = {
  dateKey: string;
  date: Date;
  availableSlots: number;
  totalSlots: number;
  status: "available" | "limited" | "full";
  slots: MeetingSlotWithRelations[];
};
