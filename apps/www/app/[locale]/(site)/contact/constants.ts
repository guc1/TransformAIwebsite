export const CONTACT_REQUEST_TYPES = [
  {
    value: "strategy",
    translationKey: "strategy",
    emailLabel: "AI strategy sprint",
  },
  {
    value: "automation",
    translationKey: "automation",
    emailLabel: "Automation & efficiency audit",
  },
  {
    value: "integration",
    translationKey: "integration",
    emailLabel: "Custom AI integration",
  },
  {
    value: "training",
    translationKey: "training",
    emailLabel: "Executive enablement & training",
  },
] as const;

export type ContactRequestType = (typeof CONTACT_REQUEST_TYPES)[number]["value"];
