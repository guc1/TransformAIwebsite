# Ask CTA waits for scroll before pinning
_When:_ 2025-11-19 09:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Gated the bottom anchor detection behind the top sentinel so the Ask CTA remains in normal flow until the user scrolls past the heading, and pinned it while open to keep the chat steady.
- **Why:** Prevented the CTA from jumping straight to its bottom stop on load and kept it anchored during active chats to match the requested travel behaviour.
- **Files:** `apps/www/components/ask/use-sticky-within-section.ts`, `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
