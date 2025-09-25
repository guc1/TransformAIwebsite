# Ask CTA floats with section scroll before anchoring
_When:_ 2025-11-18 20:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **Request:** Make the Ask TransformAI button travel with the section, floating alongside the viewport during scroll until it reaches the bottom anchor, similar to the referenced OpenAI Codex upgrades page.
- **Fix:** Track when the section heading enters view and switch the CTA container to a sticky-bottom position after the reader passes the top sentinel so it rides the viewport until the section's bottom stop while still pinning when the chat panel is open.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
