import type { Locale } from "./routing";

export type Messages = Record<string, unknown>;

export async function loadMessages(locale: Locale): Promise<Messages> {
  const fallback = (await import("../messages/en.json")).default as Messages;

  if (locale === "en") {
    return fallback;
  }

  const specific = (await import(`../messages/${locale}.json`).catch(() => ({
    default: {} as Messages,
  }))).default as Messages;

  return deepMerge(fallback, specific);
}

function deepMerge<T extends Messages>(base: T, override: Messages): T {
  const result: Messages = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(
        result[key] as Messages,
        value as Messages,
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

function isPlainObject(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
