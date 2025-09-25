# Enabled nested blog post discovery
- **What:** Updated the blog content collection to index MDX files recursively and normalize each post slug/url to the file name so entries inside subdirectories surface across the site.
- **Why:** New project folders under `content/blog` were invisible because only top-level MDX files were collected.
- **Files:** `apps/www/content-collections.ts`.
- **Follow-ups:** Consider updating blog metadata URLs to include the `/blog` prefix for consistency.
