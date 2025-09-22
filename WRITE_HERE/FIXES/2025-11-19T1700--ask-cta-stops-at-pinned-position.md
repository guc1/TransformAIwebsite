# Ask CTA stops at pinned position
_When:_ 2025-11-19 17:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Updated the sticky anchoring logic so the Ask TransformAI button remains at its pinned position while the chat is open instead of dropping to the bottom of the section when the boundary threshold is reached.
- **Why:** The CTA was sliding far down the page in its anchored state, causing a noticeable UI glitch; keeping it pinned fulfills the request to stop at the normal button location.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
