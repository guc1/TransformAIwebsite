# FIX.md — Requests & Resolutions Log

> Track **what the user wanted** and **how you fixed it** (technical detail).
> Always add a new entry at the **top**; reference files, functions, and rationale.

## 2025-11-05 — “Prompt for coding agent — update homepage hero section”

- **User ask / Bug:** Raise the homepage hero copy block closer to the hero background while replacing its heading, body, and CTA labels with localized English/Dutch strings.
- **Fix:**
  - Added the new hero messaging under `Hero.title`/`Hero.body` in the locale catalogs and updated the hero component to read the CTA labels from the existing translation namespace.
  - Replaced the hard-coded hero copy on the landing page with the translation helper and reduced the section’s top margin so the heading/button stack sits higher across breakpoints, polishing the Dutch “Explore All projects” label.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hero-main-section.tsx`, `apps/www/components/hero/hero.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-11-04 — “Prompt for the coding agent — swap visual + text (keep SVG, match size)”

- **User ask / Bug:** Replace the latency map section visual with the provided workflow PNG and refresh the heading, description, and alt text with localized English/Dutch copy while preserving the layout and original SVG asset in the repo.
- **Fix:**
  - Swapped the map SVG import for the workflow PNG, loading translations from a new `Workflows` namespace so the heading, body, and alt strings stay localized.
  - Added the corresponding English and Dutch message entries to support the new copy and alt text.
- **Files:** `apps/www/components/latency-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-11-03 — “Follow-up prompt — reveal full project pill”

- **User ask / Bug:** Shift the budgets card’s “project 22” pill slightly left so the label is fully visible instead of clipping against the card edge.
- **Fix:** Added responsive right margin to the pill container, preserving the existing hierarchy while keeping the badge comfortably within the viewport.
- **Files:** `apps/www/components/rate-limits-bento.tsx`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-11-02 — “Follow-up prompt — restore budget card hierarchy”

- **User ask / Bug:** Make the budgets card show its JSON preview again, keep it to seven visible lines, move the project pill onto the credits row, and ensure the remaining elements follow the requested order.
- **Fix:**
  - Locked the code pane to a 7-line viewport with a bottom fade so the JSON is always visible without overwhelming the card.
  - Rebuilt the metrics stack so the credits meter and “project 22” pill share a row, the rate limit badge slots directly below, and the heading/paragraph flow beneath.
- **Files:** `apps/www/components/rate-limits-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-11-01 — “Prompt for coding agent — small UI adjustments”

- **User ask / Bug:** Update the paired AI protection and budget cards so the security title drops the “& IP” phrasing and the budget metrics appear in the specified order without clipping the project pill.
- **Fix:**
  - Trimmed the security title translation in English and Dutch to “AI Data Protection,” leaving the existing body copy and policy chips untouched.
  - Reordered the credits meter, rate limit badge, and project pill in the budget card layout while anchoring the pill to the left edge to keep it visible at every breakpoint.
- **Files:** `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `apps/www/components/rate-limits-bento.tsx`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-10-31 — “Follow-up prompt for the coding agent — polish the two cards”

- **User ask / Bug:** Deliver production-ready layouts for the AI protection and team budgets cards so copy never collides with floating chips or the JSON panel across breakpoints.
- **Root cause:** The first refresh left policy badges large enough to drift into the text safe area and the rate limit code viewer flexible, allowing the project pill and credits meter to crowd the heading zone on smaller screens.
- **Fix:**
  - Anchored the policy badges to the radar rings with smaller, lower-opacity chips and deepened the text-side gradients to preserve a clear reading zone.
  - Locked the JSON preview to seven lines with hidden overflow, tightened the bottom fade, and rebuilt the credits row so the usage meter and “#22” project pill align cleanly with added padding.
- **Files:** `apps/www/components/ip-whitelisting-bento.tsx`, `apps/www/components/rate-limits-bento.tsx`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-09-30 — “Follow-up prompt for the coding agent — polish the two cards”

- **User ask / Bug:** Resolve layout collisions on the refreshed AI protection and budget cards by tightening chip placement, cleaning the overlays, and keeping the text and code blocks readable on every breakpoint.
- **Fix:**
  - Established bottom-left safe zones with subtle gradients, repositioned the compliance chips along the radar rings, and softened their scale so they stay clear of the heading copy.
  - Rebuilt the budget preview into a fixed seven-line code pane with highlighted keys, reorganized the credits meter row so the project pill (now “#22”) sits flush right, and widened pill padding to prevent truncation.
- **Files:** `apps/www/components/ip-whitelisting-bento.tsx`, `apps/www/components/rate-limits-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-09-29 — “Prompt for coding agent — Replace “IP Whitelisting / Rate Limits” cards”

