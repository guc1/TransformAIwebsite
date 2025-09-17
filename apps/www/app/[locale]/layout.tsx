import { Footer } from "@/components/footer/footer";
import { Navigation } from "@/components/navbar/navigation";
import { env } from "@/lib/env";
import { locales, type Locale } from "@/i18n/routing";
import { ConsentManagerProvider } from "@c15t/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ConsentBanner } from "../consent-banner";
import { Tracking } from "../tracking";

const parsedEnv = env();

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type MetadataProps = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const locale = params.locale;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = new URL(parsedEnv.NEXT_PUBLIC_BASE_URL);
  const languageAlternates = Object.fromEntries(
    locales.map((code) => [code, `/${code}`]),
  );

  return {
    metadataBase: baseUrl,
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      url: `${baseUrl.origin}/${params.locale}`,
      siteName: t("openGraph.siteName"),
      images: [
        {
          url: `${baseUrl.origin}/og.png`,
          width: 1200,
          height: 675,
        },
      ],
    },
    twitter: {
      title: t("twitter.title"),
      card: "summary_large_image",
    },
    icons: {
      shortcut: "/unkey.png",
    },
    alternates: {
      languages: languageAlternates,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: {
    locale: string;
  };
}>) {
  const locale = params.locale;
  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ConsentManagerProvider
        options={{
          ...(parsedEnv.NEXT_PUBLIC_C15T_MODE
            ? { mode: "c15t", backendURL: "/api/c15t" }
            : { mode: "offline" }),
          react: {
            colorScheme: "dark",
          },
        }}
      >
        <ConsentBanner />

        <div className="relative overflow-x-clip">
          <Navigation />
          {children}
          <Tracking />
          {process.env.NODE_ENV !== "production" ? (
            <div className="pointer-events-none fixed bottom-0 right-0 m-8 flex h-6 w-6 items-center justify-center rounded-lg bg-white p-3 font-mono text-xs text-black">
              <div className="block sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden">al</div>
              <div className="hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden">sm</div>
              <div className="hidden sm:hidden md:block lg:hidden xl:hidden 2xl:hidden">md</div>
              <div className="hidden sm:hidden md:hidden lg:block xl:hidden 2xl:hidden">lg</div>
              <div className="hidden sm:hidden md:hidden lg:hidden xl:block 2xl:hidden">xl</div>
              <div className="hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block">2xl</div>
            </div>
          ) : null}
        </div>
        <Footer />
      </ConsentManagerProvider>
    </NextIntlClientProvider>
  );
}

type MessagesRecord = Record<string, unknown>;

async function loadMessages(locale: Locale) {
  const fallback = (await import("../../messages/en.json")).default as MessagesRecord;
  const specific = (await import(`../../messages/${locale}.json`).catch(() => ({
    default: {} as MessagesRecord,
  }))).default as MessagesRecord;

  return deepMerge(fallback, specific);
}

function deepMerge<T extends MessagesRecord>(
  base: T,
  override: MessagesRecord,
): T {
  const result: MessagesRecord = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(
        result[key] as MessagesRecord,
        value as MessagesRecord,
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

function isPlainObject(value: unknown): value is MessagesRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
