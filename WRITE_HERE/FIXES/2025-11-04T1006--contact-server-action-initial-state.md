# Restore contact form server action exports

- **What:** Moved the contact form's initial state constant into the client component so the server action module only exports async functions.
- **Why:** Next.js rejected the "use server" module because the exported object violated the server action export rules, causing submissions to fail.
- **Files:** `apps/www/app/[locale]/(site)/contact/components/contact-form.tsx`, `apps/www/app/[locale]/(site)/contact/server/send-message.ts`.
- **Follow-ups:** Audit other server action modules for similar exported constants if they trigger runtime errors.
