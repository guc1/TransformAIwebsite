# Added Ask TransformAI assistant experience
_When:_ 2025-11-17 09:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Introduced a localized Ask TransformAI CTA and sticky mini-chat experience with focus management, rate-limited proxy API, and placeholder transcript persistence directly under the AI assistant section.
- **Why:** To deliver the requested on-brand chat interaction that stays visible while scrolling and supports both English and Dutch copy with proper accessibility.
- **Files:** `.env.example`, `.gitignore`, `README.md`, `apps/www/app/code-examples.tsx`, `apps/www/app/globals.css`, `apps/www/app/api/assistant/route.ts`, `apps/www/components/ask/*`, `apps/www/messages/en.json`, `apps/www/messages/nl.json`.
- **Follow-ups:** Replace the proxy fallback with the production assistant endpoint once available and refine assistant copy when final prompts are defined.
