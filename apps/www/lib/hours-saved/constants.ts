import { MEETING_TIME_ZONE } from "@/lib/meetings/constants";

export const HOURS_SAVED_WINDOW_HOURS = 24;
export const HOURS_SAVED_DEFAULT_DAY_INCREMENT = 104;
export const HOURS_SAVED_DEFAULT_NIGHT_INCREMENT = 65;
export const HOURS_SAVED_DAY_START_HOUR = 8;
export const HOURS_SAVED_DAY_END_HOUR = 20;
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

export function getZoneHour(date: Date): number {
  const parts = hourFormatter.formatToParts(date);
  const hourPart = parts.find((part) => part.type === "hour");
  return hourPart ? Number.parseInt(hourPart.value, 10) : Number.parseInt(hourFormatter.format(date), 10);
}

export function isDaytimeInZone(date: Date): boolean {
  const hour = getZoneHour(date);
  return hour >= HOURS_SAVED_DAY_START_HOUR && hour < HOURS_SAVED_DAY_END_HOUR;
}

export function getDefaultIncrementFor(date: Date): number {
  return isDaytimeInZone(date) ? HOURS_SAVED_DEFAULT_DAY_INCREMENT : HOURS_SAVED_DEFAULT_NIGHT_INCREMENT;
}
