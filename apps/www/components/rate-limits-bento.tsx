"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

export function RateLimitsBento() {
  return (
    <div className="w-full md:mt-5 relative border-[.75px] h-[520px] rounded-[32px] border-[#ffffff]/10 flex overflow-x-hidden rate-limits-background-gradient bg-gradient-to-t backdrop-blur-[1px] from-black/20 via-black/20 via-20% to-transparent">
      <RateLimits />
    </div>
  );
}

export function RateLimits() {
  const t = useTranslations("Budgets");

  const configLines = [
    "{",
    '  "credits": { "total": 10000,',
    '    "teamAllocation": { "Sales": 2500,',
    '      "Support": 2500, "Ops": 2500,',
    '      "R&D": 2500 } },',
    '  "rateLimit": { "limit": 100, "intervalMs": 1000 }',
    "}",
  ];

  const highlightRegex = /"(?:credits|total|teamAllocation|rateLimit)"/g;

  return (
    <div className="relative z-10 mx-[32px] flex h-full w-full flex-col px-1 pt-8 pb-12 sm:mx-[40px] sm:px-0 sm:pt-10">
      <div className="relative overflow-hidden rounded-[24px] border-[0.75px] border-white/15 bg-white/[0.04]">
        <div className="flex">
          <div className="flex h-[196px] flex-col overflow-hidden border-r-[0.75px] border-white/10 px-6 py-4 font-mono text-xs leading-7 text-white/30">
            {configLines.map((_, index) => (
              <span key={`line-${index}`}>{index + 1}</span>
            ))}
          </div>
          <div className="relative flex-1">
            <pre className="flex h-[196px] flex-col justify-start gap-0 overflow-hidden px-6 py-4 font-mono text-xs leading-7 text-white/55">
              {configLines.map((line, index) => (
                <code key={`code-${index}`} className="whitespace-pre">
                  {renderHighlightedLine(line, highlightRegex)}
                </code>
              ))}
            </pre>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black via-black/35 to-transparent" />
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 font-mono text-xs text-white">
              <BudgetMeterIcon className="h-7 w-7 text-white/70" />
              <div className="flex flex-col gap-2">
                <span className="text-white/70">{t("creditsLabel")}</span>
                <div className="relative h-[6px] w-[180px] overflow-hidden rounded-full bg-white/10">
                  <span className="absolute inset-y-0 left-0 w-[32.4%] rounded-full bg-[#3CEEAE] ratelimits-bar-shadow" />
                </div>
              </div>
            </div>
            <div className="inline-flex shrink-0 items-center gap-3 self-end rounded-xl border-[0.75px] border-white/20 bg-white/5 px-5 py-2 font-mono text-xs text-white/85 sm:self-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3CEEAE]/20">
                <svg
                  className="h-5 w-5 text-[#3CEEAE]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 11V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 11V8C7 5.79086 8.79086 4 11 4H13C15.2091 4 17 5.79086 17 8V11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>{t("projectPill")}</span>
            </div>
          </div>
          <div className="inline-flex h-9 items-center gap-3 rounded-xl border-[0.75px] border-white/20 bg-white/5 px-4 font-mono text-xs text-white/75">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="84"
              height="84"
              viewBox="0 0 84 84"
              fill="none"
            >
              <g filter="url(#filter0_d_61_98)">
                <rect
                  x="30"
                  y="30"
                  width="24"
                  height="24"
                  rx="6"
                  fill="#6E56CF"
                  shapeRendering="crispEdges"
                />
                <rect
                  x="30"
                  y="30"
                  width="24"
                  height="24"
                  rx="6"
                  fill="black"
                  fillOpacity="0.15"
                  shapeRendering="crispEdges"
                />
                <rect
                  x="30.375"
                  y="30.375"
                  width="23.25"
                  height="23.25"
                  rx="5.625"
                  stroke="white"
                  strokeWidth="0.75"
                  strokeOpacity="0.1"
                  shapeRendering="crispEdges"
                />
                <path
                  d="M46.9 38H38.1C37.4925 38 37 38.4477 37 39V45C37 45.5523 37.4925 46 38.1 46H46.9C47.5075 46 48 45.5523 48 45V39C48 38.4477 47.5075 38 46.9 38Z"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M48 40L43.0665 42.8519C42.8967 42.9487 42.7004 43 42.5 43C42.2996 43 42.1033 42.9487 41.9335 42.8519L37 40"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_61_98"
                  x="0"
                  y="0"
                  width="84"
                  height="84"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="15" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.431373 0 0 0 0 0.337255 0 0 0 0 0.811765 0 0 0 1 0"
                  />
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_61_98" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_61_98"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
            <span>{t("rateLimitPill")}</span>
          </div>
        </div>
        <div className="relative max-w-[320px] text-white sm:max-w-[360px]">
          <div className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[30px] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="relative flex flex-col">
            <div className="flex items-center">
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
                  d="M21 4H18V3H21.5H22V3.5V8.42105V20.5V21H21.5H18V20H21V16H18V15H21V12H18V11H21V8.42105V8H18V7H21V4ZM9.85355 5.14645L9.5 4.79289L9.14645 5.14645L5.64645 8.64645L5.29289 9L5.64645 9.35355L6.79289 10.5L2.14645 15.1464L2 15.2929V15.5V17.5V18H2.5H5.5H6V17.5V16H7.5H8V15.5V14.7071L9.5 13.2071L10.6464 14.3536L11 14.7071L11.3536 14.3536L14.8536 10.8536L15.2071 10.5L14.8536 10.1464L9.85355 5.14645ZM7.85355 10.1464L7.5 9.79289L6.70711 9L9.5 6.20711L13.7929 10.5L11 13.2929L10.2071 12.5L9.85355 12.1464L7.85355 10.1464ZM3 15.7071L7.5 11.2071L8.79289 12.5L7.14645 14.1464L7 14.2929V14.5V15H5.5H5V15.5V17H3V15.7071ZM9.14645 9.35355L10.6464 10.8536L11.3536 10.1464L9.85355 8.64645L9.14645 9.35355Z"
                  fill="white"
                  fillOpacity="0.4"
                />
              </svg>
              <h3 className="ml-3 text-lg font-medium text-white">{t("title")}</h3>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/70">{t("body")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderHighlightedLine(line: string, regex: RegExp): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(regex);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`text-${match.index}`} className="text-white/45">
          {line.slice(lastIndex, match.index)}
        </span>,
      );
    }

    nodes.push(
      <span key={`highlight-${match.index}`} className="text-[#3CEEAE]">
        {match[0]}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length || nodes.length === 0) {
    nodes.push(
      <span key={`tail-${line.length}`} className="text-white/45">
        {line.slice(lastIndex)}
      </span>,
    );
  }

  return nodes;
}

function BudgetMeterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" className={className}>
      <rect
        x="6"
        y="11"
        width="24"
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M10 15H22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="25.5" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 16H4V22H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
