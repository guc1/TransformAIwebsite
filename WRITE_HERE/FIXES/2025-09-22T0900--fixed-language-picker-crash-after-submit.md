# Fixed language picker crash after submit
_When:_ 2025-09-22 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Selecting a language triggered a runtime error about a missing `next-intl` config file and kept the visitor on `/select-language`.
- **Root cause:** The Next.js config never registered the `next-intl` plugin, so the runtime alias for `next-intl/config` resolved to a stub that throws. The redirect response also used the default 307 status, causing the browser to repeat the POST against `/{locale}`.
- **Fix:**
  - Added a shared `loadMessages` helper and request configuration so Next Intl can hydrate translations with English fallbacks for `getTranslations` and the client provider.
  - Wrapped `next.config.mjs` with `createNextIntlPlugin` to register the runtime alias and reuse the new request config.
  - Switched the language selection redirect to a 303 so the follow-up request hits the localized page with a GET.
- **Files:** `apps/www/i18n/messages.ts`, `apps/www/i18n/request.ts`, `apps/www/i18n/routing.ts`, `apps/www/app/[locale]/layout.tsx`, `apps/www/next.config.mjs`, `apps/www/app/api/select-language/route.ts`
- **Follow-ups:** None.
