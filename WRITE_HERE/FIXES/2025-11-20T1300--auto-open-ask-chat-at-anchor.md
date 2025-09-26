# Auto-open Ask chat once anchor reached
_When:_ 2025-11-20 13:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Trigger the Ask TransformAI chat panel to open automatically whenever the floating CTA reaches its measured anchor position, keeping it visible until the visitor explicitly closes it while tracking dismissals so the button stays closed until the anchor is released.
- **Why:** Users noticed the CTA remained closed after settling at the anchor, forcing an extra click; auto-opening the chat at that point removes the sticky overlap and surfaces the conversation immediately.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
