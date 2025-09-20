# Clarified website command recipes
_When:_ 2025-09-17 09:00 · _Scope:_ root, apps/www · _Author:_ Legacy log

- **User ask / Bug:** Provide Codex with unambiguous website-specific install/check/build/dev commands and ensure they map to actual scripts.
- **Root cause:** Root `AGENTS.md` used broad workspace commands that could trigger unrelated builds, and `apps/www` lacked `typecheck`/`format` scripts to back the documented pnpm targets.
- **Fix:**
  - Replaced the root commands section with filtered pnpm/turbo invocations scoped to `apps/www`.
  - Added a commands quick reference to `apps/www/AGENTS.md` mirroring the documented workflow.
  - Renamed the package to `www` and implemented `typecheck` and `format` scripts in `apps/www/package.json` so the documented commands execute successfully.
- **Files:** `AGENTS.md`, `apps/www/AGENTS.md`, `apps/www/package.json`
- **Follow-ups:** None.
