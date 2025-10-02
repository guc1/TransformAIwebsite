# TransformAI Marketing Site (www)

## Local Development

To start the local development server, run the following command from the monorepo root:

```bash
pnpm run landing:dev
```

or from the www directory:
```bash
pnpm run dev
```

## Authentication, database, and migrations

The marketing app now persists member accounts so clients can access the news updates area and staff can reach the internal dashboard.

1. **Provision PostgreSQL.** Create a database (Neon, Supabase, local Docker, etc.) and capture the connection string.
2. **Set environment variables.** Copy `.env.example` in the repo root to `.env.local` and populate:
   - `DATABASE_URL` – the connection string created in step 1.
   - `AUTH_SECRET` – a long random string used by NextAuth.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – OAuth credentials for the Google sign-in option (set the callback URL to `<base-url>/api/auth/callback/google`).
   - `NEXTAUTH_URL` – the URL the app runs on locally (usually `http://localhost:3000`).
3. **Install dependencies** if you have not already: `pnpm -w install`.
4. **Apply the database schema** by running migrations from the repo root:

   ```bash
   pnpm --filter www run db:migrate
   ```

   To create new migrations, use `pnpm --filter www run db:generate` and commit the generated files in `apps/www/drizzle/migrations`.
5. **Start the dev server:** `pnpm --filter www dev`.

### Role-aware sign-up flow

- The global navigation’s “Create Account” button routes visitors to `/[locale]/sign-up` where they can register with Google or email.
- Visitors who click the small “Staff” button in the upper-left corner of the form and enter the access code `Cake2025` are tagged as `staff`; all other sign-ups default to the `client` role.
- Successful registration (email or Google) redirects clients to `/[locale]/newsupdates` and staff to `/[locale]/dashboard` after the post-sign-in handoff.
- The staff dashboard tracks the total number of client and staff accounts in real time using the shared PostgreSQL database.

## Contact form configuration

The `/contact` page forwards submissions through [Resend](https://resend.com/) so incoming messages to `info@transformai.nl` land in `yergushbloetjes@gmail.com`.

1. Add the following variables to `apps/www/.env.local` (or your deployment provider):
   - `RESEND_API_KEY` – API key with permission to send emails.
   - `CONTACT_FROM_EMAIL` – optional. Defaults to `TransformAI <info@transformai.nl>`, but set this if you use a different verified sender identity.
   - `CONTACT_FORWARD_TO` – the inbox that should receive the forwarded messages (e.g. `yergushbloetjes@gmail.com`).
2. Verify the `transformai.nl` domain and the `info@transformai.nl` sender identity inside Resend so mail is delivered from the official address.
3. (Recommended) Configure an alias or forwarding rule in your email provider so replying from `info@transformai.nl` stays consistent with what visitors see on the site.

If any of the required variables are missing the form gracefully falls back and asks visitors to email `info@transformai.nl` directly.
