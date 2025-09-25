import { locales, defaultLocale } from "./apps/www/i18n/routing";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/select-language" || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

    if (!cookieLocale || !locales.includes(cookieLocale as (typeof locales)[number])) {
      const selectLanguageUrl = request.nextUrl.clone();
      selectLanguageUrl.pathname = "/select-language";
      return NextResponse.redirect(selectLanguageUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
