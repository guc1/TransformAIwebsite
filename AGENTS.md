# TransformAI — Codex Agent Guide (Root)

> **Read this first.** This file defines how agents should operate in this repository.  
> If a directory contains its own `AGENTS.md`, **the most local file takes precedence** for that scope.

---

## What this project is

We are adapting a website template from **Unkey.com** to create a professional marketing site for **TransformAI**—an AI transformation agency focused on helping Dutch companies navigate and capitalize on emerging AI technologies. The site must feel premium, confident, and production-grade.

---

## How to work (mandatory workflow)

1. **Before starting any task**

- Read `UPDATE.md` and `FIX.md` (root). Get a quick history of what changed and how previous issues were solved.
- Skim this `AGENTS.md` (root) and any local `AGENTS.md` in the app you will touch (e.g., `apps/www/AGENTS.md` for the website).

2. **Plan briefly**

- Draft a 3–6 bullet **plan** in your PR description (or task notes): scope, files to touch, risks, and test plan.

3. **Implement within the house system**

- Prefer existing tokens, utilities, and primitives.
- If introducing a new component or config, keep it small, composable, and documented.

4. **Quality gates (must pass before you finalize)**

- Typecheck, lint, format, and build (see commands below).
- Verify dark/light modes, accessibility basics, and responsiveness.
- Ensure no layout shift; images sized; lighthouse basics clean.

5. **Document the change**

- Append a dated entry to `UPDATE.md` describing _what_ changed and _why_.
- Append a dated entry to `FIX.md` describing the _user ask/bug_ and the _technical resolution_ (files, functions, rationale).

6. **Open a small PR**

- Clear title, short plan, screenshots (if UI), and checkboxes for the Definition of Done.

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

Full, canonical spec: see apps/www/AGENTS.md
.

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

UPDATE.md and FIX.md updated with dated entries.

Files you must keep updated

UPDATE.md — a dated changelog of what changed and why.
Example: 2025-10-30: Added password reset flow with email tokens and documented SMTP env vars.

FIX.md — a dated log of user ask / bug and how you fixed it (technical notes).
Example: 2025-10-30: "Reset emails not sending" → added sendPasswordResetEmail(), fixed env var mapping, added retry + logging.

Always read both files before starting new work to learn from prior fixes and maintain continuity.
