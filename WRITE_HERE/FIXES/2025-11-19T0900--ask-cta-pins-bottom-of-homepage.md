# Ask CTA pins to the bottom of the homepage
_When:_ 2025-11-19 09:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **Request:** Keep the "Ask TransformAI" button visible along the entire homepage and send visitors to the chat section when it is pressed.
- **Fix:** Replaced the section-based sticky logic with a floating style that fixes the CTA near the viewport bottom until the panel is opened, while retaining the existing scroll-to-chat behaviour when toggled.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
