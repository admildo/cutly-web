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

The desktop and account API endpoints are:

- `POST /api/desktop/access` — resolve the desktop account's license or trial access. It expects
  the `desktop-session` bearer token created during sign-in and the hashed device ID. This route
  verifies the desktop token in its handler, so it must remain exempt from Clerk cookie protection
  in `proxy.js`.
- `POST /api/trial/ai` — submit a trial AI request. It also verifies the `desktop-session` bearer
  token in its handler, so it must remain exempt from Clerk cookie protection in `proxy.js`.
- `GET /api/license` — read the signed-in account’s entitlement.
- `POST /api/license` — register or renew the current device. It accepts an authenticated account
  request or a `desktop-session` bearer token, together with a hashed device ID.

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

For production, set the same Clerk environment variables in the hosting provider and set `NEXT_PUBLIC_SITE_URL=https://deynstudio.com`. This value is used for canonical URLs, social metadata, structured data, `robots.txt`, and `sitemap.xml`. `CUTLY_SITE_URL` remains supported as a fallback for existing deployments.

Production Stripe checkout also requires a canonical HTTPS origin through
`NEXT_PUBLIC_SITE_URL` or `CUTLY_SITE_URL`; it will not derive payment return
URLs from the incoming request host. The application uses Clerk's strict CSP
nonce support and sends HSTS in production. On Vercel, rate limiting uses the
platform-provided `x-vercel-forwarded-for` address. On other hosts, set
`TRUSTED_CLIENT_IP_HEADER` to a client-IP header that the trusted ingress proxy
overwrites; do not point it at a header clients can supply themselves.

## Public-site configuration

Set `NEXT_PUBLIC_APP_DOWNLOAD_URL` to the HTTPS URL of the current signed Deyn
Studio installer or release-download page. The landing-page download dialog
uses it as a fallback for both Mac architectures. To link directly to each
installer, set `NEXT_PUBLIC_APP_DOWNLOAD_MAC_SILICON_URL` and
`NEXT_PUBLIC_APP_DOWNLOAD_MAC_INTEL_URL` to their HTTPS download URLs. Windows
and Linux are not yet supported. The account dashboard uses the shared URL for
its **Download app** action and uses the `cutly://open` desktop protocol for its
**Open Cutly** action. Set `NEXT_PUBLIC_SUPPORT_URL` to the HTTPS support page
or contact form that should receive account, privacy, and legal requests.

### Desktop auto-updates

Set `CUTLY_UPDATE_STORAGE_URL` in the site environment to the public HTTPS base
directory of an object store or CDN for Deyn Studio release files. Use a store that
allows public reads and supports byte-range downloads; the app packages are
large, so keep them in object storage rather than in the Next.js deployment.
The site exposes a stable HTTPS feed at `https://deynstudio.com/updates/`
and redirects each requested file to that store. For example, the app's updater
requests `/updates/latest-mac.yml`, and the manifest's package and blockmap
filenames use the same path.

The desktop release configuration points to `https://deynstudio.com/updates/`.
Upload the versioned packages and blockmaps to the configured storage directory
first, then upload `latest-mac.yml` or `latest.yml` last. The feed must be
publicly reachable over HTTPS and the store must retain prior versioned files
while installed apps may still download them. Verify the feed with a request to
`/updates/latest-mac.yml` (or `/updates/latest.yml` for Windows) after deployment.

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
