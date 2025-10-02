# Visitor traffic chart gains scrollable layout and 24-hour labels

- **What:** Added a horizontal scroll rail with axis ticks to the visitor chart so long time ranges stay legible, scaled bar
  heights to the active tab's maximum, and switched hourly labels/tooltips to a 24-hour clock.
- **Why:** The staff team asked for easier comparison between periods, better visual differentiation of traffic spikes, and
  European-style time formatting in the dashboard overview.
- **Files:** `apps/www/app/[locale]/(site)/dashboard/components/visitors-chart.tsx`,
  `apps/www/app/[locale]/(site)/dashboard/page.tsx`.
- **Follow-ups:** Consider persisting user tab preference and expanding analytics with visitor sources once tracking data
  grows.
