"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("LanguageSwitcher");
  const languageT = useTranslations("Language");

  const languageNames = useMemo(
    () => ({
      en: languageT("english"),
      nl: languageT("dutch"),
    }),
    [languageT],
  );

  const trimmedPathname = useMemo(() => {
    if (!pathname) {
      return "/";
    }

    if (pathname.length > 1 && pathname.endsWith("/")) {
      return pathname.slice(0, -1);
    }

    return pathname;
  }, [pathname]);

  const localeStrippedPath = useMemo(() => {
    return locales.reduce((currentPath, code) => {
      const prefix = `/${code}`;
      if (currentPath === prefix) {
        return "/";
      }

      if (currentPath.startsWith(`${prefix}/`)) {
        const sliced = currentPath.slice(prefix.length);
        return sliced.length > 0 ? sliced : "/";
      }

      return currentPath;
    }, trimmedPathname);
  }, [trimmedPathname]);

  const normalizedPathname = useMemo(() => {
    if (localeStrippedPath.length > 1 && localeStrippedPath.endsWith("/")) {
      return localeStrippedPath.slice(0, -1);
    }

    return localeStrippedPath || "/";
  }, [localeStrippedPath]);

  const search = searchParams.toString();

  const buildHref = (code: Locale) => {
    const basePath = normalizedPathname === "/" ? `/${code}` : `/${code}${normalizedPathname}`;

    return search ? `${basePath}?${search}` : basePath;
  };

  return (
    <nav aria-label={t("label")} className={cn("flex items-center gap-2", className)}>
      <span className="sr-only">{t("label")}</span>
      <div className="flex overflow-hidden rounded-full border border-white/15 bg-white/[0.04] p-0.5">
        {locales.map((code) => {
          const isActive = code === locale;
          const languageName = languageNames[code as keyof typeof languageNames] ?? code;
          const href = buildHref(code);
          const ariaLabel = isActive ? t("current", { language: languageName }) : languageName;

          return (
            <Link
              key={code}
              href={href}
              aria-current={isActive ? "page" : undefined}
              aria-label={ariaLabel}
              className={cn(
                "relative px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                isActive
                  ? "bg-white text-black shadow-[0_0_22px_rgba(255,255,255,0.35)]"
                  : "hover:bg-white/10 hover:text-white",
              )}
            >
              <span aria-hidden>{code.toUpperCase()}</span>
              <span className="sr-only">{languageName}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
