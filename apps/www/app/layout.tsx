import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://transformai.nl"),
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/png", sizes: "any" },
      {
        url: "/images/logos/transformai/logosvg.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logos/transformai/purelogo.png",
  },
  alternates: {
    canonical: "/",
    languages: {
      nl: "https://transformai.nl/",
      en: "https://transformai.nl/en",
      "x-default": "https://transformai.nl/",
    },
  },
};

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
  const localeFromHeader = headers().get("x-middleware-request-locale");

  if (localeFromHeader && locales.includes(localeFromHeader as Locale)) {
    return localeFromHeader as Locale;
  }

  const localeFromCookie = cookies().get("NEXT_LOCALE")?.value;

  if (localeFromCookie && locales.includes(localeFromCookie as Locale)) {
    return localeFromCookie as Locale;
  }

  return defaultLocale;
}
