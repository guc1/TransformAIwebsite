# Fixed password reset emails not sending
_When:_ 2025-10-30 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Password reset emails never arrive.
- **Root cause:** `SMTP_*` env vars not mapped in `next.config.js`; missing `await` in `sendPasswordResetEmail()`.
- **Fix:**
  - Mapped env vars in `next.config.js` and `.env.example`.
  - Added `await transporter.sendMail(...)` and error handling + retry with exponential backoff.
  - Logged `messageId` for observability.
- **Files:** `apps/www/lib/email.ts`, `apps/www/app/api/reset/route.ts`, `next.config.js`, `.env.example`
- **Follow-ups:** Add integration test using local SMTP stub.
