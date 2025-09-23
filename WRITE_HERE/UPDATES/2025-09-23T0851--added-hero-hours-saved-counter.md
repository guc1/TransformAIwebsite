# Added hero "Hours saved" counter to homepage hero
- **What:** Introduced a deterministic, client-side hours-saved counter between the primary hero CTAs with animated updates and localStorage persistence, including the supporting time series utilities and translations.
- **Why:** Highlight the cumulative impact of TransformAI's work while meeting the requirement for a live, non-decreasing metric without backend dependencies.
- **Files:** `apps/www/components/HeroHoursSaved.tsx`, `apps/www/components/hero/hero-main-section.tsx`, `apps/www/lib/timeSeries/hoursSaved.ts`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Monitor animation timing once deployed and adjust visual styling if the hero layout evolves.
