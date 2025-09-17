import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const locale = resolveLocale(formData.get("locale"));

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}`;
  redirectUrl.search = "";

  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  response.cookies.set("NEXT_LOCALE", locale, {
    maxAge: ONE_YEAR_IN_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function resolveLocale(value: FormDataEntryValue | null): Locale {
  if (typeof value === "string" && isLocale(value)) {
    return value;
  }

  return defaultLocale;
}
