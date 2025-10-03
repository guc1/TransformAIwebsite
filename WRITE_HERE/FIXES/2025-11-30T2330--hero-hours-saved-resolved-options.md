# Align hero ticker with resolved formatter options

## What
- serialize the hero hours-saved formatter's resolved options on the server and pass them through the hero props
- recreate the formatter on the client with the same locale, numbering system, and rounding settings before animating updates

## Why
- avoid hydration mismatches triggered by environment-specific Intl defaults after refreshing the homepage

## Files
- apps/www/app/[locale]/(site)/page.tsx
- apps/www/components/hero/hero.tsx
- apps/www/components/hero/hero-main-section.tsx
- apps/www/components/hero/hours-saved-ticker.tsx

## Follow-ups
- verify future ticker visual refinements continue to reuse the shared formatter options across server and client
