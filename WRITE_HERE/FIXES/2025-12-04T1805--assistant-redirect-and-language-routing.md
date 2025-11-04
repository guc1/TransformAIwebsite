# Assistant redirect and language routing

- **What:** Bumped the OpenAI response budget to 4K tokens, expanded the TransformAI system brief with redirect instructions, parsed structured replies for optional redirect actions, and taught the chat widgets to surface one-click redirects while tracking the visitor's language preference.
- **Why:** The assistant now needs to confirm and execute page redirections without duplicating submissions while replying consistently in Dutch or English based on the conversation.
- **Files:** `apps/www/app/api/assistant/route.ts`, `apps/www/components/ask/ChatPanel.tsx`, `apps/www/components/ask/PricingChat.tsx`, `apps/www/components/ask/StickyChat.tsx`, `apps/www/components/ask/types.ts`.
- **Follow-ups:** Monitor production logs for malformed JSON payloads or redirect URLs so we can tighten the schema if the model drifts.
