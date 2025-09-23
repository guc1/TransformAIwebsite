# Pricing chat clears overlap on comparison table
_When:_ 2025-11-20 15:00 · _Scope:_ apps/www · _Author:_ AI assistant

- **What:** Added an `onOpenChange` callback to the pricing chat widget and used it on the pricing page to animate additional right padding when the panel is open so the comparison table stays fully visible.
- **Why:** Opening the chat drawer previously covered the pricing grid, forcing visitors to close the panel to keep reading details.
- **Files:** `apps/www/components/ask/PricingChat.tsx`, `apps/www/app/[locale]/(site)/pricing/page.tsx`.
- **Follow-ups:** None.
