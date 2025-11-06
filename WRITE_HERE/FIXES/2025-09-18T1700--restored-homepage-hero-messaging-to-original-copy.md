# Restored homepage hero messaging to original copy
_When:_ 2025-09-18 17:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Keep the updated hero layout and localized CTAs but revert the hero heading and paragraph to the original English/Dutch “Transformation Partner” messaging.
- **Fix:**
  - Replaced the `Hero.title`/`Hero.body` strings in the English and Dutch catalogs with the original copy while leaving the component wiring and CTA localization intact.
  - Recorded the change in the project logs for future reference.
- **Files:** `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`, `FIX.md`.
- **Follow-ups:** None.
