# Added homepage assistant chat experience
_When:_ 2025-11-17 09:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Introduced the “Ask the TransformAI” CTA with a lazy-loaded sticky chat surface, localized UI strings, focus management, and a basic proxy API with rate limiting.
- **Why:** Delivers the requested mini chat experience directly below the existing assistant section while keeping interactions on-brand and accessible.
- **Files:** `.env.example`, `.gitignore`, `README.md`, `apps/www/app/api/assistant/route.ts`, `apps/www/app/code-examples.tsx`, `apps/www/app/globals.css`, `apps/www/components/ask/*`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Replace the stubbed reply logic in the API route with the actual model integration once available.
