# Clamped Ask CTA to open-state anchor
_When:_ 2025-11-20 09:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Introduced an anchor sentinel and scroll listener so the floating Ask TransformAI CTA transitions into the same sticky position it occupies when the chat is open, including on resize. Latched the scroll detection so once the anchor is reached the CTA remains pinned there until the user scrolls back above the threshold, eliminating the upward jump.
- **Why:** The button could drift past its intended stop and overlap the following section whenever the chat was closed; clamping it to the measured open-state anchor keeps it aligned.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
