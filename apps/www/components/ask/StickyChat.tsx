"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import { AskCta } from "./AskCta";
import type { ChatLocale, ChatMessage } from "./types";
import { useStickyWithinSection } from "./use-sticky-within-section";

const ChatPanel = dynamic(() => import("./ChatPanel").then((mod) => mod.ChatPanel), {
  ssr: false,
});

type StickyChatProps = {
  className?: string;
};

export const StickyChat: React.FC<StickyChatProps> = ({ className }) => {
  const t = useTranslations("CodeExamples.chat");
  const locale = useMemo<ChatLocale>(
    () => ({
      ctaLabel: t("cta.label"),
      headerTitle: t("header.title"),
      headerStatus: t("header.status"),
      headerStatusA11y: t("header.statusA11y"),
      closeLabel: t("header.close"),
      inputPlaceholder: t("input.placeholder"),
      inputTooltip: t("input.tooltip"),
      inputSend: t("input.send"),
      emptyTitle: t("empty.title"),
      emptyPrompts: [
        t("empty.prompts.0"),
        t("empty.prompts.1"),
        t("empty.prompts.2"),
        t("empty.prompts.3"),
      ],
      emptyAction: t("empty.action"),
      assistantLabel: t("messages.assistant"),
      userLabel: t("messages.user"),
      typingLabel: t("messages.typing"),
      transcriptLabel: t("messages.transcriptLabel"),
      errorTitle: t("errors.title"),
      errorBody: t("errors.body"),
      retryLabel: t("errors.retry"),
    }),
    [t],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [displayPanel, setDisplayPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number>();

  const chatId = useId();
  const chatPanelId = `${chatId}-panel`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setShouldRender(true);
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const query = window.matchMedia("(min-width: 768px)");
    const update = (event: MediaQueryListEvent | MediaQueryList) => setIsDesktop(event.matches);
    update(query);
    const listener = (event: MediaQueryListEvent) => update(event);
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
    } else if (typeof query.addListener === "function") {
      query.addListener(listener);
    }
    return () => {
      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", listener);
      } else if (typeof query.removeListener === "function") {
        query.removeListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.clearTimeout(closeTimer.current);
      setDisplayPanel(true);
      return;
    }

    closeTimer.current = window.setTimeout(() => {
      setDisplayPanel(false);
    }, 220);

    return () => {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && ctaRef.current) {
      ctaRef.current.focus();
    }
  }, [isOpen]);

  const { style: stickyStyle } = useStickyWithinSection({
    enabled: isOpen && isDesktop,
    bottomRef,
    topOffset: 64,
    bottomOffset: 80,
  });

  const chatStyle = isDesktop
    ? stickyStyle
    : isOpen
      ? ({ position: "sticky", bottom: "96px" } as const)
      : ({ position: "relative" } as const);

  const sendToAssistant = useCallback(
    async (conversation: ChatMessage[], prompt: string | null) => {
      setIsLoading(true);
      setErrorMessage(null);
      setPendingPrompt((prev) => prompt ?? prev);

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: conversation.map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          const message = typeof error?.error === "string" ? error.error : response.statusText;
          throw new Error(message);
        }

        const data = (await response.json().catch(() => ({}))) as { message?: string };
        const assistantText = typeof data.message === "string" ? data.message.trim() : "";

        if (!assistantText) {
          throw new Error("Empty assistant response");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: assistantText,
          },
        ]);
        setPendingPrompt(null);
      } catch (error) {
        console.error("Assistant request failed", error);
        setErrorMessage(locale.errorBody);
      } finally {
        setIsLoading(false);
      }
    },
    [locale.errorBody],
  );

  const handleSend = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => {
        const next = [...prev, userMessage];
        void sendToAssistant(next, trimmed);
        return next;
      });
    },
    [sendToAssistant],
  );

  const handleRetry = useCallback(() => {
    if (!pendingPrompt) {
      return;
    }
    void sendToAssistant([...messages], pendingPrompt);
  }, [messages, pendingPrompt, sendToAssistant]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handlePrompt = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend],
  );

  const chatHasContent = shouldRender && displayPanel;

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative mx-auto mt-12 flex w-full max-w-[760px] flex-col items-center gap-8 sm:gap-12",
        className,
      )}
    >
      <div
        className="w-full transition-[top,bottom] duration-300 ease-out"
        style={chatStyle}
        id={chatPanelId}
      >
        <div className="min-h-[320px] sm:min-h-[360px]">
          {chatHasContent ? (
            <ChatPanel
              messages={messages}
              isOpen={isOpen}
              isLoading={isLoading}
              locale={locale}
              onClose={() => setIsOpen(false)}
              onSend={handleSend}
              onUsePrompt={handlePrompt}
              errorMessage={errorMessage}
              onRetry={handleRetry}
            />
          ) : null}
        </div>
      </div>
      <div ref={bottomRef} aria-hidden className="mt-16 h-px w-full" />
      <AskCta
        ref={ctaRef}
        label={locale.ctaLabel}
        pressed={isOpen}
        onToggle={handleToggle}
        ariaControls={chatPanelId}
        className="mt-2"
      />
    </div>
  );
};
