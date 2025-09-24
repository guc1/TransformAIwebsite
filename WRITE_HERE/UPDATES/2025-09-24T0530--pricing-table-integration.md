# Integrated pricing comparison with hero aesthetic
- **What:** Restyled the pricing comparison table to mirror the hero's glassmorphism, added a dedicated information column with hover tooltip, and refreshed responsiveness across desktop and mobile.
- **Why:** Aligns the pricing grid with the refreshed header for a cohesive, conversion-focused experience while providing clearer coverage cues for each package.
- **Files:** `apps/www/components/pricing/pricing-compare-table.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Audit global lint debt so `pnpm --filter www run lint` can pass without unrelated errors.
