# Decoupled hero copy for stacked sections
_When:_ 2025-11-06 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Keep the top-of-page hero text on the original “Transformation Partner” messaging while letting the lower CTA section display the new AI productivity copy; both blocks were sharing the same translation keys so they changed together.
- **Fix:**
  - Added `secondaryTitle`/`secondaryBody` keys to the hero translations in English and Dutch so the secondary CTA block can render the new messaging independently.
  - Pointed the landing page’s lower `SectionTitle` at the new keys while leaving the hero component wired to `Hero.title`/`Hero.body` for the original copy.
- **Files:** `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `apps/www/app/[locale]/(site)/page.tsx`, `UPDATE.md`, `FIX.md`.
- **Follow-ups:** None.
