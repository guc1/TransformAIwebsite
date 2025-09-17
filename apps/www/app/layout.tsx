import type { ReactNode } from "react";
import { cookies } from "next/headers";

import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = resolveLocale();

  return (
    <html
      lang={locale}
      className={`[color-scheme:dark] scroll-smooth ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-hidden bg-black text-pretty antialiased">
        {children}
      </body>
    </html>
  );
}

function resolveLocale(): Locale {
  const localeFromCookie = cookies().get("NEXT_LOCALE")?.value;

  if (localeFromCookie && locales.includes(localeFromCookie as Locale)) {
    return localeFromCookie as Locale;
  }

  return defaultLocale;
}
