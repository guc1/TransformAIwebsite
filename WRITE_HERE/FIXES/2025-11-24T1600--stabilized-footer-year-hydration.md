# Stabilized footer copyright year hydration
- **What:** Passed the server-computed year into the footer and hydrate it with client state so the copyright label updates after mount without mismatching the SSR markup.
- **Why:** The footer previously called `new Date()` during render, so statically generated pages rendered last year's value on the server and the client calculated the current year, triggering a hydration failure when the values diverged.
- **Files:** `apps/www/components/footer/footer.tsx`, `apps/www/app/[locale]/layout.tsx`.
- **Follow-ups:** None.
