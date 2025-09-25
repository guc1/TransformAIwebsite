# Smoothed Ask TransformAI CTA scroll experience
_When:_ 2025-11-17 12:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **Request:** Refine the Ask TransformAI CTA so its active color matches the standard gradient, automatically align the viewport when the chat opens, and keep the button visible at the top of the section while the chat is closed.
- **Fix:** Added a gradient-filled active state for the CTA, introduced smooth scroll-to-chat behavior when opening, and made the CTA sticky near the section header on desktop until reaching its resting position.
- **Files:** `apps/www/components/ask/AskCta.tsx`, `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** Monitor how the sticky CTA feels on smaller breakpoints and refine offsets if design feedback requests tighter alignment.
