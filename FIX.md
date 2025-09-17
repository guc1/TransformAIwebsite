# FIX.md — Requests & Resolutions Log

> Track **what the user wanted** and **how you fixed it** (technical detail).  
> Always add a new entry at the **top**; reference files, functions, and rationale.

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
