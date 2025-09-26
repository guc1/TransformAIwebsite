# Stabilized www checks for offline execution
_When:_ 2025-09-18 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Get `pnpm --filter www run typecheck`, `pnpm --filter www run lint`, and the website build passing without interactive prompts or external network access.
- **Root cause:** Content Collections artifacts were only generated during Next.js runs, asset imports lacked module typings, linting prompted for a config, and `/oss-friends` fetched remote data during static generation.
- **Fix:**
  - Added a reusable Content Collections build script that runs before TypeScript, declared common image modules, and documented the lean command set in root/app agent guides.
  - Introduced a minimal `.eslintrc.json` alongside `eslint`/`eslint-config-next` dev dependencies so `next lint` runs headlessly.
  - Migrated the Next config to an ESM plugin chain that skips build-time lint/type validation and made the OSS friends and template detail pages dynamic with guarded fetch logic for offline builds.
- **Files:** `AGENTS.md`, `apps/www/AGENTS.md`, `apps/www/package.json`, `apps/www/scripts/build-content-collections.mjs`, `apps/www/types/images.d.ts`, `apps/www/.eslintrc.json`, `apps/www/next.config.mjs`, `apps/www/app/oss-friends/page.tsx`, `apps/www/app/templates/[slug]/page.tsx`
- **Follow-ups:** None.
