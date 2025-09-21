"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { ChatPanel, type ChatPanelStrings } from "./ChatPanel";
import { useStickyWithinSection } from "./useStickyWithinSection";
import type { ChatMessage } from "./types";

type StickyChatProps = {
  isOpen: boolean;
  onClose: () => void;
  focusReturnRef: RefObject<HTMLButtonElement>;
  strings: ChatPanelStrings;
};

export const StickyChat: React.FC<StickyChatProps> = ({
  isOpen,
  onClose,
  focusReturnRef,
  strings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const pendingRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      pendingRequestRef.current?.abort();
    };
  }, []);

  const stickyState = useStickyWithinSection(
    { topRef: topSentinelRef, bottomRef: bottomSentinelRef },
    { topOffset: 96 },
  );

  const sendMessage = useCallback(
    async (content: string, { retry = false }: { retry?: boolean } = {}) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      setError(null);

      let nextMessages = messagesRef.current;

      if (!retry) {
        const userMessage: ChatMessage = {
          id: nanoid(),
          role: "user",
          content: trimmed,
        };
        nextMessages = [...messagesRef.current, userMessage];
        messagesRef.current = nextMessages;
        setMessages(nextMessages);
      } else if (!nextMessages.some((message) => message.role === "user")) {
        return;
      }

      setIsTyping(true);

      const controller = new AbortController();
      pendingRequestRef.current?.abort();
      pendingRequestRef.current = controller;

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages.map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            setError(strings.rateLimited);
          } else if (response.status === 401) {
            setError(strings.unauthorized);
          } else {
            setError(strings.error);
          }
          return;
        }

        const data = (await response.json()) as { message?: string };
        const assistantText = data.message?.trim();

        if (assistantText) {
          const assistantMessage: ChatMessage = {
            id: nanoid(),
            role: "assistant",
            content: assistantText,
          };
          setMessages((previousMessages) => {
            const updated = [...previousMessages, assistantMessage];
            messagesRef.current = updated;
            return updated;
          });
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error(error);
        setError(strings.error);
      } finally {
        if (pendingRequestRef.current === controller) {
          pendingRequestRef.current = null;
        }
        setIsTyping(false);
      }
    },
    [strings.error, strings.rateLimited, strings.unauthorized],
  );

  const handleRetry = useCallback(async () => {
    const lastUserMessage = [...messagesRef.current]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      return;
    }

    await sendMessage(lastUserMessage.content, { retry: true });
  }, [sendMessage]);

  const handleClose = useCallback(() => {
    onClose();
    focusReturnRef.current?.focus({ preventScroll: true });
  }, [focusReturnRef, onClose]);

  return (
    <div className="relative w-full">
      <div ref={topSentinelRef} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div
        className="relative w-full min-h-[26rem] sm:min-h-[28rem] pt-2 sm:pt-4 pb-12 sm:pb-16"
        aria-hidden={false}
      >
        <div className="transition-transform duration-300 sm:sticky sm:top-24"
          data-bottom={stickyState.isAtBottom}
          data-sticky={stickyState.isSticky}
        >
          <ChatPanel
            isOpen={isOpen}
            messages={messages}
            onSend={(value) => sendMessage(value)}
            onRetry={handleRetry}
            onClose={handleClose}
            isTyping={isTyping}
            error={error}
            strings={strings}
          />
        </div>
      </div>
      <div ref={bottomSentinelRef} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px" />
    </div>
  );
};

export type { StickyChatProps };
