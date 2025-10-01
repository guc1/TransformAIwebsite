import { Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/container";
import { SectionTitle } from "@/components/section";
import { FadeIn, FadeInStagger } from "@/components/fade-in";
import { isLocale } from "@/i18n/routing";

import { ContactForm } from "./components/contact-form";

export const metadata = {
  title: "Contact | TransformAI",
  description: "Partner with TransformAI to shape your AI strategy, automation, and enablement initiatives.",
  openGraph: {
    title: "Contact TransformAI",
    description: "Share your AI ambition and we'll craft a tailored plan within two business days.",
    url: "https://transformai.nl/contact",
    siteName: "TransformAI",
    images: [
      {
        url: "https://transformai.nl/images/landing/og.png",
        width: 1200,
        height: 675,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact TransformAI",
    description: "Tell us about your AI goals and we'll respond with a tailored action plan.",
  },
  icons: {
    shortcut: "/images/logos/transformai/logosvg.svg",
  },
};

type PageProps = {
  params: {
    locale: string;
  };
};

const highlightItems = [
  { key: "strategy", icon: Sparkles },
  { key: "coCreation", icon: Handshake },
  { key: "governance", icon: ShieldCheck },
] as const;

export default async function ContactPage({ params }: PageProps) {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <div className="relative isolate pb-24 pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_65%)] blur-3xl"
      />
      <Container className="relative">
        <FadeIn>
          <div className="relative isolate overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03] px-6 py-16 text-center shadow-[0_32px_140px_rgba(15,23,42,0.6)] sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
            >
              <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_rgba(59,130,246,0))]" />
              <div className="absolute inset-x-12 bottom-[-180px] h-[360px] bg-[conic-gradient(from_110deg_at_50%_50%,_rgba(255,255,255,0.24),_rgba(59,130,246,0),_transparent)] blur-3xl" />
            </div>

            <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              {t("Hero.eyebrow")}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight text-transparent sm:text-5xl sm:leading-tight bg-gradient-to-b from-white via-white to-white/60 bg-clip-text">
              {t("Hero.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-white/70 sm:text-lg">
              {t("Hero.body")}
            </p>
            <p className="mx-auto mt-6 max-w-lg text-sm font-medium text-white/60">
              {t("Hero.emailNotice")}
            </p>
          </div>
        </FadeIn>
      </Container>

      <Container className="relative mt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_420px)]">
          <FadeInStagger faster className="space-y-10">
            <FadeIn>
              <SectionTitle
                align="left"
                label={t("Highlights.label")}
                title={t("Highlights.title")}
                text={t("Highlights.description")}
              />
            </FadeIn>
            <FadeIn as="ul" className="space-y-6">
              {highlightItems.map(({ key, icon: Icon }) => (
                <li key={key} className="group flex items-start gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white shadow-[0_12px_30px_rgba(59,130,246,0.2)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {t(`Highlights.items.${key}.title`)}
                    </p>
                    <p className="text-sm text-white/70">
                      {t(`Highlights.items.${key}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </FadeIn>
          </FadeInStagger>
          <FadeIn className="lg:translate-y-4">
            <ContactForm />
          </FadeIn>
        </div>
      </Container>
    </div>
  );
}
