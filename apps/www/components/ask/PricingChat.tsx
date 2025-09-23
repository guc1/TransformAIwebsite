"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { AskCta } from "./AskCta";
import type { ChatLocale, ChatMessage } from "./types";

const ChatPanel = dynamic(() => import("./ChatPanel").then((mod) => mod.ChatPanel), {
  ssr: false,
});

type PricingChatProps = {
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
};

export const PricingChat: React.FC<PricingChatProps> = ({ className, onOpenChange }) => {
  const t = useTranslations("Pricing.Chat");
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
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasOpenedRef = useRef(false);

  const id = useId();
  const panelId = `${id}-pricing-chat`;

  useEffect(() => {
    if (isOpen) {
      return;
    }

    if (!shouldRenderPanel) {
      return;
    }

    let timer: number | undefined;
    if (typeof window !== "undefined") {
      timer = window.setTimeout(() => setShouldRenderPanel(false), 220);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [isOpen, shouldRenderPanel]);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      return;
    }

    if (hasOpenedRef.current && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

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

  const openChat = useCallback(() => {
    setShouldRenderPanel(true);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      closeChat();
      return;
    }
    openChat();
  }, [closeChat, isOpen, openChat]);

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

  const handlePrompt = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend],
  );

  const showPanel = shouldRenderPanel;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-5 right-4 z-[80] flex flex-col items-end gap-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-10",
        "motion-reduce:translate-y-0 motion-reduce:transition-none",
        className,
      )}
    >
      <div
        id={panelId}
        aria-hidden={!isOpen}
        className={cn(
          "pointer-events-auto w-[min(420px,calc(100vw-32px))] transition-all duration-300 ease-out",
          "sm:w-[min(440px,calc(100vw-48px))]",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none",
          "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        )}
      >
        {showPanel ? (
          <ChatPanel
            messages={messages}
            isOpen={isOpen}
            isLoading={isLoading}
            locale={locale}
            onClose={closeChat}
            onSend={handleSend}
            onUsePrompt={handlePrompt}
            errorMessage={errorMessage}
            onRetry={handleRetry}
          />
        ) : null}
      </div>
      <div className="pointer-events-auto">
        <AskCta
          ref={buttonRef}
          label={locale.ctaLabel}
          pressed={isOpen}
          onToggle={handleToggle}
          ariaControls={panelId}
          tabIndex={0}
        />
      </div>
    </div>
  );
};
