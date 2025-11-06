# Fix CTA analytics import

- **What:** Updated the CTA component to use the browser-safe `track` helper from `@vercel/analytics` instead of the server-only export.
- **Why:** Clicking the "Chat with us" button threw a runtime error because the server variant was being executed in the client bundle.
- **Files:** `apps/www/components/cta.tsx`
- **Follow-ups:** None.
