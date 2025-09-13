# TransformAI — Website Styling Canon (apps/www)

> This is the canonical UI design spec for the marketing site. If guidance here conflicts with root rules, **this file wins** for `apps/www`.

Goal: Keep every new feature production-grade, modern, and “top-designer” quality. If the user did not specify details, you have creative latitude—but ground your choices in this project’s existing system (tokens, patterns, motion, spacing).

________________________________________
1) North Star
Modern, dark, gradient-rich aesthetic. Black canvas, soft glows, subtle depth, tasteful glass/radial effects. Major headings often use gradient text with high contrast.
Understated motion. Smooth micro-interactions, scroll/fade reveals, delicate hover shine. Never distracting.
System over one-offs. Reuse tokens, utilities, and component primitives before inventing new ones.
________________________________________
2) Project Bedrock (what you can rely on)
Monorepo with Turborepo & pnpm. Repo contains turbo.json and pnpm-workspace.yaml. Respect app boundaries. 
Apps: Marketing site (www), Playground (play), plus a generator tool—per repo README. Keep new marketing work inside apps/www unless explicitly cross-app. 
Tech stack: Next.js (App Router) + TypeScript; MDX content is present (notable share of the codebase).
Theming & i18n are in flight:

– next-themes dependency bump PR indicates theme support; default dark, maintain light parity.

– i18n PRs exist—don’t hard-code copy; route strings through the locale layer. 
Tip: When adding a feature, mirror how www organizes components/, lib/, content/ (MDX) and styles/. If a suitable primitive exists, extend it; if not, create a small, composable piece with thoughtful props.
________________________________________
3) Visual Language
Color & Effects
Prefer CSS variable-driven palettes (Radix-style scales like --feature-9, --info-9, etc.). If you need new accents, add variables (don’t hard-code hex) and expose via Tailwind theme extension.
Backgrounds stay dark; accents come from soft gradients, border beams, shiny/gloss hover effects, blurred glows, and subtle shadows. Avoid harsh neon or noisy textures.
Typography
System uses Geist (sans + mono). Keep headings bold, compact line-height, and use gradient text for hero/section titles. Body copy is legible, slightly relaxed line-length.
Layout & Spacing
Use the shared .container with responsive max-widths (up to ~2xl ≈ 1200px). Grid layouts over ad-hoc flex jungles. Maintain consistent section rhythm (top/btm padding), and align with existing spacing scale.
________________________________________
4) Components & Patterns (reuse first)
Buttons: use project button primitives (e.g., PrimaryButton variants) before introducing new classes. Props should control size, emphasis, icon placement, loading states.
Cards: prefer existing “shiny” / elevated card patterns with subtle borders and gradient sheens. Keep padding generous; on hover, raise with tiny translate/blur glow.
Section scaffolding: use Section + SectionTitle (or equivalents) to keep heading hierarchy, spacing, and reveal animations uniform.
Animation wrappers: use existing FadeIn / FadeInStagger patterns for scroll-reveals. Easing: gentle (ease-out), durations ~200–400ms. Respect prefers-reduced-motion.
Class merging: use the shared cn() utility (clsx + tailwind-merge) when composing Tailwind classes to avoid conflicts.
If a component doesn’t exist, create a small, composable one with:
(1) minimal required props, (2) sensible defaults, (3) variant prop for visual states, (4) className passthrough merged via cn().
________________________________________
5) Motion Guidelines
Purposeful only. Motion should communicate hierarchy and affordance (not decorate).
Tiny distances, tiny blurs. Translate: 2–6px; scale: 0.98–1.02; backdrop blurs: subtle.
Triggering: on first view (intersection), on hover/focus, and on contextual state changes (e.g., tab).
Accessibility: always honor prefers-reduced-motion.
________________________________________
6) Content & MDX
Long-form/blocks live in MDX. Compose with house MDX components (code blocks, callouts, image components). No raw HTML unless necessary. Keep headings semantic (h1…h3) and consistent with section titles. 
________________________________________
7) Theming & i18n
Theme: Dark is canonical. All features must look great in dark; ensure light mode remains legible and balanced (contrast tokens, shadows toned down). next-themes class strategy; avoid inline color hacks.
i18n: String copy belongs in locale files/MDX frontmatter where applicable. Never hard-code marketing text in components. 
________________________________________
8) Accessibility, Semantics, Performance
Semantics: Landmarks (header/nav/main/footer), correct heading order, labeled controls, aria-* as needed.
Focus: visible focus rings; don’t remove outlines unless you replace them with accessible equivalents.
Contrast: WCAG AA minimum; check gradients over dark surfaces.
Images: use next/image, set width/height, lazy-load; prefer SVG for icons; compress assets.
SSR/Streaming: prefer Server Components for static/marketing UI; isolate Client Components to interactive pieces.
________________________________________
9) Creative Latitude (when requirements are vague)
You’re encouraged to propose the best UI you can imagine within this system—show taste. Explore 1–2 tasteful variants (e.g., a compact and a vivid option), then pick the strongest default. Always justify choices via tokens/patterns already in the repo.
________________________________________
10) Definition of Done (PR Checklist)
 Uses existing primitives (buttons, cards, section wrappers) where possible.
 Styles via Tailwind + project tokens (no hard-coded hex, no inline styles).
 Works in dark and light themes. 
 Strings routed through i18n / MDX (no hard-coded copy in components). 
 Accessible: semantic tags, focus states, prefers-reduced-motion respected.
 Responsive across breakpoints; container alignment correct.
 No layout shift; images sized; Lighthouse basics clean.
 Dead-simple API: clear props, variants, className passthrough via cn().
 No duplication: shared logic/components live with their app’s conventions.
 Tests or Storybook entries where useful (visual regressions, variants).
________________________________________
11) Quick References (repo facts)
Apps present: www (marketing), play (playground), generator—per README. Build marketing features in apps/www. 
Monorepo infra: turbo.json, pnpm-workspace.yaml at root. Use pnpm scripts and respect Turborepo pipelines. 
Code mix: TypeScript-heavy with meaningful MDX usage—plan for content components. 
Open PR signals: next-themes upgrade; i18n feature work—keep both in mind for every UI change. 
________________________________________
TL;DR 
Design boldly but within the house style: dark base, gradient highlights, soft depth, subtle motion, and a rigorous system (tokens, components, spacing). When unsure, make a strong, tasteful call, explain it, and ensure it’s reusable and accessible.
