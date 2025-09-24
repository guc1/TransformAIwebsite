# Added pricing page TransformAI assistant
_When:_ 2025-11-20 18:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Added a floating Ask TransformAI button and pricing-focused chat assistant on the pricing page, reusing the existing chat panel styling with a new layout tailored for the right-hand corner.
- **Why:** To help visitors compare packages and select the right offering without leaving the pricing context.
- **Files:** `apps/www/app/[locale]/(site)/pricing/page.tsx`, `apps/www/components/ask/PricingChat.tsx`, `apps/www/components/ask/index.ts`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Replace the proxy endpoint with the production assistant backend once ready and evaluate adding analytics for chat engagement.
