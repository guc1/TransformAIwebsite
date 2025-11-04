# OpenAI-backed assistant with unified context

- **What:** Swapped the assistant API to use OpenAI's `gpt-5-mini` with a shared TransformAI context, forwarded locale metadata from chat widgets, and exposed the required `OPENAI_API_KEY` env variable. Updated docs and fallback copy accordingly.
- **Why:** Ensure the on-site chatbot answers with accurate company guidance, can recommend relevant pages, and supports meeting scheduling without relying on the old upstream placeholder.
- **Files:** `.env.example`, `README.md`, `apps/www/app/api/assistant/route.ts`, `apps/www/components/ask/StickyChat.tsx`, `apps/www/components/ask/PricingChat.tsx`.
- **Follow-ups:** Consider extending tool support so the assistant can surface live meeting availability or pre-fill scheduling requests automatically.
