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
import { Link, usePathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { useAccountHistory } from "@/hooks/use-account-history";
import { rememberAccount, resolveAccountDestination } from "@/lib/account-history";
import { cn } from "@/lib/utils";
import { useConsentManager } from "@c15t/nextjs";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  LogIn,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { DesktopNavLink, MobileNavLink } from "./link";

export function Navigation() {
  const [scrollY, setScrollY] = useState(0);
  const t = useTranslations("Navigation");
  const pathname = usePathname();
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
      setScrollY(window.scrollY);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const backgroundOpacity = Math.min(scrollY / 200, 1);
  const borderOpacity = Math.min(backgroundOpacity / 5, 0.15);
  const shrinkProgress = Math.min(scrollY / 60, 1);
  const trimmedPathname =
    pathname && pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname ?? "/";
  const localeStrippedPath = locales.reduce((current, code) => {
    const prefix = `/${code}`;
    if (current === prefix) {
      return "/";
    }
    if (current.startsWith(`${prefix}/`)) {
      return current.slice(prefix.length) || "/";
    }
    return current;
  }, trimmedPathname);
  const normalizedPathname =
    localeStrippedPath.length > 1 && localeStrippedPath.endsWith("/")
      ? localeStrippedPath.slice(0, -1)
      : localeStrippedPath || "/";
  const isHome = normalizedPathname === "/";
  const isClientView =
    normalizedPathname === "/newsupdates" || normalizedPathname.startsWith("/newsupdates/");
  const isStaffOverviewView = normalizedPathname === "/dashboard";
  const isStaffPlanningView = normalizedPathname.startsWith("/dashboard/planning");
  const isStaffHoursSavedView = normalizedPathname.startsWith("/dashboard/hours-saved");
  const isStaffView =
    isStaffOverviewView || isStaffPlanningView || isStaffHoursSavedView || normalizedPathname.startsWith("/dashboard/");
  const isLoggedInView = isClientView || isStaffView;
  const settledLogoScale = 0.68;
  const initialLogoScale = isHome ? 1 : 0.74;
  const logoScale =
    initialLogoScale - (initialLogoScale - settledLogoScale) * shrinkProgress;
  const basePadding = 12;
  const compactPadding = 8;
  const padding = basePadding - (basePadding - compactPadding) * shrinkProgress;

  const loggedInItems = isLoggedInView
    ? isStaffView
      ? ([
          {
            key: "exit",
            href: "/",
            label: t("loggedIn.exit"),
          },
          {
            key: "overview",
            href: "/dashboard",
            label: t("loggedIn.overview"),
            current: isStaffOverviewView,
          },
          {
            key: "hoursSaved",
            href: "/dashboard/hours-saved",
            label: t("loggedIn.hoursSaved"),
            current: isStaffHoursSavedView,
          },
          {
            key: "planning",
            href: "/dashboard/planning",
            label: t("loggedIn.planning"),
            current: isStaffPlanningView,
          },
        ] satisfies LoggedInNavItem[])
      : ([
          {
            key: "exit",
            href: "/",
            label: t("loggedIn.exit"),
          },
          {
            key: "dashboard",
            href: "/newsupdates",
            label: t("loggedIn.dashboard"),
            current: isClientView,
          },
          {
            key: "premium",
            href: "/newsupdates#premium",
            label: t("loggedIn.premium"),
          },
          {
            key: "messages",
            label: t("loggedIn.messages"),
            comingSoon: true,
          },
        ] satisfies LoggedInNavItem[])
    : [];

  return (
    <motion.nav
      style={{
        backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
        borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
        paddingTop: `${padding}px`,
        paddingBottom: `${padding}px`,
      }}
      className="fixed z-[100] top-0 border-b-[.75px] border-white/10 w-full py-3 transition-all duration-200 ease-out"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isLoggedInView ? (
        <LoggedInNavigationSection
          comingSoonLabel={t("loggedIn.comingSoon")}
          items={loggedInItems}
          logoScale={logoScale}
          navAriaLabel={t("loggedIn.aria")}
          homeAriaLabel={t("ariaHome")}
        />
      ) : (
        <div className="container flex items-center justify-between">
          <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12 lg:gap-20">
            <Link href="/" aria-label={t("ariaHome")} className="block shrink-0">
              <Logo scale={logoScale} />
            </Link>
            <MobileLinks className="lg:hidden" />
            <DesktopLinks className="hidden lg:flex" />
          </div>
          <div className="hidden sm:flex items-center gap-3 md:gap-4">
            <LanguageSwitcher className="hidden md:flex" />
            <MembersMenu className="flex-shrink-0" />
            <ScheduleCallButton className="flex-shrink-0" />
          </div>
        </div>
      )}
    </motion.nav>
  );
}

