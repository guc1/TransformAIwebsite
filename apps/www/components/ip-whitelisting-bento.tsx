"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import ip from "../images/ip.svg";
import { ImageWithBlur } from "./image-with-blur";

export function IpWhitelistingBento() {
  const t = useTranslations("Security");

  const policies: PolicyBadgeProps[] = [
    {
      label: t("badges.confidential"),
      caption: t("captions.pii"),
      icon: <ConfidentialPolicyIcon />,
      className:
        "top-[14%] left-[22%] -translate-x-1/2 -translate-y-1/2 sm:top-[16%] sm:left-[26%] lg:top-[18%] lg:left-[30%]",
    },
    {
      label: t("badges.internal"),
      caption: t("captions.access"),
      icon: <AccessPolicyIcon />,
      className:
        "top-[46%] right-[12%] -translate-y-1/2 sm:right-[16%] lg:right-[18%]",
    },
    {
      label: t("badges.public"),
      caption: t("captions.residency"),
      icon: <ResidencyPolicyIcon />,
      className:
        "bottom-[20%] right-[14%] sm:bottom-[18%] sm:right-[20%] lg:bottom-[16%] lg:right-[24%]",
    },
  ];

  return (
    <div className="relative mt-5 flex h-[520px] w-full overflow-hidden rounded-[32px] border-[0.75px] border-[#ffffff]/10 ip-blur-gradient ip-whitelisting-bg-gradient">
      <ImageWithBlur src={ip} alt="animated map" className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/35 to-black/10" />
        <div className="absolute bottom-0 left-0 right-[28%] top-[52%] sm:right-[32%] sm:top-[50%] lg:right-[38%]">
          <div className="absolute inset-0 rounded-br-[32px] rounded-tl-[32px] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 h-full w-full">
          {policies.map((policy) => (
            <PolicyBadge key={policy.caption} {...policy} />
          ))}
        </div>
      </div>
      <IpWhitelistingText />
    </div>
  );
}

export function IpWhitelistingText() {
  const t = useTranslations("Security");

  return (
    <div className="absolute bottom-10 left-6 z-30 max-w-[320px] text-white sm:bottom-12 sm:left-10 sm:max-w-[360px]">
      <div className="relative">
        <div className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[30px] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="relative flex flex-col">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-white/70" />
            <h3 className="ml-3 text-lg font-medium text-white">{t("title")}</h3>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/70">
            {t("body")}
          </p>
        </div>
      </div>
    </div>
  );
}

type PolicyBadgeProps = {
  icon: ReactNode;
  label: string;
  caption: string;
  className?: string;
};

function PolicyBadge({ icon, label, caption, className }: PolicyBadgeProps) {
  return (
    <div className={cn("absolute z-20 flex w-max flex-col gap-1 text-white/80", className)}>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-white/65">
          {icon}
        </span>
        <span className="text-[10px] font-medium tracking-tight text-white/85">{label}</span>
      </div>
      <span className="pl-1 text-[9px] font-medium uppercase tracking-[0.18em] text-white/45">{caption}</span>
    </div>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3L5 6V11C5 15.97 8.86 20.44 12 21C15.14 20.44 19 15.97 19 11V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9.5 11.5L11 13L14.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ConfidentialPolicyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2L3.5 4V7.75C3.5 10.61 5.71 13.31 8 13.75C10.29 13.31 12.5 10.61 12.5 7.75V4L8 2Z"
        stroke="white"
        strokeOpacity="0.8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.5 7.5L7.75 8.75L10 6.5" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function AccessPolicyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="3"
        y="7"
        width="10"
        height="6"
        rx="1.5"
        stroke="white"
        strokeOpacity="0.8"
        strokeWidth="1.2"
      />
      <path
        d="M5.5 7V5.5C5.5 4.11929 6.61929 3 8 3C9.38071 3 10.5 4.11929 10.5 5.5V7"
        stroke="white"
        strokeOpacity="0.8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M8 9.5V11.5" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ResidencyPolicyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" />
      <path d="M8 3C9.65685 3 11 5.23858 11 8C11 10.7614 9.65685 13 8 13" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" />
      <path d="M5 6H11" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 10H11" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
