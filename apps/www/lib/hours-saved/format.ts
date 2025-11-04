import {
  HOURS_SAVED_WINDOW_HOURS,
  startOfHour,
} from "@/lib/hours-saved/constants";

type ScheduleInput = {
  scheduledFor: string;
  amount: number;
};

export type ScheduleDisplayEntry = ScheduleInput & {
  dayKey: string;
  dayLabel: string;
  hourCode: string;
  rangeLabel: string;
};

type HoursSavedFormatters = ReturnType<typeof createHoursSavedFormatters>;

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPart["type"]) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function createHoursSavedFormatters(locale: string, timeZone: string) {
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });

  const dayLabelFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  });

  const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  });

  const getHourCode = (date: Date) => {
    const hour = getPart(timeFormatter.formatToParts(date), "hour");
    return hour.padStart(2, "0");
  };

  const getRangeLabel = (date: Date) => {
    const hourCode = getHourCode(date);
    const startLabel = `${hourCode}:00`;
    const endHour = (Number.parseInt(hourCode, 10) + 1) % 24;
    const endLabel = `${endHour.toString().padStart(2, "0")}:00`;
    return `${startLabel} – ${endLabel}`;
  };

  const getDayKey = (date: Date) => {
    const parts = dayKeyFormatter.formatToParts(date);
    const year = getPart(parts, "year");
    const month = getPart(parts, "month");
    const day = getPart(parts, "day");
    return `${year}-${month}-${day}`;
  };

  const getDayLabel = (date: Date) => dayLabelFormatter.format(date);

  return {
    getHourCode,
    getRangeLabel,
    getDayKey,
    getDayLabel,
  };
}

export function buildScheduleDisplay(
  schedule: ScheduleInput[],
  formatters: HoursSavedFormatters,
): ScheduleDisplayEntry[] {
  const sorted = [...schedule].sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
  );

  const seenHours = new Set<string>();
  const display: ScheduleDisplayEntry[] = [];

  for (const entry of sorted) {
    const scheduledDate = new Date(entry.scheduledFor);
    const hourKey = startOfHour(scheduledDate).toISOString();

    if (seenHours.has(hourKey)) {
      continue;
    }

    seenHours.add(hourKey);

    display.push({
      scheduledFor: scheduledDate.toISOString(),
      amount: entry.amount,
      dayKey: formatters.getDayKey(scheduledDate),
      dayLabel: formatters.getDayLabel(scheduledDate),
      hourCode: formatters.getHourCode(scheduledDate),
      rangeLabel: formatters.getRangeLabel(scheduledDate),
    });

    if (display.length === HOURS_SAVED_WINDOW_HOURS) {
      break;
    }
  }

  return display;
}

export function toScheduleInput(entries: { scheduledFor: Date; amount: number }[]): ScheduleInput[] {
  return entries.map((entry) => ({
    scheduledFor: entry.scheduledFor.toISOString(),
    amount: entry.amount,
  }));
}
