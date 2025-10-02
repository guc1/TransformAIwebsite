export const ANALYTICS_REQUEST_TYPES = [
  {
    value: "platform-access",
    translationKey: "platformAccess",
    emailLabel: "Platform access request",
  },
  {
    value: "other",
    translationKey: "other",
    emailLabel: "Other request",
  },
] as const;

export type AnalyticsRequestType =
  (typeof ANALYTICS_REQUEST_TYPES)[number]["value"];
