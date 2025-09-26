# Repository Best Practices

This project follows a modern monorepo setup and adopts industry-standard practices that keep the codebase maintainable, secure, and easy to collaborate on.

## Monorepo with pnpm + Turborepo

- `pnpm-workspace.yaml` groups related apps/packages.
- `turbo.json` orchestrates shared build, lint, and type-check tasks for consistent automation and caching.

## Strict TypeScript Everywhere

- Each app has a `tsconfig.json` with `"strict": true`, `noEmit`, and path aliases for cleaner imports and safe refactoring.
- Node version is pinned (`"node": ">=20"`) to guarantee a modern runtime across contributors.

## Comprehensive Linting and Formatting

- `biome.json` enables recommended rules across correctness, accessibility, and style (e.g., `noUnusedVariables`, `useSemanticElements`, `useBlockStatements`).
- Prettier is included to ensure consistent formatting; repository scripts (`fmt`, `format`) enforce style before commit.

## Next.js Best Practices

- `reactStrictMode: true` and SWC minify configured for performance and catching subtle React issues.
- Security headers (e.g., `X-Frame-Options: SAMEORIGIN`), rewrites, and redirects defined in `next.config.*` files.
- Environment variables for API keys and external URLs are referenced via Next’s configuration and Turborepo’s env list, avoiding hard-coded secrets.

## Tailwind CSS with TypeScript

- `tailwind.config.ts` uses typed configuration, dark-mode toggling, purge paths, and custom utilities/animations.
- Plugins and shared color generation functions keep styling consistent across apps.

## App-Level Isolation and Documentation

- Each app (`www`, `play`, `generator`) has its own `package.json`, `tsconfig`, and README with dedicated scripts (`dev`, `build`, `lint`).
- Encourages clear boundaries and modular development within the monorepo.

## Reproducible and Secure Dependencies

- `pnpm-lock.yaml` checked in for deterministic installs.
- `packageManager` field ensures collaborators use the same pnpm version.

**Bottom line:** type safety, consistent style, modular architecture, and secure configuration—key elements for building and maintaining a high-quality application.
