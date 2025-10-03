import { MEETING_TIME_ZONE } from "@/lib/meetings/constants";

export const HOURS_SAVED_WINDOW_HOURS = 24 * 7;
export const HOURS_SAVED_ENTRIES_PER_HOUR = 12;
export const HOURS_SAVED_DEFAULT_DAILY_TARGET = 10_000;
export const HOURS_SAVED_TIME_ZONE = MEETING_TIME_ZONE;

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  hour12: false,
  timeZone: HOURS_SAVED_TIME_ZONE,
});

export function startOfHour(date: Date): Date {
  const copy = new Date(date);
  copy.setMinutes(0, 0, 0);
  return copy;
}

export function addHours(date: Date, hours: number): Date {
  const copy = new Date(date);
  copy.setHours(copy.getHours() + hours);
  return copy;
}

export function nextHour(date: Date): Date {
  return addHours(startOfHour(date), 1);
}

export function randomizeWithinHour(base: Date, used: Set<number>): Date {
  const hourStart = startOfHour(base);

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidate = new Date(hourStart);
    candidate.setMinutes(Math.floor(Math.random() * 60));
    candidate.setSeconds(Math.floor(Math.random() * 60), 0);
    const time = candidate.getTime();
    if (!used.has(time)) {
      used.add(time);
      return candidate;
    }
  }

  const fallback = new Date(hourStart);
  fallback.setSeconds(0, 0);
  used.add(fallback.getTime());
  return fallback;
}

export function getZoneHour(date: Date): number {
  const parts = hourFormatter.formatToParts(date);
  const hourPart = parts.find((part) => part.type === "hour");
  return hourPart ? Number.parseInt(hourPart.value, 10) : Number.parseInt(hourFormatter.format(date), 10);
}
