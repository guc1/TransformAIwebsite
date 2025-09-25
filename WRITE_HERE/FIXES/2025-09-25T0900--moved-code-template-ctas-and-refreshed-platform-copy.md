# Moved code template CTAs and refreshed platform copy
_When:_ 2025-09-25 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Relocate the “Get Started” and “Visit the docs” buttons so they sit beneath the code template selector, update their English and Dutch labels, refresh the AI assistant and platform section copy, and rename the analytics “Show API code” control.
- **Fix:**
  - Rebuilt the code example CTA layout to place the buttons below the language tabs and sourced their labels from a shared CTA translation namespace.
  - Localized the assistant headline, platform messaging, and analytics toggle with the new English/Dutch copy while updating the docs CTA text site-wide.
- **Files:** `apps/www/app/code-examples.tsx`, `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/analytics/analytics-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.
