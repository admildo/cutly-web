# Cutly site

This Next.js app hosts Clerk authentication and account-based licensing for the Cutly desktop app. The desktop app opens `/desktop-auth` with a short-lived, state-protected localhost callback URL. After Clerk sign-in or sign-up, this site returns a short-lived Clerk token to that loopback callback. Electron validates the token with `/api/auth/desktop-session`, then stores it in the operating system keychain for later authenticated license checks.

## Licensing database

Licenses belong to a Clerk account, not to a shareable license key. Turso stores entitlements, registered devices, idempotent payment-webhook events, and a minimal local `users` record keyed by `clerk_id`. Clerk remains the source of truth for identity; the local user record stores app-owned lifecycle timestamps (`created_at`, `last_seen_at`, `last_login_at`, and `deleted_at`).

1. Create a Turso database for Cutly licensing.
2. Copy `.env.example` to `.env.local` and add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
3. Provision an Upstash Redis database for rate limits, one-time desktop grants,
   and revocable desktop sessions.
4. Generate a high-entropy `DESKTOP_AUTH_SIGNING_KEY` independent from
   `CLERK_SECRET_KEY`.
5. Configure a Clerk webhook at `/api/webhooks/clerk` and set
   `CLERK_WEBHOOK_SIGNING_SECRET` from its Svix signing secret.
6. Generate and apply the Drizzle migration:

```bash
pnpm db:generate
pnpm db:migrate
```

The license endpoints are:

- `GET /api/license` — read the signed-in account’s entitlement.
- `POST /api/license` — register or renew the current device. It expects a Clerk bearer token and a hashed device ID.

User provisioning is handled in two ways: the signed-in desktop-session and license endpoints upsert the current user synchronously, and `POST /api/webhooks/clerk` synchronizes Clerk `user.created`, `user.updated`, and `user.deleted` events. Configure that URL as a Clerk webhook and set `CLERK_WEBHOOK_SIGNING_SECRET` in the site environment.

The migrations remove the legacy hard-coded development license. Grant any
internal entitlement through an audited admin process, never a migration.

Payment integration remains the final integration point: on a successful payment
it must create an `active` row in `licenses`, store the provider transaction ID,
and first insert the provider event ID in `payment_events`. The two unique
constraints make webhook retries safe.

Pull the Clerk development keys for the linked app before starting it:

```bash
npx clerk env pull
npm run dev
```

For local desktop development, start Electron with the site origin configured:

```bash
CUTLY_SITE_URL=http://localhost:3000 pnpm dev
```

For production, set the same Clerk environment variables in the hosting provider and make `CUTLY_SITE_URL` point to the deployed site when building or running Cutly.

Run the production gate before deployment:

```bash
pnpm check
```
