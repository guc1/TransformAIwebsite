# FIX.md — Requests & Resolutions Log

> Track **what the user wanted** and **how you fixed it** (technical detail).
> Always add a new entry at the **top**; reference files, functions, and rationale.

## 2025-09-22 — “Language picker crashes after submit”

- **User ask / Bug:** Selecting a language triggered a runtime error about a missing `next-intl` config file and kept the visitor on `/select-language`.
- **Root cause:** The Next.js config never registered the `next-intl` plugin, so the runtime alias for `next-intl/config` resolved to a stub that throws. The redirect response also used the default 307 status, causing the browser to repeat the POST against `/{locale}`.
- **Fix:**
  - Added a shared `loadMessages` helper and request configuration so Next Intl can hydrate translations with English fallbacks for `getTranslations` and the client provider.
  - Wrapped `next.config.mjs` with `createNextIntlPlugin` to register the runtime alias and reuse the new request config.
  - Switched the language selection redirect to a 303 so the follow-up request hits the localized page with a GET.
- **Files:** `apps/www/i18n/messages.ts`, `apps/www/i18n/request.ts`, `apps/www/i18n/routing.ts`, `apps/www/app/[locale]/layout.tsx`, `apps/www/next.config.mjs`, `apps/www/app/api/select-language/route.ts`
- **Follow-ups:** None.

## 2025-09-21 — “GET /select-language returns 405”

- **User ask / Bug:** Visiting `/select-language` produced an HTTP 405 instead of rendering the language picker because the request hit the cookie-setting route.
- **Root cause:** Next.js prioritized the colocated `route.ts` (with only a `POST` handler) over the page component, so GET requests never reached the React page.
- **Fix:**
  - Moved the locale persistence handler to `/api/select-language` so the `/select-language` page can serve GET traffic normally.
  - Pointed the selection form at the new endpoint, retaining the redirect logic after setting the locale cookie.
- **Files:** `apps/www/app/api/select-language/route.ts`, `apps/www/app/select-language/page.tsx`
- **Follow-ups:** None.

## 2025-09-20 — “Select-language redirect + missing html/body tags”

- **User ask / Bug:** Loading `/` produced a Next.js warning about missing `<html>`/`<body>` tags, and choosing a language on `/select-language` left the page instead of redirecting into the localized site.
- **Fix:**
  - Restored the root layout’s document wrapper, deriving the `lang` attribute from the `NEXT_LOCALE` cookie while keeping the locale layout focused on translations and shared chrome.
  - Reworked `app/[locale]/layout.tsx` to live inside the root `<html>/<body>` tree without duplicating markup.
  - Replaced the unreliable server action with a route handler that persists `NEXT_LOCALE` for one year and issues a redirect to the chosen locale, updating the selection page to post against it.
- **Files:** `apps/www/app/layout.tsx`, `apps/www/app/[locale]/layout.tsx`, `apps/www/app/select-language/page.tsx`, `apps/www/app/select-language/route.ts`
- **Follow-ups:** None.

## 2025-09-19 — “Implement next-intl i18n infrastructure”

- **User ask / Bug:** Add locale-prefixed routes, language selection flow, and fallback translations so the marketing site suppo
rts English and Dutch.
- **Fix:**
  - Introduced next-intl with a locale-aware root layout, message catalogs, and helper navigation utilities while moving all pag
    es under `app/[locale]/(site)`.
  - Added middleware-driven locale negotiation plus a `/select-language` server action to seed the `NEXT_LOCALE` cookie.
  - Created translation files with English fallback merging and documented the workflow in root/app `AGENTS.md`.
- **Files:** `apps/www/app/[locale]/layout.tsx`, `apps/www/app/select-language/page.tsx`, `apps/www/components/navbar/navigation.tsx`, `apps/www/components/footer/footer.tsx`, `apps/www/i18n/*`, `apps/www/messages/*`, `middleware.ts`, `apps/www/middleware.ts`, `AGENTS.md`, `apps/www/AGENTS.md`
- **Follow-ups:** Address pre-existing ESLint warnings surfaced by `next lint` to keep CI green.

## 2025-09-18 — “Stabilize www checks offline”

- **User ask / Bug:** Get `pnpm --filter www run typecheck`, `pnpm --filter www run lint`, and the website build passing without interactive prompts or external network access.
- **Root cause:** Content Collections artifacts were only generated during Next.js runs, asset imports lacked module typings, linting prompted for a config, and `/oss-friends` fetched remote data during static generation.
- **Fix:**
  - Added a reusable Content Collections build script that runs before TypeScript, declared common image modules, and documented the lean command set in root/app agent guides.
  - Introduced a minimal `.eslintrc.json` alongside `eslint`/`eslint-config-next` dev dependencies so `next lint` runs headlessly.
  - Migrated the Next config to an ESM plugin chain that skips build-time lint/type validation and made the OSS friends and template detail pages dynamic with guarded fetch logic for offline builds.
- **Files:** `AGENTS.md`, `apps/www/AGENTS.md`, `apps/www/package.json`, `apps/www/scripts/build-content-collections.mjs`, `apps/www/types/images.d.ts`, `apps/www/.eslintrc.json`, `apps/www/next.config.mjs`, `apps/www/app/oss-friends/page.tsx`, `apps/www/app/templates/[slug]/page.tsx`
- **Follow-ups:** None.

## 2025-09-17 — “Clarify website command recipes”

- **User ask / Bug:** Provide Codex with unambiguous website-specific install/check/build/dev commands and ensure they map to actual scripts.
- **Root cause:** Root `AGENTS.md` used broad workspace commands that could trigger unrelated builds, and `apps/www` lacked `typecheck`/`format` scripts to back the documented pnpm targets.
- **Fix:**
  - Replaced the root commands section with filtered pnpm/turbo invocations scoped to `apps/www`.
  - Added a commands quick reference to `apps/www/AGENTS.md` mirroring the documented workflow.
  - Renamed the package to `www` and implemented `typecheck` and `format` scripts in `apps/www/package.json` so the documented commands execute successfully.
- **Files:** `AGENTS.md`, `apps/www/AGENTS.md`, `apps/www/package.json`
- **Follow-ups:** None.

## 2025-10-30 — “Reset emails not sending”

- **User ask / Bug:** Password reset emails never arrive.
- **Root cause:** `SMTP_*` env vars not mapped in `next.config.js`; missing `await` in `sendPasswordResetEmail()`.
- **Fix:**
  - Mapped env vars in `next.config.js` and `.env.example`.
  - Added `await transporter.sendMail(...)` and error handling + retry with exponential backoff.
  - Logged `messageId` for observability.
- **Files:** `apps/www/lib/email.ts`, `apps/www/app/api/reset/route.ts`, `next.config.js`, `.env.example`
- **Follow-ups:** Add integration test using local SMTP stub.

## 2025-10-26 — “Gradient heading inconsistent in Safari”

- **User ask / Bug:** Gradient text renders dull in Safari.
- **Fix:** Switched to `background-clip:text` + `text-fill-color:transparent` fallback and ensured tokens use `--feature-9` / `--feature-11`.
- **Files:** `apps/www/components/SectionTitle.tsx`, `apps/www/styles/globals.css`
