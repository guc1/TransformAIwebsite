# Implemented next-intl i18n infrastructure
_When:_ 2025-09-19 09:00 · _Scope:_ apps/www, root · _Author:_ Legacy log

- **User ask / Bug:** Add locale-prefixed routes, language selection flow, and fallback translations so the marketing site suppo
rts English and Dutch.
- **Fix:**
  - Introduced next-intl with a locale-aware root layout, message catalogs, and helper navigation utilities while moving all pag
    es under `app/[locale]/(site)`.
  - Added middleware-driven locale negotiation plus a `/select-language` server action to seed the `NEXT_LOCALE` cookie.
  - Created translation files with English fallback merging and documented the workflow in root/app `AGENTS.md`.
- **Files:** `apps/www/app/[locale]/layout.tsx`, `apps/www/app/select-language/page.tsx`, `apps/www/components/navbar/navigation.tsx`, `apps/www/components/footer/footer.tsx`, `apps/www/i18n/*`, `apps/www/messages/*`, `middleware.ts`, `apps/www/middleware.ts`, `AGENTS.md`, `apps/www/AGENTS.md`
- **Follow-ups:** Address pre-existing ESLint warnings surfaced by `next lint` to keep CI green.
