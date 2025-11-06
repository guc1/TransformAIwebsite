export const CONTACT_REQUEST_TYPES = [
  {
    value: "general",
    translationKey: "general",
    emailLabel: "General questions",
  },
  {
    value: "solutions",
    translationKey: "solutions",
    emailLabel: "Solution inquiries",
  },
  {
    value: "aiHelp",
    translationKey: "aiHelp",
    emailLabel: "Help with AI",
  },
  {
    value: "other",
    translationKey: "other",
    emailLabel: "Other",
  },
] as const;

export type ContactRequestType = (typeof CONTACT_REQUEST_TYPES)[number]["value"];
