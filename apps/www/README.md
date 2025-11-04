# Unkey Landing Page

## Local Development

To start the local development server, run the following command from the monorepo root:

```bash
pnpm run landing:dev
```

or from the www directory:
```bash
pnpm run dev
```

## Database & authentication setup

The members area uses PostgreSQL + Drizzle + NextAuth. Before running the auth routes locally or in production:

1. Provision a PostgreSQL database (Neon, Supabase, Render, etc.) and grab the connection string.
2. Copy `.env.example` to `.env.local` and populate:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate a random string, e.g. `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (OAuth credentials for the Google sign-in button)
   - `STAFF_ACCESS_CODE` if you want to override the default `Cake2025` value.
3. Apply the initial schema:

```bash
pnpm --filter www run db:push
```

   This seeds the `drizzle/` migrations into the target database. For subsequent changes use `db:generate` + `db:migrate`.
4. Start the dev server (`pnpm --filter www dev`). You can now create accounts with email/password or Google; new users are assigned the `client` role unless they unlock the staff code.

## Contact form configuration

The `/contact` page forwards submissions through [Resend](https://resend.com/) so incoming messages to `info@transformai.nl` land in `yergushbloetjes@gmail.com`.

1. Add the following variables to `apps/www/.env.local` (or your deployment provider):
   - `RESEND_API_KEY` – API key with permission to send emails.
   - `CONTACT_FROM_EMAIL` – optional. Defaults to `TransformAI <info@transformai.nl>`, but set this if you use a different verified sender identity.
   - `CONTACT_FORWARD_TO` – the inbox that should receive the forwarded messages (e.g. `yergushbloetjes@gmail.com`).
2. Verify the `transformai.nl` domain and the `info@transformai.nl` sender identity inside Resend so mail is delivered from the official address.
3. (Recommended) Configure an alias or forwarding rule in your email provider so replying from `info@transformai.nl` stays consistent with what visitors see on the site.

If any of the required variables are missing the form gracefully falls back and asks visitors to email `info@transformai.nl` directly.
