# Stabilized code example expiration timestamp
- **What:** Replaced the dynamic `Date.now()` usage in the code examples curl snippet with a deterministic timestamp constant.
- **Why:** The server-rendered page and client bundle produced different values for the snippet, causing a hydration failure on initial load.
- **Files:** `apps/www/app/code-examples.tsx`.
- **Follow-ups:** Audit other examples for runtime-generated values that could desynchronize server and client output.
