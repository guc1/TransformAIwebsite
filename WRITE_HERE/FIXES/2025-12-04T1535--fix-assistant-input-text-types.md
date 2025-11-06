# Fix assistant input text types

- **What:** Updated the OpenAI Responses payload to label system and user messages as `input_text` and replay assistant history as `output_text`.
- **Why:** OpenAI rejected the previous `text` message type, causing every assistant request to fall back to the autoresponder.
- **Files:** `apps/www/app/api/assistant/route.ts`.
- **Follow-ups:** Monitor production logs for any further schema mismatches from the Responses API updates.
