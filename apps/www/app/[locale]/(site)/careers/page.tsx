import { PrimaryButton } from "@/components/button";
import { ShinyCardGroup } from "@/components/shiny-card";
import { ChangelogLight } from "@/components/svg/changelog";
import { MeteorLines } from "@/components/ui/meteorLines";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type CareersPageProps = {
  params: {
    locale: string;
  };
};

export default async function Careers({ params }: CareersPageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Careers" });

  const detailsLabels = {
    focus: t("details.focus"),
    experience: t("details.experience"),
    portfolio: t("details.portfolio"),
    evaluation: t("details.evaluation"),
    salary: t("details.salary"),
  } as const;

  const emailBase = "mailto:careers@transformai.ai";

  const positions = [
    {
      key: "socialMediaMarketingManager",
      title: t("positions.socialMediaMarketingManager.title"),
      summary: t("positions.socialMediaMarketingManager.summary"),
      details: [
        { label: detailsLabels.focus, value: t("positions.socialMediaMarketingManager.focus") },
        { label: detailsLabels.experience, value: t("positions.socialMediaMarketingManager.experience") },
        { label: detailsLabels.portfolio, value: t("positions.socialMediaMarketingManager.portfolio") },
        { label: detailsLabels.salary, value: t("positions.socialMediaMarketingManager.salary") },
      ],
      href: `${emailBase}?subject=${encodeURIComponent(
        t("positions.socialMediaMarketingManager.emailSubject"),
      )}`,
      accent: "from-white/30 via-white/10 to-transparent",
    },
    {
      key: "aiIntegrationExpert",
      title: t("positions.aiIntegrationExpert.title"),
      summary: t("positions.aiIntegrationExpert.summary"),
      details: [
        { label: detailsLabels.focus, value: t("positions.aiIntegrationExpert.focus") },
        { label: detailsLabels.evaluation, value: t("positions.aiIntegrationExpert.evaluation") },
        { label: detailsLabels.salary, value: t("positions.aiIntegrationExpert.salary") },
      ],
      href: `${emailBase}?subject=${encodeURIComponent(
        t("positions.aiIntegrationExpert.emailSubject"),
      )}`,
      accent: "from-[#FFD600]/30 via-[#FFD600]/15 to-transparent",
    },
    {
      key: "juniorDataAnalyst",
      title: t("positions.juniorDataAnalyst.title"),
      summary: t("positions.juniorDataAnalyst.summary"),
      details: [
        { label: detailsLabels.focus, value: t("positions.juniorDataAnalyst.focus") },
        { label: detailsLabels.experience, value: t("positions.juniorDataAnalyst.experience") },
        { label: detailsLabels.salary, value: t("positions.juniorDataAnalyst.salary") },
      ],
      href: `${emailBase}?subject=${encodeURIComponent(
        t("positions.juniorDataAnalyst.emailSubject"),
      )}`,
      accent: "from-[#9D72FF]/30 via-[#9D72FF]/15 to-transparent",
    },
  ] as const;

  const heroTitle = t("hero.title");
  const heroSubtitle = t("hero.subtitle");
  const applyLabel = t("apply.label");

  return (
    <>
      <div className="container mt-48 text-white/60">
        <div>
          <div className="relative -z-100 max-w-[1000px] mx-auto">
            <ChangelogLight className="w-full -top-[20rem]" />
          </div>
          <div className="w-full">
            <MeteorLines number={1} xPos={60} direction="left" speed={10} delay={0} />
            <MeteorLines number={1} xPos={60} direction="left" speed={10} delay={5} />

            <MeteorLines number={1} xPos={200} direction="left" speed={10} delay={4} />
            <MeteorLines number={1} xPos={200} direction="left" speed={10} delay={8} />

            <MeteorLines
              className="hidden sm:block"
              number={1}
              xPos={350}
              direction="left"
              speed={10}
              delay={2}
            />
            <MeteorLines
              className="hidden sm:block"
              number={1}
              xPos={350}
              direction="left"
              speed={10}
              delay={8}
            />
            <MeteorLines number={1} xPos={60} direction="right" speed={10} delay={0} />
            <MeteorLines number={1} xPos={60} direction="right" speed={10} delay={5} />

            <MeteorLines number={1} xPos={200} direction="right" speed={10} delay={4} />
            <MeteorLines number={1} xPos={200} direction="right" speed={10} delay={8} />

            <MeteorLines
              className="hidden sm:block"
              number={1}
              xPos={350}
              direction="right"
              speed={10}
              delay={2}
            />
            <MeteorLines
              className="hidden sm:block"
              number={1}
              xPos={350}
              direction="right"
              speed={10}
              delay={8}
            />
          </div>
        </div>
        <div className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="blog-heading-gradient text-6xl font-medium mt-12 text-balance">{heroTitle}</h2>
            <p className="mt-6 font-normal leading-7 text-balance text-white/70">{heroSubtitle}</p>
          </div>

          <ShinyCardGroup className="mt-[5.5rem] mb-20 grid w-full gap-8 lg:grid-cols-3">
            {positions.map((position) => (
              <article key={position.key} className="group">
                <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/80 p-[1px]">
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-black/90 p-8">
                    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                      <div
                        className={cn(
                          "absolute inset-x-6 -top-32 h-64 rounded-full blur-3xl",
                          "opacity-60",
                          "bg-gradient-to-br",
                          position.accent,
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-0 rounded-[32px] border border-white/5",
                          "opacity-30",
                        )}
                      />
                    </div>

                    <div className="relative z-10 flex h-full flex-col">
                      <h3 className="text-3xl font-semibold text-transparent bg-gradient-to-br from-white via-white to-white/60 bg-clip-text">
                        {position.title}
                      </h3>
                      <p className="mt-4 text-base text-white/70">{position.summary}</p>

                      <dl className="mt-8 flex flex-col gap-4 text-sm text-white/70">
                        {position.details.map((detail) => (
                          <div key={detail.label} className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                              {detail.label}
                            </dt>
                            <dd className="text-base text-white/90">{detail.value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-10 pt-6 border-t border-white/10">
                        <Link href={position.href} className="inline-flex">
                          <PrimaryButton shiny label={applyLabel} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </ShinyCardGroup>
        </div>
      </div>
    </>
  );
}

export const metadata = {
  title: "Careers | TransformAI",
  description: "Join us.",
  openGraph: {
    title: "Careers | TransformAI",
    description: "Join us.",
    url: "https://transformai.ai/careers",
    siteName: "transformai.ai",
    images: [
      {
        url: "https://unkey.com/og",
        width: 1200,
        height: 675,
      },
    ],
  },
  twitter: {
    title: "Careers | TransformAI",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/images/logos/transformai/purelogo.png",
  },
};
