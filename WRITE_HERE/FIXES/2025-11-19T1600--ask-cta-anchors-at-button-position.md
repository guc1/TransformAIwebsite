# Ask CTA anchors at button position
_When:_ 2025-11-19 16:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Removed the extra 100px scroll buffer from the Ask TransformAI sticky calculation so the chat and CTA release exactly at the button’s natural anchor point.
- **Why:** The CTA was stopping short of its intended anchor after the prior buffer tweak; aligning the threshold with the button’s resting position meets the user’s request.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
