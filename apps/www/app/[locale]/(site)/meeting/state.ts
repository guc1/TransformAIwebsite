export type ScheduleMeetingState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
  slot?: {
    startAt: string;
    endAt: string;
  };
};

export const initialScheduleState: ScheduleMeetingState = {
  status: "idle",
};
