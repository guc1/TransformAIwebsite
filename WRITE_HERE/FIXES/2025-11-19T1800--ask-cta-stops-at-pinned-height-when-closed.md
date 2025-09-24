# Ask CTA stops at pinned height when closed
_When:_ 2025-11-19 18:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Adjusted the anchored CTA logic so the Ask TransformAI button pins to the same top offset whether or not the chat is open and keeps rendering after the boundary is reached.
- **Why:** The sticky CTA slid well past its intended location when closed, causing visible glitches; clamping it to the pinned height fulfills the request that it stop at the open-state position.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
