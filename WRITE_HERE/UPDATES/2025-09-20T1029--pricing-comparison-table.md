# Add pricing comparison table above tiers
_When:_ 2025-09-20 10:29 UTC · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Introduced a gradient-backed pricing comparison table with responsive accordion fallback, wired it into `/pricing`, and localized all copy for English and Dutch including CTA anchors to each tier card.
- **Why:** Surfaces a quick side-by-side view of plan capabilities before the detailed tiers, improving clarity for prospects across devices.
- **Files:** `apps/www/components/pricing/pricing-compare-table.tsx`, `apps/www/app/[locale]/(site)/pricing/page.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Ensure shared environments install `next-intl` so lint/typecheck/dev commands succeed without missing-module errors.
