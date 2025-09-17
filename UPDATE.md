# UPDATE.md — Project Change Log

> Append a new dated entry at the **top** for every meaningful change. Keep it short, factual, and useful for future agents.

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
