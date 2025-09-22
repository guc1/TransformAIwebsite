# Ask CTA releases before projects heading
_When:_ 2025-11-19 15:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Adjusted the Ask TransformAI sticky logic so the panel stops sticking roughly 100px sooner, hiding the CTA once it crosses the projects heading boundary.
- **Why:** The previous anchoring held the CTA too long near the projects section and produced glitchy behavior; releasing a bit earlier keeps the scroll experience smooth.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
