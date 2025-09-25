import {
  ArrowRight,
  Clock,
  Handshake,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Fragment, type ReactNode } from "react";

import { BorderBeam } from "@/components/border-beam";
import { RainbowDarkButton } from "@/components/button";
import { Container } from "@/components/container";
import { FadeIn, FadeInStagger } from "@/components/fade-in";
import { SectionTitle } from "@/components/section";
import { ChangelogLight } from "@/components/svg/changelog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerAbout,
} from "@/components/ui/accordion";
import { MeteorLines } from "@/components/ui/meteorLines";

import { BlogCard } from "@/components/blog/blog-card";
import { CTA } from "@/components/cta";
import { AboutLight } from "@/components/svg/about-light";
import { StarDots } from "@/components/svg/star-dots";
import { authors } from "@/content/blog/authors";

import { allPosts } from "content-collections";

import downlight from "@/images/about/down-light.svg";
import sidelight from "@/images/about/side-light.svg";

import andrew from "@/images/about/angels/andrew.jpeg";
import ant from "@/images/about/angels/ant.jpeg";
import paul from "@/images/about/angels/copple.jpeg";
import rory from "@/images/about/angels/rory.png";
import theo from "@/images/about/angels/theo.jpeg";
import tom from "@/images/about/angels/tom.jpeg";
import zain from "@/images/about/angels/zain.jpeg";
import allison from "@/images/about/investors/allison5.png";
import liu from "@/images/about/investors/liujiang.jpeg";
import tim from "@/images/about/investors/tim.png";


import { ImageWithBlur } from "@/components/image-with-blur";
import { loadMessages } from "@/i18n/messages";
import type { Messages } from "@/i18n/messages";
import { isLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About | Unkey",
  description: "Learn more about Unkey and how we operate.",
  openGraph: {
    title: "About | Unkey",
    description: "Learn more about Unkey and how we operate.",
    url: "https://unkey.com/templates",
    siteName: "unkey.com",
    images: [
      {
        url: "https://unkey.com/images/landing/og.png",
        width: 1200,
        height: 675,
      },
    ],
  },
  twitter: {
    title: "About | Unkey",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/images/landing/unkey.png",
  },
};

// Keep investor content available but disabled per TransformAI request.
const SHOW_INVESTORS_SECTION = false;

const investors = [
  { name: "Timothy Chen", firm: "Essence VC", image: tim },
  { name: "Liu Jiang", firm: "Sunflower Capital", image: liu },
  { name: "Allison Pickens", firm: "The New Normal Fund", image: allison },
  { name: "Andrew Miklas", firm: "Ex PageDuty CTO", image: andrew },
  { name: "Tom Preston-Werner", firm: "GitHub founder", image: tom },
  { name: "Theo Browne", firm: "CEO @ Ping Labs", image: theo },
  { name: "Paul Copplestone", firm: "CEO @ Supabase", image: paul },
  { name: "Ant Wilson", firm: "CTO @ Supabase", image: ant },
  { name: "Rory Wilding", firm: "Head of Growth @ Supabase", image: rory },
  { name: "Zain Allarakhia", firm: "Former CTO @ Pipe", image: zain },
];

const SELECTED_POSTS = ["uuid-ux", "why-we-built-unkey", "unkey-raises-1-5-million"];

type PageProps = {
  params: {
    locale: string;
  };
};

