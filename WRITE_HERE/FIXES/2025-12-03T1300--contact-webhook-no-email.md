# Contact form skips email when webhook-only

- **What:** Removed the Resend email requirement from the contact form server action so submissions only persist to the inbox and post to Discord, and documented the webhook environment variable in `.env.example`.
- **Why:** The form previously aborted without `RESEND_API_KEY`/`CONTACT_FORWARD_TO`, preventing staff inbox storage and Discord notifications when only the webhook should run.
- **Files:** `apps/www/app/[locale]/(site)/contact/server/send-message.ts`, `.env.example`.
- **Follow-ups:** Ensure the new `CONTACT_DISCORD_WEBHOOK` value is populated in each environment’s runtime configuration.
