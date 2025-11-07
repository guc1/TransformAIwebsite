import { Footer } from "@/components/footer/footer";
import { Navigation } from "@/components/navbar/navigation";
import { CanonicalLink } from "@/components/seo/canonical-link";
import { env } from "@/lib/env";
import { loadMessages } from "@/i18n/messages";
import { isLocale, locales, type Locale } from "@/i18n/routing";
import { ConsentManagerProvider } from "@c15t/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ConsentBanner } from "../consent-banner";
import { Tracking } from "../tracking";
import { VisitorSessionInitializer } from "../visitor-session-initializer";

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
    locales.map((code) => [code, code === "nl" ? "/" : `/${code}`]),
  ) as Record<string, string>;

  languageAlternates["x-default"] = "/";
  const canonicalPath = locale === "nl" ? "/" : `/${locale}`;

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
      url: `${baseUrl.origin}${canonicalPath}`,
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
      description: t("twitter.description"),
      card: "summary_large_image",
    },
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
      canonical: canonicalPath,
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
  const baseUrl = new URL(parsedEnv.NEXT_PUBLIC_BASE_URL);
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "TransformAI",
    legalName: "TransformAI",
    url: `${baseUrl.origin}/`,
    logo: `${baseUrl.origin}/images/logos/transformai/purelogo.png`,
    image: `${baseUrl.origin}/images/logos/transformai/purelogo.png`,
    telephone: "+31-6-83238351",
    email: "info@transformai.nl",
    areaServed: "NL",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gustav Mahlerlaan 150",
      postalCode: "1082 ME",
      addressLocality: "Amsterdam",
      addressCountry: "NL",
    },
    identifier: {
      "@type": "PropertyValue",
      name: "KvK",
      value: "98623192",
    },
    sameAs: [
      "https://www.linkedin.com/company/transformai",
      "https://x.com/transformai",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "info@transformai.nl",
        telephone: "+31-6-83238351",
        areaServed: "NL",
        availableLanguage: ["nl", "en"],
      },
    ],
  } as const;
  const organizationStructuredDataJson = JSON.stringify(
    organizationStructuredData,
  ).replace(/</g, "\\u003c");

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CanonicalLink />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: organizationStructuredDataJson,
        }}
      />
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
          <VisitorSessionInitializer />
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
        <Footer initialYear={new Date().getUTCFullYear()} />
      </ConsentManagerProvider>
    </NextIntlClientProvider>
  );
}

