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
  const canonicalHost = "transformai.nl";
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https";

    if (forwardedHost === `www.${canonicalHost}`) {
      httpsUrl.host = canonicalHost;
      return NextResponse.redirect(httpsUrl, 301);
    }

    if (forwardedHost === canonicalHost && forwardedProto && forwardedProto !== "https") {
      httpsUrl.host = canonicalHost;
      return NextResponse.redirect(httpsUrl, 301);
    }
  }

  if (pathname === "/select-language" || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (pathname === "/outreach" || pathname.startsWith("/outreach/")) {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const hasLocale = cookieLocale && locales.includes(cookieLocale as (typeof locales)[number]);

    if (hasLocale) {
      const localizedUrl = request.nextUrl.clone();
      localizedUrl.pathname = `/${cookieLocale}${pathname}`;
      return NextResponse.redirect(localizedUrl);
    }

    const selectLanguageUrl = request.nextUrl.clone();
    selectLanguageUrl.pathname = "/select-language";
    const nextPath = `${pathname}${request.nextUrl.search}`;
    selectLanguageUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(selectLanguageUrl);
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
