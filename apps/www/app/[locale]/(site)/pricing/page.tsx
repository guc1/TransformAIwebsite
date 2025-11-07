import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { env } from "@/lib/env";

import PricingPageClient from "./pricing-page-client";

type PageProps = {
  params: {
    locale: string;
  };
};

type MetadataProps = PageProps;

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Pricing.Metadata" });
  const baseUrl = new URL(env().NEXT_PUBLIC_BASE_URL);
  const pathname = `/${locale}/pricing`;
  const pageUrl = new URL(pathname, baseUrl);

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: pageUrl.toString(),
      images: [
        {
          url: `${baseUrl.origin}/og.png`,
          width: 1200,
          height: 675,
        },
      ],
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      card: "summary_large_image",
    },
  };
}

export default function PricingPage({ params }: PageProps) {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <PricingPageClient />;
}
