# Fixed Safari gradient heading inconsistency
_When:_ 2025-10-26 09:00 · _Scope:_ apps/www · _Author:_ Legacy log

- **User ask / Bug:** Gradient text renders dull in Safari.
- **Fix:** Switched to `background-clip:text` + `text-fill-color:transparent` fallback and ensured tokens use `--feature-9` / `--feature-11`.
- **Files:** `apps/www/components/SectionTitle.tsx`, `apps/www/styles/globals.css`
