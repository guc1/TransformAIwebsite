# Ask CTA now travels before sticking
_When:_ 2025-11-18 09:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **Request:** The Ask TransformAI button should start beneath the section heading, follow the reader while scrolling, and only pin once it reaches the original bottom stop.
- **Fix:** Introduced a top sentinel and extended the sticky helper to delay the sticky-top state until the header anchor scrolls past the viewport, letting the CTA move naturally before sticking at the existing bottom anchor.
- **Files:** `apps/www/components/ask/use-sticky-within-section.ts`, `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** Monitor offsets across breakpoints in case the navbar height changes and re-tune the sticky thresholds if necessary.
