import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const isBrowser = typeof window !== "undefined";

export function stripLocaleFromPathname(pathname: string): {
  locale: Locale | null;
  pathname: string;
} {
  for (const code of locales) {
    const prefix = `/${code}`;

    if (pathname === prefix) {
      return { locale: code, pathname: "/" };
    }

    if (pathname.startsWith(`${prefix}/`)) {
      const normalized = pathname.slice(prefix.length) || "/";
      return {
        locale: code,
        pathname: normalized.startsWith("/") ? normalized : `/${normalized}`,
      };
    }
  }

  const safePath = pathname || "/";

  return {
    locale: null,
    pathname: safePath.startsWith("/") ? safePath : `/${safePath}`,
  };
}
