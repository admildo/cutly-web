# Cutly site

This Next.js app hosts Clerk authentication and account-based licensing for the Cutly desktop app. The desktop app opens `/desktop-auth` with a short-lived, state-protected localhost callback URL. After Clerk sign-in or sign-up, this site returns a short-lived Clerk token to that loopback callback. Electron validates the token with `/api/auth/desktop-session`, then stores it in the operating system keychain for later authenticated license checks.

## Blog CMS

The blog uses Payload CMS at `/admin` and publishes posts at `/blog` and
`/blog/<slug>`. Local development uses a separate file-backed database at
`.data/cms.db` unless CMS Turso credentials are configured. Production should
use a separate Turso database from licensing so CMS schema migrations cannot
touch license or account tables. Set `CMS_TURSO_DATABASE_URL`,
`CMS_TURSO_AUTH_TOKEN`, and a high-entropy `PAYLOAD_SECRET` in the deployment
environment.

Start the site and visit `/admin/create-first-user` to create the CMS editor
account. Posts support drafts, a title, slug, excerpt, optional cover image URL,
publish date, and rich text. Images currently use an HTTPS URL; uploaded media
storage can be added separately if needed.

Payload's SQLite adapter syncs schema changes automatically in development.
Start `pnpm dev` once against the development CMS database so Payload creates
its initial tables. Before deploying, create and commit the schema migration,
then apply pending migrations to the CMS database:

```bash
pnpm payload migrate:create initial-cms-schema
pnpm payload migrate
```

Run `pnpm payload migrate` against the production CMS database before deploying
later schema changes.

## Licensing database

Licenses belong to a Clerk account, not to a shareable license key. Turso stores entitlements, registered devices, idempotent payment-webhook events, one-time desktop grant consumption, revocable desktop sessions, rate-limit buckets, and a minimal local `users` record keyed by `clerk_id`. Clerk remains the source of truth for identity; the local user record stores app-owned lifecycle timestamps (`created_at`, `last_seen_at`, `last_login_at`, and `deleted_at`).

1. Create a Turso database for Cutly licensing.
2. Copy `.env.example` to `.env.local` and add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
3. Generate a high-entropy `DESKTOP_AUTH_SIGNING_KEY` independent from
   `CLERK_SECRET_KEY`.
4. Configure a Clerk webhook at `/api/webhooks/clerk` and set
   `CLERK_WEBHOOK_SIGNING_SECRET` from its Svix signing secret.
5. Generate and apply the Drizzle migration:

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

For production, set the same Clerk environment variables in the hosting provider and set `NEXT_PUBLIC_SITE_URL` to the public HTTPS site origin (for example, `https://cutly.app`). This value is used for canonical URLs, social metadata, structured data, `robots.txt`, and `sitemap.xml`. `CUTLY_SITE_URL` remains supported as a fallback for existing deployments.

## Public-site configuration

Set `NEXT_PUBLIC_APP_DOWNLOAD_URL` to the HTTPS URL of the current signed Cutly
installer or release-download page. The account dashboard uses it for its
**Download app** action and uses the `cutly://open` desktop protocol for its
**Open Cutly** action. Set `NEXT_PUBLIC_SUPPORT_URL` to the HTTPS support page
or contact form that should receive account, privacy, and legal requests.

### Desktop auto-updates

Set `CUTLY_UPDATE_STORAGE_URL` in the site environment to the public HTTPS base
directory of an object store or CDN for Cutly release files. Use a store that
allows public reads and supports byte-range downloads; the app packages are
large, so keep them in object storage rather than in the Next.js deployment.
The site exposes a stable HTTPS feed at `https://<your-site-domain>/updates/`
and redirects each requested file to that store. For example, the app's updater
requests `/updates/latest-mac.yml`, and the manifest's package and blockmap
filenames use the same path.

Set `CUTLY_UPDATE_URL` to `https://<your-site-domain>/updates/` when building
the desktop app. Upload the versioned packages and blockmaps to the configured
storage directory first, then upload `latest-mac.yml` or `latest.yml` last. The
URL must be publicly reachable over HTTPS and the store must retain prior
versioned files while installed apps may still download them. Verify the feed
with a request to `/updates/latest-mac.yml` (or `/updates/latest.yml` for
Windows) after deployment.

Stripe checkout uses these server-only variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_LIFETIME_PRICE_ID=price_...
```

Configure a Stripe webhook at `/api/stripe/webhook` for
`checkout.session.completed`, `checkout.session.async_payment_succeeded`, and
`charge.refunded`. The webhook is the source of truth for activating or
revoking a Turso license; never activate access from the success redirect alone.

Before publishing a desktop release, update the Open Source page/release notes
with the exact FFmpeg build, its license, build configuration, and corresponding
source offer when required by that build's license.

Run the production gate before deployment:

```bash
pnpm check
```
