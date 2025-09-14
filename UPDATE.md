# UPDATE.md — Project Change Log

> Append a new dated entry at the **top** for every meaningful change. Keep it short, factual, and useful for future agents.

## 2025-10-31

- Added initial in-browser blog admin skeleton with code gate and placeholder editor.
- Introduced middleware and API login route for simple session handling.
- Surfaced "+ New post" button on blog index.

## 2025-10-30

- Added password reset flow with email tokens.
- Documented required SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- Wrote basic smoke tests for `auth/reset` endpoints.

## 2025-10-26

- Implemented homepage hero gradient refactor to use `--feature-*` tokens.
- Reduced initial CLS by adding explicit width/height to hero images.
