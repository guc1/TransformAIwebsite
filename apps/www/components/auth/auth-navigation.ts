'use client';

import type { Locale } from "@/i18n/routing";
import { stripLocaleFromPathname } from "@/lib/utils";

type Router = {
  push: (href: string, options?: { locale?: string }) => unknown;
};

interface NavigateAfterAuthOptions {
  router: Router;
  locale: Locale | string;
  targetUrl?: string | null;
  fallbackPath: string;
}

const ensureLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export function navigateAfterAuth({
  router,
  locale,
  targetUrl,
  fallbackPath,
}: NavigateAfterAuthOptions) {
  const normalizedFallback = ensureLeadingSlash(fallbackPath);

  const pushWithLocale = (path: string, targetLocale: Locale | string) => {
    void router.push(path, { locale: targetLocale });
  };

  if (!targetUrl || typeof window === "undefined") {
    pushWithLocale(normalizedFallback, locale);
    return;
  }

  try {
    const parsedUrl = new URL(targetUrl, window.location.origin);

    if (parsedUrl.origin !== window.location.origin) {
      window.location.assign(parsedUrl.href);
      return;
    }

    const { locale: detectedLocale, pathname } = stripLocaleFromPathname(parsedUrl.pathname);
    const destinationLocale = detectedLocale ?? (locale as Locale | string);
    const search = parsedUrl.search ?? "";
    const hash = parsedUrl.hash ?? "";
    const destination = `${pathname}${search}${hash}` || "/";

    pushWithLocale(destination, destinationLocale);
  } catch {
    pushWithLocale(normalizedFallback, locale);
  }
}
