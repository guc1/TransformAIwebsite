export type ChatRole = "user" | "assistant";

export type ChatAction =
  | {
      type: "redirect";
      url: string;
      label: string;
      confirm: string;
    };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  action?: ChatAction | null;
  language?: "en" | "nl";
};

export type ChatLocale = {
  ctaLabel: string;
  headerTitle: string;
  headerStatus: string;
  headerStatusA11y: string;
  closeLabel: string;
  inputPlaceholder: string;
  inputTooltip: string;
  inputSend: string;
  emptyTitle: string;
  emptyPrompts: string[];
  emptyAction: string;
  assistantLabel: string;
  userLabel: string;
  typingLabel: string;
  transcriptLabel: string;
  errorTitle: string;
  errorBody: string;
  retryLabel: string;
};