type LoggedInNavItem = {
  key: string;
  label: string;
  href?: string;
  current?: boolean;
  comingSoon?: boolean;
};

type LoggedInNavigationSectionProps = {
  comingSoonLabel: string;
  homeAriaLabel: string;
  items: LoggedInNavItem[];
  logoScale: number;
  navAriaLabel: string;
};

function LoggedInNavigationSection({
  comingSoonLabel,
  homeAriaLabel,
  items,
  logoScale,
  navAriaLabel,
}: LoggedInNavigationSectionProps) {
  return (
    <div className="container flex flex-wrap items-center gap-4 sm:gap-6">
      <Link href="/" aria-label={homeAriaLabel} className="block shrink-0">
        <Logo scale={logoScale} />
      </Link>
      <nav
        aria-label={navAriaLabel}
        className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/70 sm:gap-5"
      >
        {items.map((item) => (
          <LoggedInNavLink key={item.key} item={item} comingSoonLabel={comingSoonLabel} />
        ))}
      </nav>
    </div>
  );
}

function LoggedInNavLink({
  item,
  comingSoonLabel,
}: {
  item: LoggedInNavItem;
  comingSoonLabel: string;
}) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        aria-current={item.current ? "page" : undefined}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          item.current
            ? "border border-white/25 bg-white/10 text-white shadow-lg shadow-emerald-500/10"
            : "border border-transparent text-white/70 hover:text-white",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <span
      aria-disabled="true"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm font-semibold text-white/50"
    >
      {item.label}
      {item.comingSoon ? (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55">
          {comingSoonLabel}
        </span>
      ) : null}
    </span>
  );
}

