# FIX.md — Requests & Resolutions Log

> Track **what the user wanted** and **how you fixed it** (technical detail).
> Always add a new entry at the **top**; reference files, functions, and rationale.

## 2025-10-31 — "Need in-browser blog editor"

- **User ask / Bug:** Wanted ability to create and edit blog posts via browser instead of manual files.
- **Fix:**
  - Added `/admin/blog` routes with session-gated access and a placeholder editor page.
  - Implemented `middleware.ts` to protect admin paths and API.
  - Created `/api/admin/blog/login` to validate access code `cake2025` and set session cookie.
  - Added "+ New post" button linking to admin editor.
- **Files:** `apps/www/middleware.ts`, `apps/www/app/api/admin/blog/login/route.ts`, `apps/www/app/admin/blog/**`, `apps/www/app/blog/page.tsx`.
- **Follow-ups:** Flesh out full editor with saving, publishing, and file operations.

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
