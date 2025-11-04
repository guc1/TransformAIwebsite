# Meeting scheduler feature

## Scope
- Add public meeting scheduling page at /meeting with 2-week availability view, booking form, and success messaging.
- Persist meeting slots and bookings in database; ensure booking toggles availability.
- Enhance staff dashboard overview with upcoming meetings list and build planning tab with editable calendar including slot CRUD.
- Provide staff interface to adjust slot duration in 15-minute increments, update metadata (description, assigned staff), and delete slots.
- Keep UI consistent with site design, support EN/NL translations.

## Assumptions
- Meetings occur in a single timezone (use Europe/Amsterdam display) and durations manageable via 15-minute increments.
- One booking per slot; slot removal implies availability removal.
- Staff identified via existing users table; assigned staff optional and displayed by name.
- Email notifications/actual Zoom links out of scope; success message suffices.

## Risks & Mitigations
- **Complex drag interactions**: Build custom 15-minute grid with pointer events; provide keyboard-accessible fallback controls.
- **Concurrency**: Add transactional guard when booking to prevent double booking.
- **Timezones**: Normalize to UTC in DB, format using locale/timezone on display.
- **Performance**: Limit queries to 14-day window and use server actions with revalidation.

## Dependencies
- Drizzle schema update + migration file.
- New API/server actions for slots and bookings management.
- Translations in messages/en.json and nl.json.

## TODOs
- [x] Extend schema with meeting_slots + meeting_bookings tables, add migration.
- [x] Create shared utilities/types for scheduler.
- [x] Build public meeting page (server data fetch, client calendar + form, server action for booking).
- [ ] Update navigation or routes to include meeting page.
- [x] Enhance staff dashboard overview metrics with meetings list.
- [x] Implement staff planning route with interactive grid, including polished creation/resizing + mutation handling.
- [x] Wire translations for new copy (ensure Dutch parity).
- [x] Document update in WRITE_HERE/UPDATES.
- [ ] Run lint/typecheck (blocked by legacy violations in careers/startups/auth modules).
- [ ] Capture screenshot of meeting page.

### Current focus (2025-11-28)
- Track upstream lint/typecheck failures so we can resolve or document exclusions.
- QA staff planner interactions across DST boundaries and confirm day-bound limits before launch.
- Prepare visual assets (screenshots/demo) for meeting scheduler once QA completes.

## Testing Plan
- pnpm --filter www run lint
- pnpm --filter www run typecheck
- Manual verification in dev server (public meeting booking, staff planning edits).

## Considerations
- **Accessibility**: Ensure focusable controls, announce statuses, color contrast for availability indicators.
- **Responsiveness**: Calendar adapts to mobile (list view) and desktop (grid).
- **Internationalization**: Use translation keys; format dates via locale.
- **SEO**: Provide page metadata; ensure headings semantic.
- **Analytics**: Optionally track bookings (defer).
- **Polish**: Use gradient backgrounds consistent with design system.
