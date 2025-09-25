# Resolved layout collisions on refreshed AI protection and budget cards
_When:_ 2025-09-30 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Resolve layout collisions on the refreshed AI protection and budget cards by tightening chip placement, cleaning the overlays, and keeping the text and code blocks readable on every breakpoint.
- **Fix:**
  - Established bottom-left safe zones with subtle gradients, repositioned the compliance chips along the radar rings, and softened their scale so they stay clear of the heading copy.
  - Rebuilt the budget preview into a fixed seven-line code pane with highlighted keys, reorganized the credits meter row so the project pill (now “#22”) sits flush right, and widened pill padding to prevent truncation.
- **Files:** `apps/www/components/ip-whitelisting-bento.tsx`, `apps/www/components/rate-limits-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.
