# Ask CTA fades in when intro has room
_When:_ 2025-11-19 12:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Adjusted the Ask TransformAI sticky CTA so it measures its height, waits until the intro copy has enough viewport space before appearing, and fades in/out with a subtle translate while staying keyboard-accessible only when visible.
- **Why:** The user wanted the button to surface only once there was sufficient distance between the intro text and the bottom of the viewport, with a smooth fade animation instead of an abrupt toggle.
- **Files:** `apps/www/components/ask/StickyChat.tsx`, `apps/www/components/ask/AskCta.tsx`.
- **Follow-ups:** None.
