# Added password reset flow and documented SMTP configuration
_When:_ 2025-10-30 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- Added password reset flow with email tokens.
- Documented required SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- Wrote basic smoke tests for `auth/reset` endpoints.
