"use client";

import { cn } from "@/lib/utils";
import { Send, Sparkles, User, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "./types";

type ChatPanelStrings = {
  title: string;
  status: string;
  close: string;
  assistantLabel: string;
  userLabel: string;
  placeholder: string;
  send: string;
  sendTooltip: string;
  typing: string;
  emptyTitle: string;
  emptyDescription: string;
  suggestions: string[];
  error: string;
  rateLimited: string;
  unauthorized: string;
  retry: string;
  transcriptLabel: string;
  intro: string;
};

type ChatPanelProps = {
  isOpen: boolean;
  messages: ChatMessage[];
  onSend: (value: string, options?: { retry?: boolean }) => Promise<void> | void;
  onRetry: () => Promise<void> | void;
  onClose: () => void;
  isTyping: boolean;
  error: string | null;
  strings: ChatPanelStrings;
};

const focusableSelector =
  "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  messages,
  onSend,
  onRetry,
  onClose,
  isTyping,
  error,
  strings,
}) => {
  const [value, setValue] = useState("");
  const [planeActive, setPlaneActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const focusScopeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const hasMessages = messages.length > 0;

  const resetTextareaHeight = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      resetTextareaHeight();
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [isOpen, resetTextareaHeight]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scope = focusScopeRef.current;
    if (!scope) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        scope.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null || element === document.activeElement);

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) {
      return;
    }

    const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: scrollBehavior });
  }, [messages, isTyping, prefersReducedMotion]);

  useEffect(() => {
    if (!planeActive) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPlaneActive(false);
    }, 420);

    return () => window.clearTimeout(timeout);
  }, [planeActive]);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || isTyping) {
      return;
    }

    try {
      setPlaneActive(true);
      await onSend(trimmed);
      setValue("");
      resetTextareaHeight();
    } catch (error) {
      console.error(error);
    }
  }, [isTyping, onSend, resetTextareaHeight, value]);

  const handleFormSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      void handleSubmit();
    },
    [handleSubmit],
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const handleInput: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setValue(event.target.value);
    window.requestAnimationFrame(resetTextareaHeight);
  };

  const handleSuggestion = (suggestion: string) => {
    setValue(suggestion);
    window.requestAnimationFrame(resetTextareaHeight);
    inputRef.current?.focus({ preventScroll: true });
  };

  const disableSend = !value.trim() || isTyping;

  const transcriptId = useIdWithPrefix("ask-transcript");

  return (
    <div
      ref={focusScopeRef}
      className={cn(
        "relative flex w-full max-w-[760px] flex-col gap-4 rounded-3xl border border-white/10 bg-neutral-950/90 p-4 text-sm text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-300 sm:p-6",
        "data-[open=false]:pointer-events-none data-[open=false]:opacity-0 data-[open=false]:scale-[0.98]",
        "data-[open=true]:opacity-100 data-[open=true]:scale-100",
        "motion-reduce:transition-none motion-reduce:data-[open=false]:scale-100",
      )}
      data-open={isOpen}
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
      aria-labelledby={`${transcriptId}-title`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white/70" aria-hidden />
          <div className="flex flex-col">
            <span id={`${transcriptId}-title`} className="text-sm font-semibold">
              {strings.title}
            </span>
            <span className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" aria-hidden />
              {strings.status}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label={strings.close}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="relative flex min-h-[220px] flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-white/5 bg-black/60 px-4 py-5"
        role="log"
        aria-live="polite"
        aria-label={strings.transcriptLabel}
      >
        {hasMessages ? (
          <ul className="flex flex-col gap-4" aria-live="off">
            {messages.map((message) => (
              <li key={message.id} className="flex flex-col gap-2">
                <RoleLabel role={message.role} strings={strings} />
                <MessageBubble role={message.role} content={message.content} />
              </li>
            ))}
            {isTyping ? (
              <li className="flex flex-col gap-2">
                <RoleLabel role="assistant" strings={strings} />
                <TypingIndicator label={strings.typing} />
              </li>
            ) : null}
          </ul>
        ) : (
          <EmptyState strings={strings} onSuggestion={handleSuggestion} />
        )}
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="flex flex-col gap-3"
        noValidate
      >
        {error ? (
          <div className="flex items-center justify-between rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                void onRetry();
              }}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/80 transition hover:text-white"
            >
              {strings.retry}
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/70 px-4 py-3">
          <label htmlFor={`${transcriptId}-input`} className="sr-only">
            {strings.placeholder}
          </label>
          <textarea
            id={`${transcriptId}-input`}
            ref={inputRef}
            className="min-h-[44px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-white placeholder:text-white/40 focus-visible:outline-none"
            placeholder={strings.placeholder}
            value={value}
            onKeyDown={handleKeyDown}
            onChange={handleInput}
            rows={1}
          />
          <button
            type="submit"
            disabled={disableSend}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              disableSend ? "cursor-not-allowed opacity-60" : "",
            )}
            title={strings.sendTooltip}
            aria-label={strings.send}
          >
            <Send
              aria-hidden
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                planeActive && !prefersReducedMotion ? "ask-plane" : "",
              )}
            />
          </button>
        </div>
        {hasMessages ? null : (
          <SuggestionList
            suggestions={strings.suggestions}
            onSuggestion={handleSuggestion}
          />
        )}
      </form>
    </div>
  );
};

