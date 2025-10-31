"use client";

import type React from "react";

import { Particles } from "@/components/particles";
import { ShinyCardGroup } from "@/components/shiny-card";
import { TopLeftShiningLight, TopRightShiningLight } from "@/components/svg/hero";
import {
  Bullet,
  Bullets,
  Button,
  Color,
  Cost,
  PricingCard,
  PricingCardContent,
  PricingCardFooter,
  PricingCardHeader,
  Separator,
} from "../pricing/components";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Boxes,
  CalendarClock,
  CalendarDays,
  Check,
  ClipboardCheck,
  ClipboardList,
  Crown,
  Gift,
  Layers,
  Map,
  MapPinned,
  Rocket,
  Scale,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type SpecialOfferContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    highlight: string;
    notice: string;
  };
  packages: {
    common: {
      included: string;
      exVat: string;
    };
    premium: {
      badge: string;
      title: string;
      tagline: string;
      description: string;
      price: string;
      ctaLabel: string;
      ctaHref: string;
      bullets: Array<{ title: string; description?: string }>;
      guarantee: { title: string; description: string };
      bonus: {
        title: string;
        items: Array<{ title: string; description: string }>;
      };
    };
    basic: {
      badge: string;
      title: string;
      tagline: string;
      description: string;
      price: string;
      ctaLabel: string;
      ctaHref: string;
      bullets: Array<{ title: string; description?: string }>;
      footer?: string;
    };
  };
};

type PackageCardProps = {
  id: string;
  color: Color;
  badgeColor: string;
  badgeTextColor: string;
  badgeLabel: string;
  headerTitle: string;
  headerTagline: string;
  headerDescription: string;
  headerIcon: React.ComponentType<React.ComponentProps<typeof Crown>>;
  price: string;
  priceNote: string;
  cta: { label: string; href: string };
  bullets: Array<{ title: string; description?: string }>;
  bulletIcons: Array<React.ComponentType<React.ComponentProps<typeof Crown>>>;
  bulletColor: Color;
  bulletsTitle: string;
  footer?: React.ReactNode;
  highlight?: React.ReactNode;
};

