"use client";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TransformAILogo } from "./footer-svgs";

type NavLink = {
  titleKey: string;
  href: string;
  external?: boolean;
};
const navigation = [
  {
    titleKey: "sections.company",
    links: [
      { titleKey: "links.about", href: "/about" },
      { titleKey: "links.roadmap", href: "/roadmap" },
      { titleKey: "links.careers", href: "/careers" },
      {
        titleKey: "links.sourceCode",
        href: "https://go.unkey.com/github",
        external: true,
      },
      {
        titleKey: "links.status",
        href: "https://status.unkey.com",
        external: true,
      },
    ],
  },
  {
    titleKey: "sections.resources",
    links: [
      { titleKey: "links.blog", href: "/blog" },
      { titleKey: "links.changelog", href: "/changelog" },
      { titleKey: "links.templates", href: "/templates" },
      {
        titleKey: "links.docs",
        href: "/docs",
        external: true,
      },
      {
        titleKey: "links.glossary",
        href: "/glossary",
      },
    ],
  },
  {
    titleKey: "sections.connect",
    links: [
      {
        titleKey: "links.twitter",
        href: "https://go.unkey.com/twitter",
        external: true,
      },
      {
        titleKey: "links.discord",
        href: "https://go.unkey.com/discord",
        external: true,
      },
      { titleKey: "links.ossFriends", href: "/oss-friends" },
      {
        titleKey: "links.bookCall",
        href: "https://cal.com/team/unkey/user-interview?utm_source=banner&utm_campaign=oss",
        external: true,
      },
    ],
  },
  {
    titleKey: "sections.legal",
    links: [
      { titleKey: "links.terms", href: "/policies/terms" },
      { titleKey: "links.privacy", href: "/policies/privacy" },
    ],
  },
] satisfies Array<{ titleKey: string; links: Array<NavLink> }>;

const Column: React.FC<{
  titleKey: string;
  links: Array<NavLink>;
  className?: string;
}> = ({ titleKey, links, className }) => {
  const t = useTranslations("Footer");
  return (
    <div className={cn("flex flex-col gap-8   text-left ", className)}>
      <span className="w-full text-sm font-medium tracking-wider text-white font-display">
        {t(titleKey)}
      </span>
      <ul className="flex flex-col gap-4 md:gap-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm font-normal transition hover:text-white/40 text-white/70"
            >
              {t(link.titleKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export function Footer({ initialYear }: { initialYear: number }) {
  const t = useTranslations("Footer");
  const [year, setYear] = useState(initialYear);

  useEffect(() => {
    const currentYear = new Date().getUTCFullYear();
    if (currentYear !== year) {
      setYear(currentYear);
    }
  }, [year]);

  return (
    <div className="border-t border-white/20 blog-footer-radial-gradient">
      <footer className="container relative grid grid-cols-2 gap-8 pt-8 pb-12 mx-auto overflow-hidden lg:gap-16 sm:grid-cols-3 xl:grid-cols-5 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-24 lg:pb-24 xl:pt-32 xl:pb-32">
        <div className="flex flex-col items-center col-span-2 sm:items-start sm:col-span-3 xl:col-span-1">
          <TransformAILogo className="h-12 w-auto" sizes="(max-width: 768px) 160px, 220px" />
          <div className="mt-8 text-sm font-normal leading-6 text-white/60">
            {t("tagline")}
          </div>
          <div className="text-sm font-normal leading-6 text-white/40">
            {t("copyright", { year })}
          </div>
        </div>

        {navigation.map(({ titleKey, links }) => (
          <Column key={titleKey} titleKey={titleKey} links={links} className="col-span-1 " />
        ))}
      </footer>
    </div>
  );
}
