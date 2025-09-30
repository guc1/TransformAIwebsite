# Automated content collections and hardened offline builds
_When:_ 2025-09-18 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- Automated content collection generation and asset module types so TypeScript resolves markdown + image imports during `pnpm --filter www run typecheck`.
- Added a headless ESLint config, refreshed the Next.js config to compose the content collections plugin while skipping build-time linting, and hardened the OSS friends and template pages against offline builds.
