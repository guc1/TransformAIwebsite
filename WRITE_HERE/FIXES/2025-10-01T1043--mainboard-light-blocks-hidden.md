# Restore animated glows on hero mainboard
- **What:** Hid the static black base shapes behind each animated light streak in `mainboard.svg` so only the glowing gradient paths remain visible during motion.
- **Why:** The new board artwork still rendered dark “blocks” because the static base paths sat above the moving highlights, obscuring the intended light animation.
- **Files:** `apps/www/images/mainboard.svg`.
- **Follow-ups:** Capture fresh hero imagery once the Next.js app can build locally with all dependencies.