- **User ask / Bug:** Refresh the paired homepage cards so they communicate AI data and IP protection plus team budget controls, with localized copy and updated visuals that drop the raw IP and API key references.
- **Fix:**
  - Converted both card components to client-side translations, swapped the IP-focused badges for policy/compliance chips with new shield, lock, and residency glyphs, and added a credits usage meter with wallet iconography.
  - Updated the JSON code sample, project pill, and inline stats to reflect credits and fair-use rate limits while wiring English and Dutch strings under the `Security` and `Budgets` namespaces.
- **Files:** `apps/www/components/ip-whitelisting-bento.tsx`, `apps/www/components/rate-limits-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-09-28 — “Prompt for coding agent — Hide but don’t delete specific sections (including all text)”

- **User ask / Bug:** Temporarily remove the One-way hashed Keys, Audit Logs, and Open-source homepage sections without deleting their code so they can be restored later.
- **Fix:** Wrapped each section’s JSX in a `{false && (...)}` guard with inline comments to suppress rendering while keeping the original components and imports intact.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `UPDATE.md`.
- **Follow-ups:** Re-enable the guards when the sections should return.

## 2025-09-27 — “Prompt for coding agent — AI Activity Feed (production formatting, full i18n)”

- **User ask / Bug:** Replace the billing-focused usage bento with an AI activity feed that highlights task actors, descriptions, meta details, and precise durations while localizing all copy in English and Dutch.
- **Fix:**
  - Replaced the billing row component with a reusable `ActivityItem`, introduced task-specific AI icons, and surfaced actor, description, meta, and duration data sourced from the Activity translation namespace.
  - Localized the sidebar title and body along with each activity entry in the English and Dutch message catalogs, keeping time values as untranslated duration strings.
- **Files:** `apps/www/components/usage-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-09-26 — “Refit analytics bento into TransformAI Beta Dashboard”

- **User ask / Bug:** Rework the analytics bento so every label, caption, and legend reflects an AI usage dashboard with English/Dutch translations and refreshed hero copy for the platform section.
- **Fix:**
  - Routed the sidebar, tabs, metrics, legends, and caption through new `Analytics` translation keys focused on AI adoption, keeping the existing grid structure intact.
  - Added platform hero strings under a `Platform` namespace and expanded the Dutch catalog with locale-appropriate number formatting while relying on English fallbacks.
- **Files:** `apps/www/components/analytics/analytics-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** Monitor for additional dashboard widgets that may need AI-focused copy.

## 2025-09-25 — “Move code template CTAs and refresh platform copy”

- **User ask / Bug:** Relocate the “Get Started” and “Visit the docs” buttons so they sit beneath the code template selector, update their English and Dutch labels, refresh the AI assistant and platform section copy, and rename the analytics “Show API code” control.
- **Fix:**
  - Rebuilt the code example CTA layout to place the buttons below the language tabs and sourced their labels from a shared CTA translation namespace.
  - Localized the assistant headline, platform messaging, and analytics toggle with the new English/Dutch copy while updating the docs CTA text site-wide.
- **Files:** `apps/www/app/code-examples.tsx`, `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/analytics/analytics-bento.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `UPDATE.md`.
- **Follow-ups:** None.

## 2025-09-24 — “Refresh partner heading and code examples messaging”

