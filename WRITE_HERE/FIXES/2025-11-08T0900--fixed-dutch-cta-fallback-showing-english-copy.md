# Fixed Dutch CTA fallback showing English copy
_When:_ 2025-11-08 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** The lower homepage CTA still rendered the English heading and paragraph when visiting the Dutch locale.
- **Fix:**
  - Updated the locale landing page to pass the active locale into each `getTranslations` call so the section resolves Dutch messages instead of the English fallback.
  - Recorded the change in the project history files for future agents.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `UPDATE.md`, `FIX.md`.
- **Follow-ups:** None.
