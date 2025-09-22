"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  type CSSProperties,
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

const INTERSECTION_THRESHOLDS = Array.from({ length: 11 }, (_, index) => index / 10);

type StickyChatProps = {
  className?: string;
  triggerId?: string;
};

export const StickyChat: React.FC<StickyChatProps> = ({ className, triggerId }) => {
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
  const [ctaHeight, setCtaHeight] = useState(96);
  const [hasReachedTrigger, setHasReachedTrigger] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number>();
  const hasOpenedRef = useRef(false);

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
    if (isOpen) {
      hasOpenedRef.current = true;
      return;
    }

    if (hasOpenedRef.current && ctaRef.current) {
      ctaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const update = () => {
      if (!ctaRef.current) {
        return;
      }
      const { height } = ctaRef.current.getBoundingClientRect();
      setCtaHeight(height);
    };

    const frame = window.requestAnimationFrame(update);

    let resizeObserver: ResizeObserver | undefined;
    let removeResizeListener = false;

    if (typeof ResizeObserver === "function" && ctaRef.current) {
      resizeObserver = new ResizeObserver(() => {
        update();
      });
      resizeObserver.observe(ctaRef.current);
    } else {
      window.addEventListener("resize", update);
      removeResizeListener = true;
    }

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      if (removeResizeListener) {
        window.removeEventListener("resize", update);
      }
    };
  }, []);

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

  const stickyTopOffset = isDesktop ? 96 : 72;
  const stickyBottomOffset = isDesktop ? 80 : 64;

  const floatingBottomOffset = isDesktop ? 72 : 32;
  const revealOffset = useMemo(
    () => Math.max(ctaHeight + floatingBottomOffset + 24, 0),
    [ctaHeight, floatingBottomOffset],
  );

  const floatingCtaStyle: CSSProperties = {
    position: "fixed",
    bottom: `${floatingBottomOffset}px`,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 60,
    width: "fit-content",
    maxWidth: "calc(100% - 32px)",
  };

  const pinnedCtaStyle: CSSProperties = isDesktop
    ? { position: "sticky", top: `${stickyTopOffset}px` }
    : { position: "sticky", bottom: `${stickyBottomOffset}px` };

  const baseCtaStyle = isOpen ? pinnedCtaStyle : floatingCtaStyle;
  const shouldShowCta = isOpen || hasReachedTrigger;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!triggerId) {
      setHasReachedTrigger(true);
      return;
    }

    if (typeof window.IntersectionObserver !== "function") {
      setHasReachedTrigger(true);
      return;
    }

    const section = sectionRef.current;
    const target = (document.getElementById(triggerId) ?? section?.previousElementSibling) as
      | HTMLElement
      | null;

    if (!target) {
      setHasReachedTrigger(true);
      return;
    }

    const computeShouldActivate = (rect: DOMRect | DOMRectReadOnly) => {
      const viewportHeight = window.innerHeight || 0;
      const gap = viewportHeight - rect.bottom;
      const hasSpace = gap >= revealOffset;
      return hasSpace || rect.top < 0;
    };

    const evaluate = () => {
      const rect = target.getBoundingClientRect();
      setHasReachedTrigger(computeShouldActivate(rect));
    };

    evaluate();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        setHasReachedTrigger(computeShouldActivate(entry.boundingClientRect));
      },
      { threshold: INTERSECTION_THRESHOLDS },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [triggerId, revealOffset]);

  const scrollToChat = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const chatElement = document.getElementById(chatPanelId);
    if (!chatElement) {
      return;
    }
    const rect = chatElement.getBoundingClientRect();
    const offset = isDesktop ? 96 : 64;
    const target = Math.max(window.scrollY + rect.top - offset, 0);
    window.scrollTo({ top: target, behavior: "smooth" });
  }, [chatPanelId, isDesktop]);

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
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      scrollToChat();
    }
  }, [isOpen, scrollToChat]);

  const handlePrompt = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend],
  );

  const chatHasContent = shouldRender && displayPanel;

  const ctaOrderClass = chatHasContent ? "order-2" : "order-1";
  const chatOrderClass = chatHasContent ? "order-1" : "order-2";

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative mx-auto mt-12 flex w-full max-w-[760px] flex-col items-center gap-8 sm:gap-12",
        className,
      )}
    >
      <div aria-hidden className="order-first -mb-8 h-px w-full sm:-mb-12" />
      <div
        className={cn(
          "w-full transition-all duration-300 ease-out",
          chatOrderClass,
        )}
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
      <div ref={bottomRef} aria-hidden className="order-3 mt-16 h-px w-full" />
      <div
        className={cn(
          "mt-2 flex justify-center z-50",
          isOpen ? "w-full" : "w-auto",
          ctaOrderClass,
          "transition-opacity transition-transform duration-300 ease-out",
          "motion-reduce:transition-none motion-reduce:transform-none",
          shouldShowCta
            ? "pointer-events-auto opacity-100 translate-y-0 motion-reduce:translate-y-0"
            : "pointer-events-none opacity-0 translate-y-2 motion-reduce:translate-y-0",
        )}
        style={baseCtaStyle}
        aria-hidden={!shouldShowCta}
      >
        <AskCta
          ref={ctaRef}
          label={locale.ctaLabel}
          pressed={isOpen}
          onToggle={handleToggle}
          ariaControls={chatPanelId}
          tabIndex={shouldShowCta ? 0 : -1}
        />
      </div>
      <div aria-hidden className="order-last h-8 w-full sm:h-12" />
    </div>
  );
};
