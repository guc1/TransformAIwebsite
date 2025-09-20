# TransformAI — Codex Agent Guide (Root)

> **Read this first.** This file defines how agents should operate in this repository.
> If a directory contains its own `AGENTS.md`, **the most local file takes precedence** for that scope.

---

## What this project is

We are adapting a website template from **Unkey.com** to create a professional marketing site for **TransformAI**—an AI transformation agency focused on helping Dutch companies navigate and capitalize on emerging AI technologies. The site must feel premium, confident, and production-grade.

---

## How to work (mandatory workflow)

1. **Before starting any task**

   - Scan the three most recent files in `WRITE_HERE/UPDATES/` to understand the current project state.
   - If the task resembles prior work or you get stuck, search `WRITE_HERE/FIXES/` for similar fixes and patterns.
   - Skim this `AGENTS.md` (root) and any local `AGENTS.md` in the app you will touch (e.g., `apps/www/AGENTS.md`).
   - Read [`docs/repository-best-practices.md`](./docs/repository-best-practices.md) if you are unsure about conventions.

2. **Plan briefly**

   - Draft a 3–6 bullet **plan** in your PR description (or task notes): scope, files to touch, risks, and test plan.
   - For complex, multi-hour, or multi-step tasks, create a planning file in `WRITE_HERE/TASK_PLANNING/` named `YYYY-MM-DDTHHMM--short-task-name.md`. Capture scope, assumptions, risks, dependencies, TODOs, test plan, and considerations (a11y, responsiveness, i18n, SEO, analytics, visual polish). Update the plan as you learn before and during implementation.

3. **Implement within the house system**

   - Prefer existing tokens, utilities, and primitives.
   - If introducing a new component or config, keep it small, composable, and documented.

4. **Quality gates (must pass before you finalize)**

   - Typecheck, lint, format, and build (see commands below).
   - Verify dark/light modes, accessibility basics, and responsiveness.
   - Ensure no layout shift; images sized; lighthouse basics clean.

5. **Document the change**

   - **UPDATES:** For feature, content, or workflow changes, create a new file in `WRITE_HERE/UPDATES/` using `YYYY-MM-DDTHHMM--short-slug.md`. Start with `# <summary>` and include brief bullets for What, Why, Files, and Follow-ups.
   - **FIXES:** For bug fixes or resolved user asks, create a new file in `WRITE_HERE/FIXES/` using the same filename format. Start with `# <summary>` and capture What, Why (or root cause), Files, and Follow-ups.

6. **Open a small PR**

   - Clear title, short plan, screenshots (if UI), and checkboxes for the Definition of Done.

---

## Quick Navigation Cheat Sheet
- Start every task by skimming the root playbooks in WRITE_HERE: the latest 3 files in `UPDATES/` and any relevant items in `FIXES/`; then scan this guide. Open the closest `AGENTS.md` before editing files.
- Monorepo layout:
  - `apps/www` — TransformAI marketing site (primary focus).
  - `apps/play` — playground web app.
  - `apps/generator` — glossary generator tooling.
- Marketing site hotspots (`apps/www`):
  - Pages & layouts: `app/[locale]/(site)/…` (locale-scoped routes).
  - Shared UI primitives: `components/` (reuse before creating new pieces).
  - Content & MDX collections: `content/` plus `content-collections.ts`.
  - Translations: `messages/*.json` (English is the source of truth; other locales fall back automatically).
  - Utilities & helpers: `lib/`, `types/`, and `scripts/` for shared logic.
- Global references live at the repo root—`docs/repository-best-practices.md`, Turborepo/pnpm configs, and workspace-level middleware.
- Use `rg "<search term>" apps/www` to locate code fast, and keep app boundaries clean across apps.

---

## Repository conventions (high-signal)

- **Monorepo:** pnpm + Turborepo. Use workspace scripts; keep app/package boundaries clean (`apps/www`, `apps/play`, `apps/generator`).
- **TypeScript:** `strict: true` everywhere; path aliases for clean imports; Node `>=20`.
- **Lint/Format:** Biome for rules (correctness, a11y, style). Prettier for formatting via repo scripts (`fmt`, `format`).
- **Next.js:** `reactStrictMode: true`; SWC minify; security headers/redirects via `next.config.*`.
- **Env:** Never hard-code secrets. Use Next/Turborepo env wiring; document required env in README.
- **Tailwind:** Typed `tailwind.config.ts` with custom tokens, dark-mode class, utilities/animations.
- **App isolation:** Each app has its own `package.json`, `tsconfig`, and README with `dev/build/lint` scripts.
- **Dependencies:** `pnpm-lock.yaml` is committed; `packageManager` pins pnpm version.

> 📚 Full details live in [`/docs/repository-best-practices.md`](./docs/repository-best-practices.md).

---

## Commands

```
# Install (Codex/CI)
pnpm -w install --frozen-lockfile

# Website checks
pnpm --filter www run typecheck
pnpm --filter www run lint

# Build just the website (Turborepo)
pnpm -w turbo run build --filter=www

# Dev
pnpm --filter www dev
```

(Filtering avoids failing builds in other workspaces and matches Turborepo/pnpm docs.)

Website styling (summary for the root)

North star: modern dark aesthetic, gradients, soft glows; subtle motion only.

System > one-offs: reuse tokens, utilities, primitives.

i18n + theming: do not hard-code copy; respect dark/light.

Full, canonical spec: see apps/www/AGENTS.md.

## Internationalization (i18n)

- The marketing site runs on `next-intl` with locale-prefixed routes (`/<locale>/…`). Do **not** hard-code UI text—store strings in `apps/www/messages/*.json` and load them with the translation helpers.
- Keep translation keys stable. `messages/en.json` is the canonical source; other locales (e.g., Dutch) can omit keys and will fall back to English automatically.
- Adding a language: add a `<locale>.json` file next to the existing message catalogs and append the code to `apps/www/i18n/routing.ts`. The middleware and layout provider handle the rest.

Definition of Done (PR checklist)

Reused existing primitives; new components are small, composable, and documented.

Tailwind + tokens only (no hard-coded hex, no inline style hacks).

Dark and light modes look correct.

Strings routed through i18n/MDX where applicable; no hard-coded marketing copy.

A11y basics: semantics, focus rings, prefers-reduced-motion.

Responsive at breakpoints; container alignment correct.

No CLS; images have width/height; lighthouse basics pass.

Simple API surface: clear props, variants, className passthrough via cn().

No duplication; shared logic/components follow app conventions.

WRITE_HERE logs updated with a new entry in `UPDATES/` or `FIXES/` capturing What, Why, Files, and Follow-ups.

Files you must keep updated

`WRITE_HERE/UPDATES/` — one file per change in behavior or content (feature updates, workflow adjustments). Example: `2025-10-30T0900--added-password-reset-flow-and-documented-smtp-configuration.md`.

`WRITE_HERE/FIXES/` — one file per bug fix or resolved user ask, noting the request, fix, files, and follow-ups. Example: `2025-10-30T0900--fixed-password-reset-emails-not-sending.md`.

`WRITE_HERE/TASK_PLANNING/` — planning docs for complex tasks. Record scope, assumptions, risks, dependencies, TODOs, test strategy, and polish considerations; update as you execute.

Always review the latest updates and fixes before starting new work to maintain continuity and reuse proven patterns.
