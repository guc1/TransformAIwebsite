# Pricing comparison table plan

## Scope
- Introduce a reusable pricing comparison table component for the /pricing page that mirrors the enterprise card aesthetics.
- Integrate the component above the existing tier cards without altering current tier markup or behavior.
- Localize all new strings (English source, Dutch translation, fallback-safe).
- Update write-ups/logs after implementation.

## Files to touch
- `apps/www/components/pricing/pricing-compare-table.tsx`
- `apps/www/app/[locale]/(site)/pricing/page.tsx`
- `apps/www/messages/en.json`
- `apps/www/messages/nl.json`
- `WRITE_HERE/UPDATES/*` (new entry post-implementation)

## Risks & mitigations
- **Layout shift / spacing conflicts:** Match existing section spacing utilities; test across breakpoints.
- **Overflow on mobile:** Implement responsive accordion or stacked layout; verify with dev tools.
- **Contrast or readability issues:** Reuse design tokens for gradients, text, and shadows; test in dark/light modes.
- **Particle performance / motion:** Reuse existing starfield component with `prefers-reduced-motion` safeguards.

## Test plan
- Visual spot-check in dev server at desktop (≥1280px), tablet (~834px), and mobile (~390px) widths.
- Verify light/dark themes render correctly.
- Use keyboard navigation to ensure table cells, tooltips, and buttons are accessible.
- Run `pnpm --filter www run lint` and `pnpm --filter www run typecheck`.

## Wireframes

### Desktop
```
[Section Heading: Compare plans]
 -------------------------------------------------------------
| Category | Tier 1 ($299) | Tier 2 ($799) | Tier 3 ($1,999) |
|----------|----------------|---------------|-----------------|
| Research header (sticky)                             |
| Analyze integrations | ✔ | ✔ | ✔ |
| Build custom model  | ✖ | △ note | ✔ |
| Explore research fields | ✖ | ✔ | ✔ |
| Education header                                      |
| Course V1 | ✔ | ✔ | ✔ |
| Course V2 | ✖ | ✔ | ✔ |
| Course V3 | ✖ | ✖ | ✔ |
| CTA row with buttons to tiers                         |
 -------------------------------------------------------------
```

### Tablet
- Same 3-column table with slightly reduced padding and font sizes.
- Sticky category headers remain; CTA row collapses to single-column buttons.

### Mobile
- Accordion per category (Research, Education).
- Inside each accordion, stack each feature with a mini 3-column grid showing tier availability and price context.
- CTA buttons stacked vertically below the table.

## Token & component reuse
- Background: reuse gradient utilities and starfield/particle SVG from the Enterprise pricing card component (check `apps/www/components/pricing`).
- Colors: use Tailwind classes referencing CSS variables (e.g., `bg-gradient-to-br from-brand-500/60 to-brand-300/40`, `text-white`, `text-muted-foreground`).
- Radius & shadows: apply existing `rounded-3xl`, `shadow-[...var?]` or reuse `card` utility classes from tier cards.
- Typography: align heading sizes with existing pricing section titles (`text-3xl`/`font-semibold` or relevant token).
- Icons: reuse lucide icons already in the project (`Check`, `X`, `Info` components via `lucide-react`).
- Motion: reuse `prefers-reduced-motion` utility classes or animation tokens from the enterprise card if available.

## i18n keys to add
- `Pricing.Table.title`
- `Pricing.Table.tiers.t1`, `.t2`, `.t3`
- `Pricing.Table.tiers.price.t1`, `.t2`, `.t3`
- `Pricing.Table.categories.research`, `.education`
- `Pricing.Table.rows.analyzeIntegrations`
- `Pricing.Table.rows.buildCustomModel`
- `Pricing.Table.rows.exploreResearch`
- `Pricing.Table.rows.courseV1`
- `Pricing.Table.rows.courseV2`
- `Pricing.Table.rows.courseV3`
- `Pricing.Table.legend.included`
- `Pricing.Table.legend.notIncluded`
- `Pricing.Table.headers.feature`
- `Pricing.Table.legend.partial`
- `Pricing.Table.rows.notes.buildCustomModel.limited`
- `Pricing.Table.cta.chooseTier1`
- `Pricing.Table.cta.chooseTier2`
- `Pricing.Table.cta.chooseTier3`
- `Pricing.Table.cta.scrollLabel`

