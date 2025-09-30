# Ask CTA stays centered during chat transitions
_When:_ 2025-11-21 20:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Updated the sticky chat CTA positioning logic to use a single centering style across floating, anchored, and pinned states so the button no longer shifts horizontally when the assistant opens automatically or by click.
- **Why:** The Ask TransformAI button visibly jumped toward the left edge as the chat panel mounted, which made the interaction feel glitchy.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
