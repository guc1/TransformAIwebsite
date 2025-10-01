"use client";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TransformAILogo } from "@/components/footer/footer-svgs";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useConsentManager } from "@c15t/nextjs";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PrimaryButton, SecondaryButton } from "../button";
import { DesktopNavLink, MobileNavLink } from "./link";

export function Navigation() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const { hasConsentFor } = useConsentManager();
  const t = useTranslations("Navigation");
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 100;
      const scrollPercent = Math.min(window.scrollY / 2 / scrollThreshold, 1);
      setScrollPercent(scrollPercent);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      style={{
        backgroundColor: `rgba(0, 0, 0, ${scrollPercent})`,
        borderColor: `rgba(255, 255, 255, ${Math.min(scrollPercent / 5, 0.15)})`,
      }}
      className="fixed z-[100] top-0 border-b-[.75px] border-white/10 w-full py-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12 lg:gap-20">
          <Link href="/" aria-label={t("ariaHome")} className="block shrink-0">
            <Logo />
          </Link>
          <MobileLinks className="lg:hidden" />
          <DesktopLinks className="hidden lg:flex" />
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <LanguageSwitcher className="hidden md:flex" />
          <Link href="https://app.unkey.com/auth/sign-up">
            <SecondaryButton
              label={t("createAccount")}
              IconRight={ChevronRight}
              className="h-8 text-sm"
              onClick={async () => {
                if (hasConsentFor("measurement")) {
                  track("signup", { location: "navigation" });
                }
              }}
            />
          </Link>
          <Link href="https://app.unkey.com">
            <PrimaryButton
              shiny
              label={t("signIn")}
              IconRight={ChevronRight}
              className="h-8"
              onClick={async () => {
                track("signin", { location: "navigation" });
              }}
            />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function MobileLinks({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Navigation");
  return (
    <div className={className}>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-end h-8 gap-2 pl-3 py-2 text-sm duration-150 text-white/60 hover:text-white/80"
          >
            {t("menu")}
            <ChevronDown className="w-4 h-4 relative top-[1px]" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="bg-black/90 z-[110]">
          <DrawerHeader className="flex justify-center">
            <Logo />
          </DrawerHeader>
          <div className="relative w-full mx-auto antialiased z-[110]">
            <ul className="flex flex-col px-8 divide-y divide-white/25">
              <li>
                <MobileNavLink onClick={() => setIsOpen(false)} href="/" label={t("links.home")} />
              </li>
              <li>
                <MobileNavLink
                  onClick={() => setIsOpen(false)}
                  href="/about"
                  label={t("links.about")}
                />
              </li>
              <li>
                <MobileNavLink
                  onClick={() => setIsOpen(false)}
                  href="/blog"
                  label={t("links.blog")}
                />
              </li>
              <li>
                <MobileNavLink
                  onClick={() => setIsOpen(false)}
                  href="/pricing"
                  label={t("links.pricing")}
                />
              </li>
              <li>
                <MobileNavLink
                  onClick={() => setIsOpen(false)}
                  href="/changelog"
                  label={t("links.changelog")}
                />
              </li>
              <li>
                <MobileNavLink
                  onClick={() => setIsOpen(false)}
                  href="/templates"
                  label={t("links.templates")}
                />
              </li>
              <li>
                <MobileNavLink
                  onClick={() => setIsOpen(false)}
                  href="/docs"
                  label={t("links.docs")}
                />
              </li>
              <li>
                <MobileNavLink
                  onClick={() => setIsOpen(false)}
                  href="https://go.unkey.com/discord"
                  label={t("links.discord")}
                  external
                />
              </li>
            </ul>
          </div>
          <DrawerFooter>
            <LanguageSwitcher className="w-full justify-between" />
            <Link href="https://app.unkey.com">
              <PrimaryButton
                shiny
                label={t("signIn")}
                IconRight={ChevronRight}
                className="flex justify-center w-full text-center"
                onClick={async () => {
                  track("signin", { location: "navigation-mobile" });
                }}
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={cn(
                "px-4 duration-500 text-white/75 hover:text-white/80 h-10 border rounded-lg text-center bg-black",
                className,
              )}
            >
              {t("close")}
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function DesktopLinks({ className }: { className: string }) {
  const t = useTranslations("Navigation");

  return (
    <ul className={cn("items-center hidden gap-8 lg:flex xl:gap-12", className)}>
      <li>
        <DesktopNavLink href="/about" label={t("links.about")} />
      </li>
      <li>
        <DesktopNavLink href="/blog" label={t("links.blog")} />
      </li>
      <li>
        <DesktopNavLink href="/pricing" label={t("links.pricing")} />
      </li>
      <li>
        <DesktopNavLink href="/changelog" label={t("links.changelog")} />
      </li>
      <li>
        <DesktopNavLink href="/templates" label={t("links.templates")} />
      </li>
      <li>
        <DesktopNavLink href="/docs" label={t("links.docs")} />
      </li>
      <li>
        <DesktopNavLink href="https://go.unkey.com/discord" label={t("links.discord")} external />
      </li>
    </ul>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <TransformAILogo
      variant="transparent"
      className={cn(
        "h-auto w-[152px] sm:w-[184px] md:w-[212px] lg:w-[232px] shrink-0",
        className,
      )}
      priority
      sizes="(max-width: 640px) 184px, (max-width: 1024px) 212px, 232px"
    />
  );
}
