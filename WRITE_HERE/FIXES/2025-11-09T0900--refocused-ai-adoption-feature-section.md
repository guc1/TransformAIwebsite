# Refocused AI adoption feature section
_When:_ 2025-11-09 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Replace the “Leveled-up API development” heading and nine Unkey-era feature boxes with new AI adoption messaging and lucide icons, localized for English and Dutch visitors.
- **Fix:** Wired a dedicated `FeatureSection` translation namespace for the heading, paragraph, and feature copy, passed the translated data into the grid with the requested lucide icons, and preserved the legacy feature markup for future reuse while updating the section title rendering.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/feature/feature-grid.tsx`, `apps/www/components/feature/feature.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`, `FIX.md`.
- **Follow-ups:** None.
