# Language switcher locale path fix

- **What:** Updated the language switcher to delegate locale-prefixed routing to `next-intl` so language toggles link to the correct localized route while preserving query strings.
- **Why:** Switching languages appended the target locale to the existing locale segment (e.g., `/nl/en`), resulting in missing content when navigating between Dutch and English.
- **Files:** `apps/www/components/language-switcher.tsx`.
- **Follow-ups:** None.
