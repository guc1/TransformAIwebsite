"use client";
import { AnimatedList } from "@/components/animated-list";
import { useTranslations } from "next-intl";

import { UsageSparkles } from "@/components/svg/usage";
export function UsageBento() {
  const t = useTranslations("Activity");

  const items = [
    {
      icon: <ImageGenerationIcon />,
      actor: t("items.0.actor"),
      description: t("items.0.description"),
      meta: t("items.0.meta"),
      time: "2.0 s",
    },
    {
      icon: <ReplyAssistIcon />,
      actor: t("items.1.actor"),
      description: t("items.1.description"),
      meta: t("items.1.meta"),
      time: "1.1 s",
    },
    {
      icon: <DataCleanerIcon />,
      actor: t("items.2.actor"),
      description: t("items.2.description"),
      meta: t("items.2.meta"),
      time: "0.45 s",
    },
    {
      icon: <TaggingIcon />,
      actor: t("items.3.actor"),
      description: t("items.3.description"),
      meta: t("items.3.meta"),
      time: "0.08 s",
    },
    {
      icon: <ForecastIcon />,
      actor: t("items.4.actor"),
      description: t("items.4.description"),
      meta: t("items.4.meta"),
      time: "3.0 s",
    },
  ];

  return (
    <div className="w-full overflow-hidden relative border-[.75px] h-[576px] rounded-[32px] usage-bento-bg-gradient border-[#ffffff]/10">
      <UsageSparkles className="absolute top-0" />
      <div className="relative ">
        <AnimatedList className="w-full">
          {items.map((item) => (
            <ActivityItem key={item.actor} {...item} />
          ))}
        </AnimatedList>
      </div>
      <UsageText />
    </div>
  );
}

const ImageGenerationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="white" />
    <path d="M9.5 9.5H9.51" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 16L10.5 12.5L13 15L15.5 12.5L18 15" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReplyAssistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M5.5 6.5H18.5C19.3284 6.5 20 7.17157 20 8V14C20 14.8284 19.3284 15.5 18.5 15.5H13.75L10 19.25V15.5H5.5C4.67157 15.5 4 14.8284 4 14V8C4 7.17157 4.67157 6.5 5.5 6.5Z"
      stroke="white"
      strokeLinejoin="round"
    />
    <path d="M7.5 11H16.5" stroke="white" strokeLinecap="round" />
    <path d="M7.5 9H16.5" stroke="white" strokeLinecap="round" />
  </svg>
);

const DataCleanerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="5" width="16" height="4" rx="1.5" stroke="white" />
    <rect x="4" y="10" width="16" height="4" rx="1.5" stroke="white" />
    <rect x="4" y="15" width="16" height="4" rx="1.5" stroke="white" />
    <circle cx="9" cy="7" r="1.5" fill="white" />
    <circle cx="15" cy="12" r="1.5" fill="white" />
    <circle cx="11" cy="17" r="1.5" fill="white" />
  </svg>
);

const TaggingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M5.75 5.5H13.3787C13.7765 5.5 14.158 5.65803 14.4393 5.93934L19.0607 10.5607C19.6464 11.1464 19.6464 12.0962 19.0607 12.6819L13.6819 18.0607C13.0962 18.6464 12.1464 18.6464 11.5607 18.0607L6.93934 13.4393C6.65803 13.158 6.5 12.7765 6.5 12.3787V6.25C6.5 5.83579 6.16421 5.5 5.75 5.5Z"
      stroke="white"
    />
    <circle cx="9.5" cy="8.5" r="1.5" stroke="white" />
  </svg>
);

const ForecastIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M5 17.5L9.5 12.5L12.5 15.5L18.5 8.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 5.5H19" stroke="white" strokeLinecap="round" />
    <path d="M5 19.5H19" stroke="white" strokeLinecap="round" />
    <path d="M5 3.5H19" stroke="white" strokeLinecap="round" />
  </svg>
);

type ActivityItemProps = {
  className?: string;
  icon: React.ReactNode;
  actor: string;
  description: string;
  meta: string;
  time: string;
};

export function ActivityItem({ className, icon, actor, description, meta, time }: ActivityItemProps) {
  return (
    <div
      className={`flex relative -top-7 left-14 md:left-0 rounded-xl border-[.75px] w-[440px] usage-item-gradient border-white/20 mt-4 md:ml-5 lg:ml-0 flex items-center py-[12px] px-[16px] ${className}`}
    >
      <div className="rounded-full bg-gray-500 flex items-center justify-center h-8 w-8 border-.75px border-white/20 bg-white/10">
        {icon}
      </div>
      <div className="ml-6 flex flex-col gap-1">
        <p className="flex items-center text-sm text-white">
          <span className="font-semibold text-white">{actor}</span>
          <span className="ml-2 text-white/50">{description}</span>
          <svg
            className="inline-flex ml-2"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M5 13L8 15.5L13.5 8.5M11.5 14L13.5 15.5L19.5 8.5" stroke="#3CEEAE" />
          </svg>
        </p>
        <p className="text-xs text-white/40">{meta}</p>
      </div>
      <div className="flex items-center h-full ml-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="5.5" stroke="white" strokeOpacity="0.25" />
          <path d="M8.5 5V8L10.5 9.5" stroke="white" strokeOpacity="0.25" />
        </svg>
        <p className="ml-2 text-sm text-white/20">{time}</p>
      </div>
    </div>
  );
}

export function UsageText() {
  const t = useTranslations("Activity");

  return (
    <div className="flex flex-col text-white absolute left-[20px] sm:left-[40px] xl:left-[40px] bottom-[40px] max-w-[3300px]">
      <div className="flex items-center w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.8536 1.85359L14.7047 3.00245C19.3045 3.11116 23 6.87404 23 11.5C23 16.1945 19.1944 20 14.5 20H14V19H14.5C18.6421 19 22 15.6422 22 11.5C22 7.42813 18.755 4.11412 14.71 4.00292L15.8536 5.14648L15.1464 5.85359L13.1464 3.85359L12.7929 3.50004L13.1464 3.14648L15.1464 1.14648L15.8536 1.85359ZM9.5 4.00004C5.35786 4.00004 2 7.3579 2 11.5C2 15.5719 5.24497 18.886 9.29001 18.9972L8.14645 17.8536L8.85355 17.1465L10.8536 19.1465L11.2071 19.5L10.8536 19.8536L8.85355 21.8536L8.14645 21.1465L9.29531 19.9976C4.69545 19.8889 1 16.126 1 11.5C1 6.80562 4.80558 3.00004 9.5 3.00004H10V4.00004H9.5ZM12 8.00004V7.00004H11V8.00004C9.89543 8.00004 9 8.89547 9 10C9 11.1046 9.89543 12 11 12H13C13.5523 12 14 12.4478 14 13C14 13.5523 13.5523 14 13 14H12.5H9.5V15H12V16H13V15C14.1046 15 15 14.1046 15 13C15 11.8955 14.1046 11 13 11H11C10.4477 11 10 10.5523 10 10C10 9.44775 10.4477 9.00004 11 9.00004H11.5H14.5V8.00004H12Z"
            fill="white"
            fillOpacity="0.4"
          />
        </svg>
        <h3 className="relative z-50 ml-4 text-lg font-medium text-white bg-transparent">
          {t("sidebar.title")}
        </h3>
      </div>
      <p className="mt-4 text-white/60 leading-6 max-w-[350px]">
        {t("sidebar.body")}
      </p>
    </div>
  );
}
