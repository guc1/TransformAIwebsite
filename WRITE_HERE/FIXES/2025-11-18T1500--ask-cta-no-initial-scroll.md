# Ask CTA no longer steals initial scroll
_When:_ 2025-11-18 15:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **Request:** Loading the page should keep the viewport at the top instead of jumping straight to the Ask TransformAI button while still letting the CTA travel with the reader.
- **Fix:** Tracked whether the chat has been opened before returning focus to the button so it only moves focus (and scroll) after a close event, leaving the initial page load anchored at the top.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
