# Ask CTA scrolls naturally before sticking
_When:_ 2025-11-18 17:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **Request:** Make the Ask TransformAI button travel with the section instead of appearing pinned from the start while still stopping at the existing bottom anchor.
- **Fix:** Let the sticky helper expose scroll state so the CTA only sticks once the top sentinel leaves view, keep it flowing otherwise, and pin it while the chat is open so the panel stays stable.
- **Files:** `apps/www/components/ask/use-sticky-within-section.ts`, `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
