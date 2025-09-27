export type DateInput = Date | string | number | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value == null) {
    return null;
  }

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatDateUtc(
  value: DateInput,
  options: Intl.DateTimeFormatOptions,
  locale: string = "en-US",
): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(date);
}

export function formatIsoDateUtc(value: DateInput): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  return date.toISOString().split("T")[0] ?? "";
}
