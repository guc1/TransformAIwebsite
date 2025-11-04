# Restored Members drawer JSX parsing
- **What:** Reworked the mobile members drawer component to use a typed props alias and arrow function so the JSX renders cleanly without the parser tripping over the return block.
- **Why:** Next.js failed to compile `components/navbar/navigation.tsx` because the drawer submenu returned markup that the bundler misread, halting local dev.
- **Files:** `apps/www/components/navbar/navigation.tsx`.
- **Follow-ups:** Monitor for any lingering bundler complaints when running `pnpm dev`; if they persist, escalate to investigate surrounding mobile navigation markup.
