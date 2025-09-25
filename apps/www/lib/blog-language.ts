import { locales } from "@/i18n/routing";

type PostLanguage = string | string[] | undefined;

const LANGUAGE_ALIASES: Record<string, Set<string>> = {
  en: new Set(["english"]),
  nl: new Set(["dutch", "nederlands", "nederland"]),
};

function normalizeLanguageValues(language: PostLanguage) {
  if (!language) {
    return [];
  }

  const values = Array.isArray(language) ? language : [language];

  return values
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

export function shouldIncludePostForLocale(language: PostLanguage, locale?: string) {
  if (!locale) {
    return true;
  }

  const normalizedLocale = locale.trim().toLowerCase();
  const allowedLanguages = LANGUAGE_ALIASES[normalizedLocale];

  if (!allowedLanguages) {
    return true;
  }

  const normalizedLanguages = normalizeLanguageValues(language);

  if (normalizedLanguages.length === 0) {
    return true;
  }

  return normalizedLanguages.some((value) => allowedLanguages.has(value));
}

export function localesForPost(language: PostLanguage) {
  return locales.filter((locale) => shouldIncludePostForLocale(language, locale));
}
