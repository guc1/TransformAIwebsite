# Restore Discord delivery for contact form

- **What:** Ensure the contact server action reads the Discord webhook URL through the shared server env parser so submissions post to Discord when the variable is set.
- **Why:** Directly reading `process.env` bypassed the app's env loading, so the webhook stayed unset locally and Discord never received notifications.
- **Files:** `.env.example`, `apps/www/app/[locale]/(site)/contact/server/send-message.ts`, `apps/www/lib/env.ts`.
- **Follow-ups:** None.
