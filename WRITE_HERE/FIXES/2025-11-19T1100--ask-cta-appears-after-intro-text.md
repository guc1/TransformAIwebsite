# Ask CTA appears after assistant intro text
_When:_ 2025-11-19 11:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **Request:** Only surface the Ask TransformAI button once visitors reach the "Ask questions, schedule a call…" lead-in on the homepage and hide it again when scrolling back above that section.
- **Fix:** Observed the intro copy via an IntersectionObserver so the CTA floats at the viewport bottom only after the text comes into view (or has been scrolled past) while keeping it pinned when the chat is open.
- **Files:** `apps/www/app/code-examples.tsx`, `apps/www/components/ask/StickyChat.tsx`, `apps/www/components/section.tsx`.
- **Follow-ups:** None.
