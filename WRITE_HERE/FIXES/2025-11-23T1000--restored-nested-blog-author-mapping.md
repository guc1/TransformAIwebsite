# Restored nested blog posts by matching author keys

- **What:** Normalized the author slug in the new English and Dutch AI adoption posts and removed stray metadata that blocked parsing.
- **Why:** The blog grid expects lowercase author identifiers defined in `authors.ts`; mismatched casing plus an extra header prevented these posts from rendering.
- **Files:** `apps/www/content/blog/mdxfilesforprojects/research/ai-adoptation/posts/English/how-we-map-ai-adoption-across-industries.mdx`, `apps/www/content/blog/mdxfilesforprojects/research/ai-adoptation/posts/Dutch/zo-meten-we-ai-adoptie-per-sector.mdx`.
- **Follow-ups:** None.
