# Soft-hidden legacy homepage sections without deleting code
_When:_ 2025-09-28 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Temporarily remove the One-way hashed Keys, Audit Logs, and Open-source homepage sections without deleting their code so they can be restored later.
- **Fix:** Wrapped each section’s JSX in a `{false && (...)}` guard with inline comments to suppress rendering while keeping the original components and imports intact.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `UPDATE.md`.
- **Follow-ups:** Re-enable the guards when the sections should return.
