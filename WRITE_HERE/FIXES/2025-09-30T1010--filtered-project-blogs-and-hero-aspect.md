# Filtered project blogs and corrected hero aspect ratio

- **What:** Limited blog listings and feeds to MDX project posts via a reusable filter helper and added 3:2 responsive handling for blog imagery.
- **Why:** Ensure only TransformAI case study content appears across blog surfaces and prevent 1536x1024 assets from being distorted.
- **Files:** `apps/www/content-collections.ts`, `apps/www/lib/blog-posts.ts`, `apps/www/app/[locale]/(site)/blog/page.tsx`, `apps/www/app/[locale]/(site)/blog/[slug]/page.tsx`, `apps/www/app/feed.xml/route.ts`, `apps/www/app/sitemap.ts`, `apps/www/components/blog/blog-hero.tsx`, `apps/www/components/blog/blog-card.tsx`, `apps/www/components/blog/suggested-blogs.tsx`.
- **Follow-ups:** Update curated selections on other pages if they should reference the new project-focused articles.
