# Restore assistant replies through OpenAI responses API

- **What:** Reworked the `/api/assistant` route to call OpenAI's `responses` endpoint with the unified system prompt, handle the new output schema, and align the fallback copy with Dutch/English locales.
- **Why:** The previous integration attempted to use the deprecated chat completions path with `gpt-5-mini`, which returned HTTP 400 errors and left visitors with the fallback autoresponder.
- **Files:** `apps/www/app/api/assistant/route.ts`.
- **Follow-ups:** Consider wiring tool calls (e.g., direct meeting booking) once we confirm the live API contract and available automations.
