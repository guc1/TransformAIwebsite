import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SpecialOfferClient, type SpecialOfferContent } from "./client";

export const metadata: Metadata = {
  title: "Special Offer Packages | TransformAI",
  description:
    "Explore TransformAI's exclusive premium and starter AI transformation packages designed for decisive Dutch companies.",
  openGraph: {
    title: "Special Offer Packages | TransformAI",
    description:
      "Explore TransformAI's exclusive premium and starter AI transformation packages designed for decisive Dutch companies.",
  },
  twitter: {
    title: "Special Offer Packages | TransformAI",
    description:
      "Explore TransformAI's exclusive premium and starter AI transformation packages designed for decisive Dutch companies.",
  },
};

export default async function SpecialOfferPage() {
  const t = await getTranslations("SpecialOffer");

  const content: SpecialOfferContent = {
    hero: {
      eyebrow: t("hero.eyebrow"),
      title: t("hero.title"),
      subtitle: t("hero.subtitle"),
      highlight: t("hero.highlight"),
      notice: t("hero.notice"),
    },
    packages: {
      common: {
        included: t("packages.common.included"),
        exVat: t("packages.common.exVat"),
      },
      premium: {
        badge: t("packages.premium.badge"),
        title: t("packages.premium.title"),
        tagline: t("packages.premium.tagline"),
        description: t("packages.premium.description"),
        price: t("packages.premium.price"),
        ctaLabel: t("packages.premium.cta"),
        ctaHref: "mailto:support@unkey.dev?subject=TransformAI%20Premium%20Deal%20Package",
        bullets: [
          {
            title: t("packages.premium.bullets.bootcamp.title"),
            description: t("packages.premium.bullets.bootcamp.description"),
          },
          {
            title: t("packages.premium.bullets.assessment.title"),
            description: t("packages.premium.bullets.assessment.description"),
          },
          {
            title: t("packages.premium.bullets.comparison.title"),
            description: t("packages.premium.bullets.comparison.description"),
          },
          {
            title: t("packages.premium.bullets.solutions.title"),
            description: t("packages.premium.bullets.solutions.description"),
          },
          {
            title: t("packages.premium.bullets.policy.title"),
            description: t("packages.premium.bullets.policy.description"),
          },
          {
            title: t("packages.premium.bullets.roadmap.title"),
            description: t("packages.premium.bullets.roadmap.description"),
          },
          {
            title: t("packages.premium.bullets.systems.title"),
            description: t("packages.premium.bullets.systems.description"),
          },
        ],
        guarantee: {
          title: t("packages.premium.guarantee.title"),
          description: t("packages.premium.guarantee.description"),
        },
        bonus: {
          title: t("packages.premium.bonus.title"),
          items: [
            {
              title: t("packages.premium.bonus.items.0.title"),
              description: t("packages.premium.bonus.items.0.description"),
            },
            {
              title: t("packages.premium.bonus.items.1.title"),
              description: t("packages.premium.bonus.items.1.description"),
            },
          ],
        },
      },
      basic: {
        badge: t("packages.basic.badge"),
        title: t("packages.basic.title"),
        tagline: t("packages.basic.tagline"),
        description: t("packages.basic.description"),
        price: t("packages.basic.price"),
        ctaLabel: t("packages.basic.cta"),
        ctaHref: "mailto:support@unkey.dev?subject=TransformAI%20Basis%20Pakket",
        bullets: [
          {
            title: t("packages.basic.bullets.bootcamp.title"),
            description: t("packages.basic.bullets.bootcamp.description"),
          },
          {
            title: t("packages.basic.bullets.assessment.title"),
            description: t("packages.basic.bullets.assessment.description"),
          },
          {
            title: t("packages.basic.bullets.quickWins.title"),
            description: t("packages.basic.bullets.quickWins.description"),
          },
          {
            title: t("packages.basic.bullets.roadmap.title"),
            description: t("packages.basic.bullets.roadmap.description"),
          },
          {
            title: t("packages.basic.bullets.backendFocus.title"),
            description: t("packages.basic.bullets.backendFocus.description"),
          },
        ],
        footer: t("packages.basic.footer"),
      },
    },
  };

  return <SpecialOfferClient content={content} />;
}
