# Add pricing comparison table above tiers
_When:_ 2025-09-20 10:29 UTC · _Scope:_ apps/www · _Author:_ AI assistant

- Introduced a localized pricing comparison table component styled with the enterprise gradient, particle backdrop, and responsive accordion behavior above the existing tier cards.
- Wired new Pricing.Table translation keys in English and Dutch, including tier labels, pricing, category headings, feature rows, legend strings, and CTA copy for anchoring to individual tiers.
- Added anchors to each pricing card so the new comparison CTA buttons can scroll to the relevant tier, leaving existing tier layouts intact.

## Files
- apps/www/components/pricing/pricing-compare-table.tsx
- apps/www/app/[locale]/(site)/pricing/components.tsx
- apps/www/app/[locale]/(site)/pricing/page.tsx
- apps/www/messages/en.json
- apps/www/messages/nl.json
- WRITE_HERE/TASK_PLANNING/2025-09-20T1020--pricing-table.md

## Follow-ups
- Lint fails repository-wide due to pre-existing ESLint violations (see `pnpm --filter www run lint` output); address separately if prioritised.
