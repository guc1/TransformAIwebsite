# Stabilise assistant response contract

- **What:** Removed unsupported sampling params from the `/api/assistant` OpenAI call, reformatted the payload to the documented responses schema, and moved the network trigger out of React state setters in both chat launchers to avoid duplicate sends.
- **Why:** `gpt-5-mini` rejects `temperature`/`top_p`, and Strict Mode was invoking the state updater twice which caused the same prompt to be dispatched twice and show duplicate fallback replies.
- **Files:** `apps/www/app/api/assistant/route.ts`, `apps/www/components/ask/PricingChat.tsx`, `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** Watch production telemetry to confirm requests stay single-shot before reintroducing optional sampling controls.
