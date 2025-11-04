# Keep hero hours-saved ticker in sync with staff updates

- **What:** Disabled Next.js caching on the landing route and forced the hero ticker to fetch the latest hours-saved totals as soon as it becomes visible, ensuring it immediately reflects staff dashboard adjustments.
- **Why:** The homepage number lagged behind the staff-managed schedule because the initial render reused cached data and the ticker waited for its first scheduled refresh before polling for new totals.
- **Files:** `apps/www/app/[locale]/(site)/page.tsx`, `apps/www/components/hero/hours-saved-ticker.tsx`.
- **Follow-ups:** Consider surfacing the next scheduled update time on the homepage badge if stakeholders request more context.
