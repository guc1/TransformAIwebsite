"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, Send, Sparkles, X } from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChatLocale, ChatMessage } from "./types";

type ChatPanelProps = {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  locale: ChatLocale;
  onClose: () => void;
  onSend: (value: string) => void;
  onUsePrompt: (prompt: string) => void;
  errorMessage: string | null;
  onRetry: () => void;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isOpen,
  isLoading,
  locale,
  onClose,
  onSend,
  onUsePrompt,
  errorMessage,
  onRetry,
}) => {
  const [input, setInput] = useState("");
  const [planeAnimating, setPlaneAnimating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const planeTimer = useRef<number>();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const baseId = useId();
  const headerId = `${baseId}-header`;
  const transcriptId = `${baseId}-transcript`;

  useReducedMotionWatcher(setPrefersReducedMotion);

  const resizeTextarea = useCallback((node: HTMLTextAreaElement | null) => {
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    if (!textareaRef.current) return;
    resizeTextarea(textareaRef.current);
  }, [input, resizeTextarea]);

  useEffect(() => {
    if (!isOpen) return;
    const node = textareaRef.current;
    const timeout = window.setTimeout(() => {
      node?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || active === container) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, messages.length, isLoading, errorMessage]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;

    const behavior = prefersReducedMotion ? "auto" : "smooth";
    transcript.scrollTo({ top: transcript.scrollHeight, behavior });
  }, [messages, isLoading, errorMessage, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (planeTimer.current) {
        window.clearTimeout(planeTimer.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(() => {
    const value = input.trim();
    if (!value || isLoading) {
      return;
    }
    animatePlane(planeTimer, setPlaneAnimating);
    setInput("");
    onSend(value);
  }, [input, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const showEmptyState = messages.length === 0 && !isLoading;

  const promptButtons = useMemo(
    () =>
      locale.emptyPrompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onUsePrompt(prompt)}
          disabled={isLoading}
          aria-label={`${locale.emptyAction}: ${prompt}`}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prompt}
        </button>
      )),
    [isLoading, locale.emptyAction, locale.emptyPrompts, onUsePrompt],
  );

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={120}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headerId}
        aria-describedby={transcriptId}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "flex h-full w-full max-w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/90 p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.35)] backdrop-blur-2xl transition-[opacity,transform] duration-300 ease-out",
          "opacity-0 scale-[0.98] data-[state=open]:opacity-100 data-[state=open]:scale-100 motion-reduce:transition-none",
          "max-h-[85vh] md:max-h-[560px]",
        )}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 via-sky-500 to-purple-500 p-[1px] shadow-[0_0_25px_rgba(56,189,248,0.25)]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-950">
                <Sparkles aria-hidden className="h-5 w-5 text-sky-100" />
              </div>
            </div>
            <div className="space-y-1">
              <p id={headerId} className="text-base font-semibold text-white">
                {locale.headerTitle}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span
                  role="status"
                  aria-label={locale.headerStatusA11y}
                  className="relative flex h-2 w-2 items-center justify-center"
                >
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400/70" aria-hidden />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                </span>
                <span>{locale.headerStatus}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            aria-label={locale.closeLabel}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div
          ref={transcriptRef}
          id={transcriptId}
          aria-live="polite"
          role="log"
          aria-label={locale.transcriptLabel}
          className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1"
        >
          {showEmptyState ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
              <p className="text-sm font-medium text-white/80">{locale.emptyTitle}</p>
              <div className="flex flex-wrap gap-3">{promptButtons}</div>
            </div>
          ) : null}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} locale={locale} />
          ))}

          {isLoading ? <TypingBubble label={locale.typingLabel} /> : null}

          {errorMessage ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100" role="alert">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/40 bg-red-500/20 text-red-200">
                <AlertTriangle className="h-4 w-4" aria-hidden />
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-red-100">{locale.errorTitle}</p>
                <p className="text-xs text-red-100/80">{locale.errorBody}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isLoading}
                  className="w-fit rounded-full border border-red-500/40 bg-transparent px-3 py-1 text-xs font-medium text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locale.retryLabel}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <form
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex items-start gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale.inputPlaceholder}
              rows={1}
              className="h-12 flex-1 resize-none rounded-2xl bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
              aria-label={locale.inputPlaceholder}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="submit"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-teal-400 via-sky-500 to-purple-500 text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={locale.inputTooltip}
                  disabled={isLoading || input.trim().length === 0}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send
                      aria-hidden
                      className={cn(
                        "h-4 w-4 transition duration-300",
                        planeAnimating ? "-rotate-12 translate-x-1" : "",
                      )}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-center text-xs text-white">
                {locale.inputTooltip}
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-[11px] text-white/40">
            <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-white/70">Enter</kbd>{" "}
            · {locale.inputSend}
            <span className="mx-1 text-white/30">|</span>
            <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-white/70">Shift</kbd> +
            <kbd className="ml-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-white/70">Enter</kbd>
          </p>
        </form>
      </div>
    </TooltipProvider>
  );
};

ChatPanel.displayName = "ChatPanel";

type MessageBubbleProps = {
  message: ChatMessage;
  locale: ChatLocale;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, locale }) => {
  if (message.role === "assistant") {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
          <Sparkles className="h-4 w-4 text-sky-100" aria-hidden />
        </div>
        <div className="max-w-full">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/60">{locale.assistantLabel}</p>
          <div className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-900/90 p-4 text-sm leading-relaxed text-white/90 shadow-[0_25px_60px_rgba(30,64,175,0.25)]">
            <p className="whitespace-pre-wrap text-left">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-auto flex max-w-[85%] flex-col items-end gap-2 text-right">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/60">{locale.userLabel}</p>
      <div className="w-full rounded-2xl bg-gradient-to-r from-teal-400 via-sky-500 to-purple-500 p-[1px] shadow-lg shadow-sky-500/25">
        <div className="rounded-[calc(theme(borderRadius.2xl)-1px)] bg-black/80 px-4 py-3 text-sm font-medium leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    </div>
  );
};

const TypingBubble: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
        <Sparkles className="h-4 w-4 text-sky-100" aria-hidden />
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-sm text-white/70">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-sky-500 to-purple-500 p-[1px]">
          <div className="flex h-full w-full items-center justify-center gap-1 rounded-full bg-neutral-950">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-white/70"
                style={{ animation: "chat-dot 1.2s ease-in-out infinite", animationDelay: `${index * 0.15}s` }}
              />
            ))}
          </div>
        </div>
        <span className="text-sm text-white/70">{label}</span>
      </div>
    </div>
  );
};

function useReducedMotionWatcher(setter: (value: boolean) => void) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (event: MediaQueryListEvent | MediaQueryList) => {
      setter(event.matches);
    };
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
  }, [setter]);
}

function animatePlane(timer: MutableRefObject<number | undefined>, setAnimating: (value: boolean) => void) {
  window.clearTimeout(timer.current);
  setAnimating(true);
  timer.current = window.setTimeout(() => {
    setAnimating(false);
  }, 360);
}