type RoleLabelProps = {
  role: ChatMessage["role"];
  strings: Pick<ChatPanelStrings, "assistantLabel" | "userLabel">;
};

const RoleLabel: React.FC<RoleLabelProps> = ({ role, strings }) => {
  const isAssistant = role === "assistant";
  return (
    <span
      className={cn(
        "flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-2xs font-medium uppercase tracking-[0.08em]",
        isAssistant
          ? "border-white/15 bg-white/5 text-white/80"
          : "border-white/10 bg-white/10 text-white",
      )}
    >
      {isAssistant ? (
        <Sparkles className="h-3 w-3" aria-hidden />
      ) : (
        <User className="h-3 w-3" aria-hidden />
      )}
      {isAssistant ? strings.assistantLabel : strings.userLabel}
    </span>
  );
};

type MessageBubbleProps = {
  role: ChatMessage["role"];
  content: string;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "max-w-[90%] rounded-3xl text-sm leading-relaxed",
        isUser
          ? "ml-auto hero-hiring-gradient p-[1.5px]"
          : "border border-white/10 bg-neutral-900/70 p-[1.5px]",
      )}
    >
      <div
        className={cn(
          "rounded-[inherit] px-4 py-3 text-sm",
          isUser
            ? "bg-gradient-to-r from-sky-500/30 via-blue-500/25 to-indigo-500/30 text-white shadow-[0_20px_40px_rgba(32,56,123,0.45)]"
            : "bg-black/70 text-white/85 shadow-[0_16px_40px_rgba(2,10,38,0.45)]",
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">{content}</p>
      </div>
    </div>
  );
};

type EmptyStateProps = {
  strings: Pick<
    ChatPanelStrings,
    "emptyTitle" | "emptyDescription" | "suggestions" | "intro" | "assistantLabel"
  >;
  onSuggestion: (suggestion: string) => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({ strings, onSuggestion }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div className="max-w-[420px] space-y-3">
        <span className="mx-auto flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-2xs font-medium uppercase tracking-[0.08em] text-white/80">
          <Sparkles className="h-3 w-3" aria-hidden />
          {strings.assistantLabel}
        </span>
        <p className="text-base font-semibold text-white">{strings.emptyTitle}</p>
        <p className="text-sm text-white/70">{strings.emptyDescription}</p>
        <p className="text-sm text-white/80">{strings.intro}</p>
      </div>
      <SuggestionList suggestions={strings.suggestions} onSuggestion={onSuggestion} />
    </div>
  );
};

type SuggestionListProps = {
  suggestions: string[];
  onSuggestion: (suggestion: string) => void;
};

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onSuggestion }) => {
  const items = useMemo(() => suggestions.slice(0, 4), [suggestions]);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSuggestion(suggestion)}
          className="hero-hiring-gradient p-[1.5px] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-3 w-3 text-white/70" aria-hidden />
            {suggestion}
          </span>
        </button>
      ))}
    </div>
  );
};

type TypingIndicatorProps = {
  label: string;
};

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ label }) => {
  return (
    <div className="flex w-fit items-center gap-3 rounded-full border border-white/10 bg-black/70 px-3 py-2">
      <span className="hero-hiring-gradient flex h-9 w-9 items-center justify-center rounded-full p-[1.5px]">
        <span className="flex h-full w-full items-center justify-center gap-1 rounded-full bg-black/80 px-2">
          <span className="ask-typing-dot" aria-hidden />
          <span className="ask-typing-dot" aria-hidden style={{ animationDelay: "0.12s" }} />
          <span className="ask-typing-dot" aria-hidden style={{ animationDelay: "0.24s" }} />
        </span>
      </span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
};

function useIdWithPrefix(prefix: string) {
  const id = useId();
  return `${prefix}-${id}`;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

export type { ChatPanelStrings };
