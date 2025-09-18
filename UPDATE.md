# UPDATE.md — Project Change Log

> Append a new dated entry at the **top** for every meaningful change. Keep it short, factual, and useful for future agents.

## 2025-11-02

- Rebuilt the rate limits card stack so the JSON pane stays visible with a seven-line cap, the credits row anchors the “project 22” pill, and the heading block sits cleanly beneath the limit badge.

## 2025-11-01

- Updated the AI protection and budget cards so the security heading reads “AI Data Protection” and the credits, rate limit, and project pill stack cleanly without clipping at any breakpoint.

## 2025-10-31

- Rebalanced the AI protection and team budgets cards by anchoring policy chips outside the text safe area, deepening the supporting gradients, fixing the JSON viewer height, and aligning the credits row with its project pill so nothing collides across breakpoints.

## 2025-09-30

- Polished the AI data protection and budget control cards by defining safe text zones, rebalancing policy chips, tightening overlays, and rebuilding the code preview so the layout stays collision-free across breakpoints.

## 2025-09-29

- Reimagined the homepage security and rate limit cards as AI data protection and team budgeting experiences, refreshed their visuals, and localized all copy in English and Dutch.

## 2025-09-28

- Temporarily hid the homepage hashed keys, audit logs, and open-source sections behind disabled wrappers so they can be re-enabled later without code loss.

## 2025-09-27

- Reimagined the usage bento as an AI activity feed with localized actor, description, and meta copy alongside duration-based timestamps and refreshed task-specific icons.
- Updated the sidebar messaging and locale catalogs to communicate company-wide AI tracking in both English and Dutch.

## 2025-09-26

- Reimagined the analytics bento as the TransformAI Beta Dashboard, updated every label to AI usage terminology, and wired new English and Dutch translations for the refreshed metrics, legends, and captions.

## 2025-09-25

- Repositioned the code example CTA buttons beneath the language templates, refreshed their English and Dutch labels, updated the analytics request access control, and introduced localized platform section messaging for both locales.

## 2025-09-24

- Updated the homepage logo cloud heading and code examples copy with the new TransformAI messaging, adding localized English and Dutch strings for the contact CTA and project explorer descriptions.

## 2025-09-23

- Localized the homepage hero heading and description with the new TransformAI messaging for English and Dutch visitors.
- Connected the landing page metadata to next-intl so SEO descriptions mirror the updated hero copy across locales.

## 2025-09-22

- Wrapped the Next.js config with the `next-intl` plugin and centralized message loading so runtime translations inherit English fallbacks without throwing.
- Returned a 303 from `/api/select-language` to convert the follow-up request into a GET and land visitors on the chosen locale.

## 2025-09-21

- Moved the locale persistence route to `/api/select-language` so the language picker page can serve GET requests without a 405 error.
- Updated the selection form to post against the new endpoint while keeping the redirect into the chosen locale.

## 2025-09-20

- Restored the root layout’s `<html>/<body>` structure, deriving the document language from the persisted locale cookie to silence Next.js warnings.
- Simplified the locale layout to render inside that wrapper and introduced a `/select-language` route handler that sets `NEXT_LOCALE` before redirecting visitors to the selected locale.

## 2025-09-19

- Added next-intl powered routing with locale-prefixed segments, middleware-based language negotiation, and a first-visit langu
age selection screen for the marketing site.
- Restructured `apps/www/app` into `app/[locale]/(site)` with locale-aware layouts, message catalogs, and navigation helpers to
 support English/Dutch content with automatic fallback handling.

## 2025-09-18

- Automated content collection generation and asset module types so TypeScript resolves markdown + image imports during `pnpm --filter www run typecheck`.
- Added a headless ESLint config, refreshed the Next.js config to compose the content collections plugin while skipping build-time linting, and hardened the OSS friends and template pages against offline builds.

## 2025-09-17

- Updated root agent commands to document the workspace-scoped pnpm install, checks, build, and dev sequences for the website.
- Added a commands quick-reference to `apps/www/AGENTS.md`, renamed the package to `www`, and exposed matching `typecheck`/`format` scripts in the app.

## 2025-10-30

- Added password reset flow with email tokens.
- Documented required SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- Wrote basic smoke tests for `auth/reset` endpoints.

## 2025-10-26

- Implemented homepage hero gradient refactor to use `--feature-*` tokens.
- Reduced initial CLS by adding explicit width/height to hero images.
