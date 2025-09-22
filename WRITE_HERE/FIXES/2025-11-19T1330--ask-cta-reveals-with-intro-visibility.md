# Ask CTA reveals with intro visibility

- **What:** Updated the StickyChat intersection logic so the Ask TransformAI button appears as soon as the intro SectionTitle enters the viewport with a small cushion, keeping the CTA sticky afterward and fading it when the chat closes.
- **Why:** The previous reveal waited for extra space beneath the intro text, so the CTA surfaced too late compared to the moment users first saw the copy.
- **Files:** `apps/www/components/ask/StickyChat.tsx`.
- **Follow-ups:** None.
