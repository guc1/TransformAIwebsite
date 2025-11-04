# Prevent chat panel ChunkLoadError

- **What:** Updated the chat panel export to provide a default export and simplified the dynamic imports in the sticky and pricing chat wrappers to consume it.
- **Why:** The runtime attempted to fetch `/_next/undefined` because the dynamic loader couldn't determine the chunk ID when resolving the named export, causing the chat widget to crash on scroll.
- **Files:** `apps/www/components/ask/ChatPanel.tsx`, `apps/www/components/ask/StickyChat.tsx`, `apps/www/components/ask/PricingChat.tsx`
- **Follow-ups:** Monitor bundle metrics; if the chat panel remains heavy, consider reintroducing code-splitting with an explicit chunk name helper once verified.
