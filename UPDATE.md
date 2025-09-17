# UPDATE.md — Project Change Log

> Append a new dated entry at the **top** for every meaningful change. Keep it short, factual, and useful for future agents.

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