- **User ask / Bug:** Replace the "Powering" label on the homepage with "Partners" and update the duplicated "Any language, any framework, always secure" copy in the code examples section with the new English and Dutch messaging.
- **Fix:**
  - Fetched the logo cloud heading via next-intl so both desktop and mobile variants render the localized "Partners" label.
  - Added a `CodeExamples` namespace to the locale catalogs and rendered two localized `SectionTitle` blocks that reflect the requested TransformAI assistant and project explorer descriptions.
- **Files:** `apps/www/app/[locale]/(site)/(components)/logo-cloud-content.tsx`, `apps/www/app/code-examples.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`
- **Follow-ups:** None.

## 2025-09-23 — “Refresh hero messaging for TransformAI”

- **User ask / Bug:** Replace the homepage hero headline and supporting paragraph with the new TransformAI positioning in English and Dutch.
- **Fix:**
  - Added a `Hero` namespace to the locale message catalogs and passed the translated strings into the hero component via `next-intl`.
  - Swapped the static landing metadata for a locale-aware generator so open graph and SEO descriptions follow the updated copy.
- **Files:** `apps/www/components/hero/hero.tsx`, `apps/www/components/hero/hero-main-section.tsx`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`, `apps/www/app/[locale]/(site)/page.tsx`
- **Follow-ups:** None.

## 2025-09-22 — “Language picker crashes after submit”

- **User ask / Bug:** Selecting a language triggered a runtime error about a missing `next-intl` config file and kept the visitor on `/select-language`.
- **Root cause:** The Next.js config never registered the `next-intl` plugin, so the runtime alias for `next-intl/config` resolved to a stub that throws. The redirect response also used the default 307 status, causing the browser to repeat the POST against `/{locale}`.
- **Fix:**
  - Added a shared `loadMessages` helper and request configuration so Next Intl can hydrate translations with English fallbacks for `getTranslations` and the client provider.
  - Wrapped `next.config.mjs` with `createNextIntlPlugin` to register the runtime alias and reuse the new request config.
  - Switched the language selection redirect to a 303 so the follow-up request hits the localized page with a GET.
- **Files:** `apps/www/i18n/messages.ts`, `apps/www/i18n/request.ts`, `apps/www/i18n/routing.ts`, `apps/www/app/[locale]/layout.tsx`, `apps/www/next.config.mjs`, `apps/www/app/api/select-language/route.ts`
- **Follow-ups:** None.

## 2025-09-21 — “GET /select-language returns 405”

- **User ask / Bug:** Visiting `/select-language` produced an HTTP 405 instead of rendering the language picker because the request hit the cookie-setting route.
- **Root cause:** Next.js prioritized the colocated `route.ts` (with only a `POST` handler) over the page component, so GET requests never reached the React page.
- **Fix:**
  - Moved the locale persistence handler to `/api/select-language` so the `/select-language` page can serve GET traffic normally.
  - Pointed the selection form at the new endpoint, retaining the redirect logic after setting the locale cookie.
- **Files:** `apps/www/app/api/select-language/route.ts`, `apps/www/app/select-language/page.tsx`
- **Follow-ups:** None.

## 2025-09-20 — “Select-language redirect + missing html/body tags”

- **User ask / Bug:** Loading `/` produced a Next.js warning about missing `<html>`/`<body>` tags, and choosing a language on `/select-language` left the page instead of redirecting into the localized site.
- **Fix:**
  - Restored the root layout’s document wrapper, deriving the `lang` attribute from the `NEXT_LOCALE` cookie while keeping the locale layout focused on translations and shared chrome.
  - Reworked `app/[locale]/layout.tsx` to live inside the root `<html>/<body>` tree without duplicating markup.
  - Replaced the unreliable server action with a route handler that persists `NEXT_LOCALE` for one year and issues a redirect to the chosen locale, updating the selection page to post against it.
- **Files:** `apps/www/app/layout.tsx`, `apps/www/app/[locale]/layout.tsx`, `apps/www/app/select-language/page.tsx`, `apps/www/app/select-language/route.ts`
- **Follow-ups:** None.

## 2025-09-19 — “Implement next-intl i18n infrastructure”

- **User ask / Bug:** Add locale-prefixed routes, language selection flow, and fallback translations so the marketing site suppo
rts English and Dutch.
- **Fix:**
  - Introduced next-intl with a locale-aware root layout, message catalogs, and helper navigation utilities while moving all pag
    es under `app/[locale]/(site)`.
  - Added middleware-driven locale negotiation plus a `/select-language` server action to seed the `NEXT_LOCALE` cookie.
  - Created translation files with English fallback merging and documented the workflow in root/app `AGENTS.md`.
- **Files:** `apps/www/app/[locale]/layout.tsx`, `apps/www/app/select-language/page.tsx`, `apps/www/components/navbar/navigation.tsx`, `apps/www/components/footer/footer.tsx`, `apps/www/i18n/*`, `apps/www/messages/*`, `middleware.ts`, `apps/www/middleware.ts`, `AGENTS.md`, `apps/www/AGENTS.md`
- **Follow-ups:** Address pre-existing ESLint warnings surfaced by `next lint` to keep CI green.

## 2025-09-18 — “Stabilize www checks offline”

- **User ask / Bug:** Get `pnpm --filter www run typecheck`, `pnpm --filter www run lint`, and the website build passing without interactive prompts or external network access.
- **Root cause:** Content Collections artifacts were only generated during Next.js runs, asset imports lacked module typings, linting prompted for a config, and `/oss-friends` fetched remote data during static generation.
- **Fix:**
  - Added a reusable Content Collections build script that runs before TypeScript, declared common image modules, and documented the lean command set in root/app agent guides.
  - Introduced a minimal `.eslintrc.json` alongside `eslint`/`eslint-config-next` dev dependencies so `next lint` runs headlessly.
  - Migrated the Next config to an ESM plugin chain that skips build-time lint/type validation and made the OSS friends and template detail pages dynamic with guarded fetch logic for offline builds.
- **Files:** `AGENTS.md`, `apps/www/AGENTS.md`, `apps/www/package.json`, `apps/www/scripts/build-content-collections.mjs`, `apps/www/types/images.d.ts`, `apps/www/.eslintrc.json`, `apps/www/next.config.mjs`, `apps/www/app/oss-friends/page.tsx`, `apps/www/app/templates/[slug]/page.tsx`
- **Follow-ups:** None.

## 2025-09-17 — “Clarify website command recipes”

- **User ask / Bug:** Provide Codex with unambiguous website-specific install/check/build/dev commands and ensure they map to actual scripts.
- **Root cause:** Root `AGENTS.md` used broad workspace commands that could trigger unrelated builds, and `apps/www` lacked `typecheck`/`format` scripts to back the documented pnpm targets.
- **Fix:**
  - Replaced the root commands section with filtered pnpm/turbo invocations scoped to `apps/www`.
  - Added a commands quick reference to `apps/www/AGENTS.md` mirroring the documented workflow.
  - Renamed the package to `www` and implemented `typecheck` and `format` scripts in `apps/www/package.json` so the documented commands execute successfully.
- **Files:** `AGENTS.md`, `apps/www/AGENTS.md`, `apps/www/package.json`
- **Follow-ups:** None.

## 2025-10-30 — “Reset emails not sending”

- **User ask / Bug:** Password reset emails never arrive.
- **Root cause:** `SMTP_*` env vars not mapped in `next.config.js`; missing `await` in `sendPasswordResetEmail()`.
- **Fix:**
  - Mapped env vars in `next.config.js` and `.env.example`.
  - Added `await transporter.sendMail(...)` and error handling + retry with exponential backoff.
  - Logged `messageId` for observability.
- **Files:** `apps/www/lib/email.ts`, `apps/www/app/api/reset/route.ts`, `next.config.js`, `.env.example`
- **Follow-ups:** Add integration test using local SMTP stub.

## 2025-10-26 — “Gradient heading inconsistent in Safari”

- **User ask / Bug:** Gradient text renders dull in Safari.
- **Fix:** Switched to `background-clip:text` + `text-fill-color:transparent` fallback and ensured tokens use `--feature-9` / `--feature-11`.
- **Files:** `apps/www/components/SectionTitle.tsx`, `apps/www/styles/globals.css`
