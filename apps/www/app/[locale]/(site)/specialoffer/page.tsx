import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { isLocale } from "@/i18n/routing";

import { SpecialOfferClient } from "./client";

type PageProps = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "SpecialOffer",
  });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.openGraph.title"),
      description: t("metadata.openGraph.description"),
    },
    twitter: {
      title: t("metadata.twitter.title"),
      description: t("metadata.twitter.description"),
    },
  };
}

export default function SpecialOfferPage({ params }: PageProps) {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <SpecialOfferClient />;
}
