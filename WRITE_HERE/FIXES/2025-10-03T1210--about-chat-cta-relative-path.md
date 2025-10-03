# Make About chat CTA locale-aware

- **What**: Pointed the About page hero "Chat with us" button to the relative `/meeting` route so Next.js applies the active locale automatically.
- **Why**: The previous localhost-bound link broke in production and forced English even for Dutch visitors.
- **Files**: `apps/www/app/[locale]/(site)/about/page.tsx`
- **Follow-ups**: None.
