# Restored nested blog post slugs
- **What:** Recomputed blog post slugs from the `_meta.path` basename so nested MDX files render with the same extensionless URLs as top-level entries and adjusted metadata URLs to reuse the generated blog link.
- **Why:** Switching the slug to the full filename added a `.mdx` suffix, breaking existing slug lookups (e.g., handpicked posts on the About page) and leaving the new research posts hidden even after the collection indexed their folders.
- **Files:** `apps/www/content-collections.ts`, `apps/www/app/[locale]/(site)/blog/[slug]/page.tsx`.
- **Follow-ups:** Consider adding a uniqueness safeguard if multiple posts ever share the same basename.