function PackageCard({
  id,
  color,
  badgeColor,
  badgeTextColor,
  badgeLabel,
  headerTitle,
  headerTagline,
  headerDescription,
  headerIcon: HeaderIcon,
  price,
  priceNote,
  cta,
  bullets,
  bulletIcons,
  bulletColor,
  bulletsTitle,
  footer,
  highlight,
}: PackageCardProps) {
  return (
    <PricingCard id={id} color={color} className="h-full">
      {highlight}
      <PricingCardHeader
        title={headerTitle}
        description={
          <>
            <span className="block text-[11px] uppercase tracking-[0.35em] text-white/50">
              {headerTagline}
            </span>
            {headerDescription}
          </>
        }
        icon={HeaderIcon}
        color={color}
        className={cn("flex-col items-start gap-8 bg-gradient-to-br", {
          "from-purple-500/15 via-purple-400/5 to-fuchsia-400/10": color === Color.Purple,
          "from-white/10 via-white/5 to-white/0": color === Color.White,
        })}
      />
      <Separator />
      <PricingCardContent>
        <div className="flex flex-col gap-6">
          <span
            className="inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: badgeColor,
              color: badgeTextColor,
            }}
          >
            {badgeLabel}
          </span>
          <Cost dollar={price} frequency={priceNote} />
          <Button label={cta.label} href={cta.href} />
          <Bullets title={bulletsTitle}>
            {bullets.map((bullet, index) => {
              const Icon = bulletIcons[index] ?? Check;
              return (
                <li key={`${id}-bullet-${index}`}>
                  <div className="space-y-2">
                    <Bullet Icon={Icon} label={bullet.title} color={bulletColor} />
                    {bullet.description ? (
                      <p className="text-sm text-white/60">{bullet.description}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </Bullets>
        </div>
      </PricingCardContent>
      {footer ? <PricingCardFooter>{footer}</PricingCardFooter> : null}
    </PricingCard>
  );
}

export function SpecialOfferClient({ content }: { content: SpecialOfferContent }) {
  const premiumBulletIcons = [
    CalendarClock,
    ClipboardCheck,
    BarChart3,
    Boxes,
    Scale,
    Map,
    Layers,
  ];

  const basicBulletIcons = [CalendarDays, ClipboardList, Sparkles, MapPinned, Server];

  return (
    <div className="relative isolate overflow-hidden pt-24 pb-24">
      <TopRightShiningLight />
      <TopLeftShiningLight />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500/40 via-sky-400/20 to-fuchsia-500/30 blur-3xl" />
      </div>
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
          <Sparkles className="h-4 w-4 text-purple-200" />
          {content.hero.eyebrow}
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text sm:text-5xl">
          {content.hero.title}
        </h1>
        <p className="mt-4 max-w-3xl text-balance text-base text-white/70 sm:text-lg">
          {content.hero.subtitle}
        </p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm text-purple-100">
          <Crown className="h-4 w-4" />
          {content.hero.highlight}
        </div>
        <p className="mt-5 max-w-2xl text-pretty text-sm text-white/50 sm:text-base">
          {content.hero.notice}
        </p>
      </section>

      <div className="mt-16 px-4">
        <ShinyCardGroup className="mx-auto grid max-w-5xl gap-6 md:[grid-template-columns:1.15fr_1fr]">
          <PackageCard
            id="specialoffer-premium"
            color={Color.Purple}
            badgeColor="rgba(147, 51, 234, 0.15)"
            badgeTextColor="#F6E9FF"
            badgeLabel={content.packages.premium.badge}
            headerTitle={content.packages.premium.title}
            headerTagline={content.packages.premium.tagline}
            headerDescription={content.packages.premium.description}
            headerIcon={Crown}
            price={content.packages.premium.price}
            priceNote={content.packages.common.exVat}
            cta={{ label: content.packages.premium.ctaLabel, href: content.packages.premium.ctaHref }}
            bullets={content.packages.premium.bullets}
            bulletIcons={premiumBulletIcons}
            bulletColor={Color.Purple}
            bulletsTitle={content.packages.common.included}
            highlight={
              <>
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-purple-200/5" />
                  <Particles
                    className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
                    quantity={90}
                    staticity={40}
                    ease={60}
                    color="#E9D5FF"
                    vx={0.08}
                    vy={0.08}
                  />
                </div>
                <div className="absolute -top-10 right-8 pointer-events-none hidden md:block">
                  <div className="rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-purple-50">
                    {content.packages.premium.badge}
                  </div>
                </div>
              </>
            }
            footer={
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20">
                    <ShieldCheck className="h-5 w-5 text-purple-100" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {content.packages.premium.guarantee.title}
                    </p>
                    <p className="mt-1 text-sm text-white/65">
                      {content.packages.premium.guarantee.description}
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5 text-left">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-purple-100" />
                    <p className="text-sm font-semibold text-white">
                      {content.packages.premium.bonus.title}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    {content.packages.premium.bonus.items.map((item, index) => (
                      <li key={`premium-bonus-${index}`}>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-white/60">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            }
          />

          <PackageCard
            id="specialoffer-basic"
            color={Color.White}
            badgeColor="rgba(148, 163, 184, 0.2)"
            badgeTextColor="rgba(226,232,240,1)"
            badgeLabel={content.packages.basic.badge}
            headerTitle={content.packages.basic.title}
            headerTagline={content.packages.basic.tagline}
            headerDescription={content.packages.basic.description}
            headerIcon={Rocket}
            price={content.packages.basic.price}
            priceNote={content.packages.common.exVat}
            cta={{ label: content.packages.basic.ctaLabel, href: content.packages.basic.ctaHref }}
            bullets={content.packages.basic.bullets}
            bulletIcons={basicBulletIcons}
            bulletColor={Color.White}
            bulletsTitle={content.packages.common.included}
            footer={
              content.packages.basic.footer ? (
                <p className="text-center text-sm text-white/60 md:text-left">
                  {content.packages.basic.footer}
                </p>
              ) : undefined
            }
          />
        </ShinyCardGroup>
      </div>
    </div>
  );
}