export default async function Page({ params }: PageProps) {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "About" });
  const messages = await loadMessages(locale);
  const heroTitle = t("Hero.title");
  const heroBody = t("Hero.body");
  const heroCta = t("Hero.cta");
  const founderStoryTitle = t("FounderStory.title");
  const founderTitle = t("Founder.title");
  const founderSubtitle = t("Founder.subtitle");
  const teamTitle = t("Team.title");
  const teamIntro = t("Team.intro");
  const teamCtaLabel = t("Team.cta");

  const fallbackMessages = locale === "en" ? undefined : await loadMessages("en");

  const founderStoryBodyCopy =
    getNestedMessage(messages, ["About", "FounderStory", "body"]) ??
    (fallbackMessages
      ? getNestedMessage(fallbackMessages, [
          "About",
          "FounderStory",
          "body",
        ])
      : undefined);

  const founderBodyCopy =
    getNestedMessage(messages, ["About", "Founder", "body"]) ??
    (fallbackMessages
      ? getNestedMessage(fallbackMessages, ["About", "Founder", "body"])
      : undefined);

  const founderStoryBody = formatFounderBody(founderStoryBodyCopy ?? "");
  const founderBody = formatFounderBody(founderBodyCopy ?? "");
  const teamMembersData = [
    { key: "yergush", image: "/images/NewTeam/gush.JPG", variant: "founder" as const },
    { key: "david", image: "/images/NewTeam/david.png", variant: "default" as const },
    { key: "tim", image: "/images/NewTeam/tim.png", variant: "default" as const },
    { key: "sara", image: "/images/NewTeam/sara.png", variant: "default" as const },
    { key: "jasper", image: "/images/NewTeam/jasper.png", variant: "default" as const },
    { key: "chiHueng", image: "/images/NewTeam/Chi-hueng.png", variant: "default" as const },
    { key: "aiAgents", image: "/images/NewTeam/Aiagents.png", variant: "ai" as const },
  ] as const;

  const teamMembers = teamMembersData.map(({ key, image, variant }) => ({
    key,
    image,
    variant,
    name: t(`Team.members.${key}.name` as Parameters<typeof t>[0]),
    badge: t(`Team.members.${key}.badge` as Parameters<typeof t>[0]),
    description: t(`Team.members.${key}.description` as Parameters<typeof t>[0]),
  }));

  const teamHighlights = [
    {
      key: "velocity",
      value: t("Team.highlights.velocity.value"),
      label: t("Team.highlights.velocity.label"),
    },
    {
      key: "efficiency",
      value: t("Team.highlights.efficiency.value"),
      label: t("Team.highlights.efficiency.label"),
    },
    {
      key: "range",
      value: t("Team.highlights.range.value"),
      label: t("Team.highlights.range.label"),
    },
  ];

  const values = [
    {
      key: "integrityInAi",
      title: t("Values.integrityInAi.title"),
      text: t("Values.integrityInAi.body"),
      icon: ShieldCheck,
    },
    {
      key: "rightTimedAdaptation",
      title: t("Values.rightTimedAdaptation.title"),
      text: t("Values.rightTimedAdaptation.body"),
      icon: Clock,
    },
    {
      key: "reinforcingWorkforce",
      title: t("Values.reinforcingWorkforce.title"),
      text: t("Values.reinforcingWorkforce.body"),
      icon: Users2,
    },
    {
      key: "innovationWithPurpose",
      title: t("Values.innovationWithPurpose.title"),
      text: t("Values.innovationWithPurpose.body"),
      icon: Sparkles,
    },
    {
      key: "strategicAgility",
      title: t("Values.strategicAgility.title"),
      text: t("Values.strategicAgility.body"),
      icon: RefreshCcw,
    },
    {
      key: "partnership",
      title: t("Values.partnership.title"),
      text: t("Values.partnership.body"),
      icon: Handshake,
    },
  ];

  const valuesIntroTitle = t("ValuesIntro.title");
  const valuesIntroBody = t("ValuesIntro.body");
  const blogTitle = t("Blog.title");
  const blogBody = t("Blog.body");

  const posts = allPosts.filter((post) => SELECTED_POSTS.includes(post.slug));
  return (
    <div>
      <Container>
        <div className="mt-[215px] flex flex-col items-center mb-[200px]">
          <ChangelogLight />
          <div className="absolute flex -z-50">
            <div className="parallelogram">{/* <BorderBeam size={300} delay={1} /> */}</div>
            <div className="parallelogram parallelogram-1">
              <BorderBeam size={300} anchor={150} />
            </div>
            <div className="parallelogram parallelogram-2">
              <BorderBeam size={300} anchor={100} />
            </div>
            <div className="parallelogram parallelogram-3">
              <BorderBeam size={300} anchor={50} />
            </div>
            <div className="parallelogram parallelogram-4">
              <BorderBeam size={300} anchor={0} />
            </div>
          </div>
          <div className="mt-12">
            <Link href="/blog/introducing-ratelimiting" target="">
              <RainbowDarkButton label={heroCta} IconRight={ArrowRight} />
            </Link>
            <SectionTitle
              title={heroTitle}
              align="center"
              text={heroBody}
            />
          </div>
          <div className="relative mt-[200px] xl:mt-[400px]">
            <div className="absolute left-[-250px]">
              <MeteorLines className="ml-2 fade-in-0" delay={3} number={1} />
              <MeteorLines className="ml-10 fade-in-40" delay={0} number={1} />
              <MeteorLines className="ml-16 fade-in-100" delay={5} number={1} />
            </div>
            <div className="absolute right-[20px]">
              <MeteorLines className="ml-2 fade-in-0" delay={4} number={1} />
              <MeteorLines className="ml-10 fade-in-40" delay={0} number={1} />
              <MeteorLines className="ml-16 fade-in-100" delay={2} number={1} />

              <div className="absolute right-[640px] top-[550px] -z-50">
                <MeteorLines className="ml-2 fade-in-0" delay={2} number={1} />
                <MeteorLines className="ml-10 fade-in-40" number={1} delay={0} />
                <MeteorLines className="ml-16 fade-in-100" delay={4} number={1} />
              </div>
            </div>
            <div className="about-radial relative px-[50px] md:px-[144px] pb-[100px] pt-[60px] overflow-hidden bg-black text-white flex flex-col items-center rounded-[48px] border-l border-r border-b border-white/[0.15]">
              <h2 className="text-[32px] font-medium leading-[48px] mt-10 text-center text-balance">
                {founderStoryTitle}
              </h2>
              <p className="mt-[40px] text-white/50 leading-[32px] max-w-[720px] text-center">
                {founderStoryBody}
              </p>
              <div className="absolute pointer-events-none scale-[1.5] bottom-[-350px]">
                <AboutLight />
              </div>
            </div>
          </div>
          <SectionTitle
            className="mt-60"
            align="center"
            title={teamTitle}
            text={teamIntro}
          />
          <FadeInStagger
            faster
            className="mt-8 flex w-full flex-wrap items-center justify-center gap-4"
          >
            {teamHighlights.map((highlight) => (
              <FadeIn key={highlight.key}>
                <div className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 transition duration-300 hover:border-white/20 hover:bg-white/[0.06]">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/5 opacity-0 transition duration-300 group-hover:opacity-100"
                  />
                  <div className="relative flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">
                      {highlight.value}
                    </span>
                    <span className="text-sm text-white/60">
                      {highlight.label}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </FadeInStagger>
          <FadeInStagger
            faster
            className="mt-12 grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {teamMembers.map((member) => (
              <FadeIn key={member.key} className="h-full">
                <TeamMemberCard
                  name={member.name}
                  description={member.description}
                  image={member.image}
                  badge={member.badge}
                  variant={member.variant}
                />
              </FadeIn>
            ))}
          </FadeInStagger>
          <div className="mt-10 flex justify-center">
            <Link href={`/${locale}/careers`}>
              <RainbowDarkButton label={teamCtaLabel} />
            </Link>
          </div>

          <div className="relative w-screen max-w-full">
            <Image
              src={sidelight}
              alt="lightbeam effect"
              className="absolute right-[-300px] pointer-events-none"
            />
            <Image
              src={sidelight}
              alt="lightbeam effect"
              className="absolute right-0 scale-x-[-1] left-[-300px] pointer-events-none"
            />
            <SectionTitle
              title={valuesIntroTitle}
              className="mt-[200px] max-w-full"
              align="center"
              text={valuesIntroBody}
            />
            <div className="mx-auto md:px-5 lg:px-8">
              <div className="bg-white/10 overflow-hidden text-white mt-[62px] w-full gap-px grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 border-[1px] border-transparent rounded-3xl mb-10 ">
                {values.map(({ key, title, text, icon }) => (
                  <Value key={key} title={title} text={text} icon={icon} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center max-w-full">
            <StarDots className="absolute pointer-events-none" />
            <SectionTitle
              className="mt-24 md:mt-32 lg:mt-40 px-[10px] text-balance"
              title={founderTitle}
              align="center"
            />
            <p className="mt-6 text-sm md:text-base text-white/70 leading-7 text-center text-balance max-w-[760px]">
              {founderSubtitle}
            </p>
            <div className="border-[1px] border-white/10 mt-12 md:mt-16 lg:mt-20 leading-8 rounded-[48px] py-[60px] xl:py-[96px] px-8 md:px-[88px] text-white text-center max-w-[1008px] flex flex-col justify-center items-center">
              <p className="about-founders-text-gradient">{founderBody}</p>
              <div className="mt-12 flex flex-col items-center gap-4 text-center">
                <ImageWithBlur
                  src="/images/NewTeam/gush.JPG"
                  alt="Portrait of CEO Yergush"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-2 border-white/20 object-cover"
                />
                <div className="space-y-1 text-sm md:text-base text-white">
                  <p className="text-lg font-semibold">CEO Yergush</p>
                  <p className="text-white/50">Founder of TransformAI</p>
                </div>
              </div>
            </div>
            <div className="relative w-full max-w-[680px] z-0">
              <div className="relative w-full bg-black z-100">
                <Accordion
                  type="multiple"
                  className="relative w-full z-50 mt-12 border border-white/10 rounded-[20px] text-white"
                >
                  <AccordionItem
                    value="item-1"
                    className="border border-white/10 rounded-tr-[20px] rounded-tl-[20px]"
                  >
                    <AccordionTriggerAbout>
                      {t("FAQ.q1.title")}
                    </AccordionTriggerAbout>
                    <AccordionContent className="pl-10">
                      {t("FAQ.q1.body")}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border border-white/10">
                    <AccordionTriggerAbout>{t("FAQ.q2.title")}</AccordionTriggerAbout>
                    <AccordionContent className="pl-10">
                      {t("FAQ.q2.body")}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="item-3"
                    className="border border-white/10 rounded-br-[20px] rounded-bl-[20px]"
                  >
                    <AccordionTriggerAbout>{t("FAQ.q3.title")}</AccordionTriggerAbout>
                    <AccordionContent className="pl-10">
                      {t("FAQ.q3.body")}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="absolute right-[500px] top-[150px] -z-50">
                  <MeteorLines className="ml-2 fade-in-0" delay={3} number={1} />
                  <MeteorLines className="ml-10 fade-in-40" delay={0} number={1} />
                  <MeteorLines className="ml-16 fade-in-100" delay={5} number={1} />
                </div>
              </div>
              <div className="absolute pointer-events-none -z-50 hidden lg:flex lg:bottom-[-360px] lg:left-[100px]">
                <Image src={downlight} alt="Light effect" className="scale-[1.5] opacity-[0.7]" />
              </div>
            </div>

            <div className="flex flex-col max-w-full">
              {SHOW_INVESTORS_SECTION ? (
                <>
                  <SectionTitle
                    className="mt-[250px]"
                    align="center"
                    title="Backed by the finest"
                    text="At Unkey, we're privileged to receive backing from top-tier investors, visionary founders, and seasoned operators from across the globe. Here are just a few of them: "
                  />
                  <div className="grid justify-center w-full grid-cols-2 pt-24 mx-auto md:grid-cols-3 lg:grid-cols-5 ">
                    {investors.map(({ name, firm, image }) => {
                      return (
                        <div
                          key={name}
                          className="flex flex-col items-center justify-center pb-12 text-center md:last:col-span-3 lg:last:col-span-1"
                        >
                          <ImageWithBlur src={image} alt={name} className="w-12 h-12 rounded-full" />
                          <p className="mt-8 text-sm font-bold text-white md:whitespace-nowrap">
                            {name}
                          </p>
                          <p className="text-sm text-white/60 md:whitespace-nowrap">{firm}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full h-[1px] bg-gradient-to-r from-black to-black via-white/40 mt-[100px] lg:mt-[80px]" />
                </>
              ) : null}
              <SectionTitle
                className="mt-[100px] lg:mt-[100px]"
                align="center"
                title={blogTitle}
                text={blogBody}
              />
              <div className="flex flex-row w-full mx-auto gap-6 mt-[96px] flex-wrap lg:flex-nowrap">
                {posts.map((post) => {
                  return (
                    <div key={post.slug} className="flex w-full mx-auto mt-6 ">
                      <Link href={`${post.url}`}>
                        <BlogCard
                          tags={post.tags}
                          imageUrl={post.image ?? "/images/blog-images/defaultBlog.png"}
                          title={post.title}
                          subTitle={post.description}
                          author={authors[post.author]}
                          publishDate={post.date}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
      <CTA />
    </div>
  );
}

function getNestedMessage(
  messages: Messages,
  path: string[],
): string | undefined {
  let current: unknown = messages;

  for (const key of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    if (!(key in current)) {
      return undefined;
    }

    const record = current as Record<string, unknown>;
    current = record[key];
  }

  return typeof current === "string" ? current : undefined;
}

function formatFounderBody(copy: string): ReactNode[] {
  const segments = copy
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.flatMap((segment, segmentIndex) => {
    const nodes: ReactNode[] = [];
    const highlightRegex = /<highlight>(.*?)<\/highlight>/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = highlightRegex.exec(segment)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(
          <Fragment
            key={`founder-text-${segmentIndex}-${nodes.length}`}
          >
            {segment.slice(lastIndex, match.index)}
          </Fragment>,
        );
      }

      nodes.push(
        <span
          key={`founder-highlight-${segmentIndex}-${nodes.length}`}
          className="font-semibold text-inherit"
        >
          {match[1]}
        </span>,
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < segment.length) {
      nodes.push(
        <Fragment key={`founder-text-${segmentIndex}-${nodes.length}`}>
          {segment.slice(lastIndex)}
        </Fragment>,
      );
    }

    if (segmentIndex < segments.length - 1) {
      nodes.push(
        <Fragment key={`founder-break-${segmentIndex}`}>
          <br />
          <br />
        </Fragment>,
      );
    }

    return nodes;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type TeamMemberVariant = "default" | "founder" | "ai";

type TeamMemberCardProps = {
  name: string;
  description: string;
  image: string;
  badge: string;
  variant: TeamMemberVariant;
};

function TeamMemberCard({
  name,
  description,
  image,
  badge,
  variant,
}: TeamMemberCardProps) {
  const BadgeIcon =
    variant === "ai" ? Sparkles : variant === "founder" ? ShieldCheck : null;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-500",
        "before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[26px] before:border before:border-white/5 before:opacity-0 before:transition before:duration-500 before:content-['']",
        "hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:before:opacity-100",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-50 blur-3xl transition duration-500",
          variant === "ai"
            ? "bg-[radial-gradient(circle,rgba(129,140,248,0.45),transparent_70%)]"
            : "bg-[radial-gradient(circle,rgba(94,234,212,0.35),transparent_70%)]",
          "group-hover:opacity-90",
        )}
      />
      <div className="relative z-10 flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-3xl bg-white/10 opacity-60 blur-lg transition duration-500 group-hover:opacity-100"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 opacity-0 transition duration-500 group-hover:opacity-100"
          />
          <Image
            src={image}
            alt={name}
            width={64}
            height={64}
            className="relative z-10 h-full w-full rounded-2xl object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            {BadgeIcon ? (
              <BadgeIcon aria-hidden="true" className="h-3.5 w-3.5 text-white/70" />
            ) : null}
            {badge}
          </span>
          <h3 className="text-lg font-semibold text-white">{name}</h3>
        </div>
      </div>
      <p className="relative z-10 text-sm leading-6 text-white/70">{description}</p>
      <span
        aria-hidden="true"
        className="relative z-10 mt-auto h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
      />
    </div>
  );
}

function Value({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex bg-black p-10">
      <div>
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Icon aria-hidden="true" className="h-6 w-6 text-white" />
          </span>
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-white/60 text-sm leading-6 lg:max-w-[4500px] xl:max-w-[280px] pt-2">
          {text}
        </p>
      </div>
    </div>
  );
}
