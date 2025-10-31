"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { AskCta } from "./AskCta";
import type { ChatLocale, ChatMessage } from "./types";

type ChatPanelComponent = typeof import("./ChatPanel").default;

const ChatPanel = dynamic<ChatPanelComponent>(() => import("./ChatPanel"), {
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
      disabledResponse: t("disabledResponse"),
    }),
    [t],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasOpenedRef = useRef(false);
  const responseTimer = useRef<number>();

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
    return () => {
      if (responseTimer.current) {
        window.clearTimeout(responseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const sendToAssistant = useCallback(() => {
    setIsLoading(true);

    if (responseTimer.current) {
      window.clearTimeout(responseTimer.current);
    }

    responseTimer.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: locale.disabledResponse,
        },
      ]);
      setIsLoading(false);
    }, 480);
  }, [locale.disabledResponse]);

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

      setMessages((prev) => [...prev, userMessage]);
      sendToAssistant();
    },
    [sendToAssistant],
  );

  const handleRetry = useCallback(() => {
    // No retry behaviour while the assistant is disabled.
  }, []);

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
            errorMessage={null}
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
