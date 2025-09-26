# Implemented next-intl routing and localization infrastructure
_When:_ 2025-09-19 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- Added next-intl powered routing with locale-prefixed segments, middleware-based language negotiation, and a first-visit langu
age selection screen for the marketing site.
- Restructured `apps/www/app` into `app/[locale]/(site)` with locale-aware layouts, message catalogs, and navigation helpers to
 support English/Dutch content with automatic fallback handling.
