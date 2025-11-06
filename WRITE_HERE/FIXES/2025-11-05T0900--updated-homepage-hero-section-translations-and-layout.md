# Updated homepage hero section translations and layout
_When:_ 2025-11-05 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Raise the homepage hero copy block closer to the hero background while replacing its heading, body, and CTA labels with localized English/Dutch strings.
- **Fix:**
  - Added the new hero messaging under `Hero.title`/`Hero.body` in the locale catalogs and updated the hero component to read the CTA labels from the existing translation namespace.
  - Replaced the hard-coded hero copy on the landing page with the translation helper and reduced the section’s top margin so the heading/button stack sits higher across breakpoints, polishing the Dutch “Explore All projects” label.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hero-main-section.tsx`, `apps/www/components/hero/hero.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.
