# Anchored Ask TransformAI sticky header
_When:_ 2025-09-22 06:51 UTC · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Added a boundary anchor for the Ask TransformAI sticky experience so the chat panel and CTA release above the projects SectionTitle, using layout-based scroll detection to switch the CTA from fixed to in-flow positioning.
- **Why:** The sticky header previously remained pinned for the entire page, covering content past the "Explore the projects we’ve been part of" section; anchoring preserves the intended spacing above that text.
- **Files:** `apps/www/app/code-examples.tsx`, `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
