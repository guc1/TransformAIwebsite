# Assistant text.format migration

- **What:** Updated the OpenAI Responses payload to use the new `text.format` JSON schema contract so replies stay valid after the API change.
- **Why:** OpenAI deprecated the top-level `response_format` parameter, causing every assistant call to fail with `unsupported_parameter` errors.
- **Files:** `apps/www/app/api/assistant/route.ts`.
- **Follow-ups:** Keep an eye on OpenAI changelog updates to adapt quickly if the Responses schema evolves again.
