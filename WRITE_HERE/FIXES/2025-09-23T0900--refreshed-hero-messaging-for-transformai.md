# Refreshed hero messaging for TransformAI
_When:_ 2025-09-23 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Replace the homepage hero headline and supporting paragraph with the new TransformAI positioning in English and Dutch.
- **Fix:**
  - Added a `Hero` namespace to the locale message catalogs and passed the translated strings into the hero component via `next-intl`.
  - Swapped the static landing metadata for a locale-aware generator so open graph and SEO descriptions follow the updated copy.
- **Files:** `apps/www/components/hero/hero.tsx`, `apps/www/components/hero/hero-main-section.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `apps/www/app/[locale]/(site)/page.tsx`
- **Follow-ups:** None.