function MembersMenu({ className }: { className?: string }) {
  const t = useTranslations("Navigation");
  const { hasConsentFor } = useConsentManager();
  const [open, setOpen] = useState(false);
  const contentId = "members-menu";
  const accounts = useAccountHistory();

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <MembersButton
          label={t("members")}
          pressed={open}
          className={className}
          aria-controls={contentId}
          aria-expanded={open}
          aria-haspopup="menu"
        />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        align="end"
        sideOffset={16}
        id={contentId}
        className={cn(
          "z-[120] w-64 rounded-2xl border border-white/15 bg-black/80 p-3 shadow-lg shadow-sky-500/15 backdrop-blur-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        )}
      >
        <div className="flex flex-col gap-3">
          {accounts.length > 0 ? (
            <div role="group" aria-label={t("membersMenu.continueHeading")} className="flex flex-col gap-2">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/50">
                {t("membersMenu.continueHeading")}
              </p>
              <div className="flex flex-col gap-2">
                {accounts.map((account) => {
                  const destination = resolveAccountDestination(account);

                  return (
                    <MembersAccountLink
                      key={account.id}
                      href={destination}
                      name={account.name?.trim() || account.email}
                      subtitle={
                        account.role === "staff"
                          ? t("membersMenu.continueRole.staff")
                          : t("membersMenu.continueRole.client")
                      }
                      onClick={() => {
                        setOpen(false);
                        rememberAccount({
                          id: account.id,
                          email: account.email,
                          name: account.name ?? null,
                          role: account.role,
                          destination,
                        });
                        if (hasConsentFor("measurement")) {
                          track("members-continue", { role: account.role, surface: "navigation" });
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
          <nav className="flex flex-col gap-2" aria-label={t("members")}>
            <MembersMenuLink
              href="/create-account"
              label={t("createAccount")}
              description={t("membersMenu.createAccountDescription")}
              icon={UserPlus}
              onClick={() => {
                setOpen(false);
                if (hasConsentFor("measurement")) {
                  track("signup", { location: "navigation" });
                }
              }}
            />
            <MembersMenuLink
              href="/sign-in"
              label={t("signIn")}
              description={t("membersMenu.signInDescription")}
              icon={LogIn}
              onClick={() => {
                setOpen(false);
                track("signin", { location: "navigation" });
              }}
            />
          </nav>
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}

type MembersDrawerMenuProps = {
  onNavigate: () => void;
};

const MembersDrawerMenu = ({ onNavigate }: MembersDrawerMenuProps) => {
  const t = useTranslations("Navigation");
  const { hasConsentFor } = useConsentManager();
  const [open, setOpen] = useState(false);
  const menuId = "drawer-members-menu";
  const accounts = useAccountHistory();

  return (
    <div className="w-full">
      <MembersButton
        label={t("members")}
        pressed={open}
        onClick={() => setOpen((previous) => !previous)}
        className="w-full"
        innerClassName="w-full justify-between px-5 py-2"
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
      />
      {open ? (
        <div id={menuId} className="mt-3 flex flex-col gap-3" role="menu" aria-label={t("members")}>
          {accounts.length > 0 ? (
            <div role="group" aria-label={t("membersMenu.continueHeading")} className="flex flex-col gap-2">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/50">
                {t("membersMenu.continueHeading")}
              </p>
              <div className="flex flex-col gap-2">
                {accounts.map((account) => {
                  const destination = resolveAccountDestination(account);

                  return (
                    <MembersAccountLink
                      key={account.id}
                      href={destination}
                      name={account.name?.trim() || account.email}
                      subtitle={
                        account.role === "staff"
                          ? t("membersMenu.continueRole.staff")
                          : t("membersMenu.continueRole.client")
                      }
                      className="border-white/10 bg-white/5"
                      onClick={() => {
                        setOpen(false);
                        rememberAccount({
                          id: account.id,
                          email: account.email,
                          name: account.name ?? null,
                          role: account.role,
                          destination,
                        });
                        onNavigate();
                        if (hasConsentFor("measurement")) {
                          track("members-continue", { role: account.role, surface: "navigation-mobile" });
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
          <MembersMenuLink
            href="/create-account"
            label={t("createAccount")}
            description={t("membersMenu.createAccountDescription")}
            icon={UserPlus}
            className="border-white/10 bg-white/5"
            onClick={() => {
              setOpen(false);
              onNavigate();
              if (hasConsentFor("measurement")) {
                track("signup", { location: "navigation-mobile" });
              }
            }}
          />
          <MembersMenuLink
            href="/sign-in"
            label={t("signIn")}
            description={t("membersMenu.signInDescription")}
            icon={LogIn}
            className="border-white/10 bg-white/5"
            onClick={() => {
              setOpen(false);
              onNavigate();
              track("signin", { location: "navigation-mobile" });
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

type MembersMenuLinkProps = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
};

function MembersMenuLink({ href, label, description, icon: Icon, className, onClick }: MembersMenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-white/85 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className,
      )}
    >
      <span className="flex flex-col gap-1 text-left">
        <span className="flex items-center gap-2 font-semibold text-white">
          <Icon className="h-4 w-4 text-sky-200 transition group-hover:text-sky-100" />
          {label}
        </span>
        <span className="text-xs text-white/60">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 translate-x-0 text-white/50 transition group-hover:translate-x-1 group-hover:text-white/80" />
    </Link>
  );
}

type MembersAccountLinkProps = {
  href: string;
  name: string;
  subtitle: string;
  className?: string;
  onClick?: () => void;
};

function MembersAccountLink({ href, name, subtitle, className, onClick }: MembersAccountLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-left text-sm text-white transition hover:border-white/25 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className,
      )}
    >
      <span className="flex flex-col text-left">
        <span className="font-semibold text-white">{name}</span>
        <span className="text-xs text-white/60">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 translate-x-0 text-white/50 transition group-hover:translate-x-1 group-hover:text-white/80" />
    </Link>
  );
}

type MembersButtonProps = {
  label: string;
  pressed: boolean;
  icon?: LucideIcon;
  innerClassName?: string;
} & ComponentPropsWithoutRef<"button">;

const MembersButton = forwardRef<HTMLButtonElement, MembersButtonProps>(
  ({ label, pressed, icon: Icon = UsersRound, className, innerClassName, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        data-state={pressed ? "open" : "closed"}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full p-[1px] text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "hero-hiring-gradient shadow-lg shadow-sky-500/20 hover:shadow-sky-400/25",
          "group-data-[state=open]:shadow-sky-400/30 active:scale-[0.98]",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/20 via-sky-500/25 to-purple-500/20 opacity-70 transition duration-300 group-hover:opacity-100 group-data-[state=open]:opacity-90"
        />
        <span
          className={cn(
            "relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition duration-300",
            "bg-white/10 backdrop-blur-xl group-hover:bg-white/15",
            "group-data-[state=open]:bg-gradient-to-r group-data-[state=open]:from-teal-400 group-data-[state=open]:via-sky-500 group-data-[state=open]:to-purple-500 group-data-[state=open]:text-slate-950 group-data-[state=open]:shadow-lg group-data-[state=open]:shadow-sky-500/25",
            innerClassName,
          )}
        >
          <Icon className="h-4 w-4 text-sky-200 transition duration-300 group-hover:rotate-3 group-data-[state=open]:rotate-3 group-data-[state=open]:text-slate-900" />
          <span>{label}</span>
          <ChevronDown className="h-4 w-4 transition duration-300 group-data-[state=open]:rotate-180" />
        </span>
      </button>
    );
  },
);

MembersButton.displayName = "MembersButton";

function ScheduleCallButton({
  className,
  innerClassName,
  onClick,
}: {
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
}) {
  const t = useTranslations("Navigation");

  return (
    <Link
      href="/meeting"
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full p-[1px] text-sm font-semibold text-white transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        "hero-hiring-gradient shadow-lg shadow-sky-500/20 hover:shadow-sky-400/25",
        "active:scale-[0.98]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/20 via-sky-500/25 to-purple-500/20 opacity-70 transition duration-300 group-hover:opacity-100"
      />
      <span
        className={cn(
          "relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-slate-950 transition duration-300",
          "bg-gradient-to-r from-teal-400 via-sky-500 to-purple-500 shadow-lg shadow-sky-500/25",
          "group-hover:shadow-sky-400/25",
          innerClassName,
        )}
      >
        <CalendarClock
          aria-hidden
          className="h-4 w-4 text-slate-900/80 transition duration-300 group-hover:rotate-3"
        />
        {t("scheduleCall")}
      </span>
    </Link>
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
                  href="/contact"
                  label={t("links.contact")}
                />
              </li>
            </ul>
          </div>
          <DrawerFooter>
            <LanguageSwitcher className="w-full justify-between" />
            <ScheduleCallButton
              className="w-full"
              innerClassName="w-full justify-center"
              onClick={() => setIsOpen(false)}
            />
            <MembersDrawerMenu onNavigate={() => setIsOpen(false)} />
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
        <DesktopNavLink href="/contact" label={t("links.contact")} />
      </li>
    </ul>
  );
}

function Logo({ className, scale = 1 }: { className?: string; scale?: number }) {
  return (
    <div
      className="inline-flex origin-left transition-transform duration-200 ease-out"
      style={{ transform: `scale(${scale})` }}
    >
      <TransformAILogo
        variant="transparent"
        className={cn(
          "h-auto w-[128px] sm:w-[164px] md:w-[188px] lg:w-[204px] shrink-0",
          className,
        )}
        priority
        sizes="(max-width: 640px) 164px, (max-width: 1024px) 188px, 204px"
      />
    </div>
  );
}
