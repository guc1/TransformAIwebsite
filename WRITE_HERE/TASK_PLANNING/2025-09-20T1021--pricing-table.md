# Pricing comparison table plan

## Scope
- Introduce a reusable pricing comparison table component with gradient backdrop and particle layer inspired by the enterprise card.
- Wire the component into `/pricing` above existing tier cards without modifying current pricing card layout or logic.
- Define structured data for tiers/categories/rows and power copy via new i18n keys (EN + NL with EN fallback).
- Ensure responsive behaviors: full table on desktop/tablet, accordion-style stacks on mobile, respecting reduced motion preferences.

## Files to touch
- `apps/www/components/pricing/pricing-compare-table.tsx` (new component & styles).
- `apps/www/app/[locale]/(site)/pricing/page.tsx` (import + placement, optional CTA anchors).
- `apps/www/messages/en.json` & `apps/www/messages/nl.json` (new translation keys).
- `WRITE_HERE/UPDATES/` (log change after completion).

## Risks & mitigations
- **Layout shift / page rhythm**: match container widths & spacing tokens used by tier grid; test on initial load to avoid CLS.
- **Overflow on mobile**: use CSS grid with minmax + accordion to prevent horizontal scroll; verify across breakpoints.
- **Contrast & readability**: stick to white text, gray tokenized prices, and ensure gradient/particles do not overpower content; check in light mode too.
- **Performance / reduced motion**: disable particle animation when `prefers-reduced-motion` is set; reuse existing particle component responsibly.

## Test plan
- Visual spot-check in dev server (desktop/tablet/mobile sizes via responsive mode).
- `pnpm --filter www run lint`.
- `pnpm --filter www run typecheck`.
- `pnpm --filter www run build --filter=www` (if time permits; otherwise ensure no build regressions via typecheck/lint + component review).

## Wireframes
### Desktop
- Section header “Compare plans” centered above table.
- Gradient container with subtle particles.
- Table layout: first column (feature names) left-aligned, three equal plan columns with tier name + price chips + CTA buttons underneath.
- Category headers as sticky row separators spanning all columns.

### Tablet
- Same 4-column table but tighter padding and reduced font sizes; CTAs align under headers.
- Category headers remain sticky; ensure columns collapse gracefully within max width.

### Mobile
- Accordion per category; trigger shows category name.
- Accordion content: feature list with each item showing tier availability in a 3-column mini-grid beneath the feature name (stacked rows, no horizontal scroll).
- Optional inline CTA buttons per tier stacked at bottom of table.

## Token & component reuse
- Colors: reuse enterprise gradient `from-[#02DEFC] via-[#0239FC] to-[#7002FC]` and purple highlights already used in pricing card.
- Radii: apply `rounded-4xl` / `rounded-3xl` tokens consistent with enterprise card corners.
- Shadows: reuse soft shadow utility from shiny/enterprise cards (e.g., `shadow-[0_0_40px_rgba(32,8,72,0.45)]` if available; otherwise use existing tokenized `shadow-[...]/shadow-glow`).
- Background: leverage existing `Particles` component for starfield; gate with reduced-motion check.
- Typography: use section title styles & existing text classes (`section-title-heading-gradient`, `text-white/60`, `font-semibold`).
- Buttons: prefer `@/components/button` primary/ghost variants for CTA anchors.

## i18n keys to add (`Pricing.Table.*`)
- `Pricing.Table.title`
- `Pricing.Table.tiers.t1`, `.t2`, `.t3`
- `Pricing.Table.tiers.price.t1`, `.t2`, `.t3`
- `Pricing.Table.categories.research`, `.education`
- Row labels: `.rows.analyzeIntegrations`, `.rows.buildCustomModel`, `.rows.exploreResearch`, `.rows.courseV1`, `.rows.courseV2`, `.rows.courseV3`
- Availability labels: `.availability.included`, `.availability.notIncluded`, `.availability.partial`
- Notes: `.notes.limitedScope`, `.notes.fullSupport` (for tooltips/footnotes as needed)
- CTA labels: `.cta.chooseT1`, `.cta.chooseT2`, `.cta.chooseT3`
- Column label: `.columns.features`
