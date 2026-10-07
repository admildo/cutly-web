import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable(
  'users',
  {
    clerkId: text('clerk_id').primaryKey(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: text('last_seen_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastLoginAt: text('last_login_at'),
    deletedAt: text('deleted_at')
  },
  (table) => [index('users_deleted_idx').on(table.deletedAt)]
)

export const licenses = sqliteTable(
  'licenses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    type: text('type', { enum: ['lifetime', 'annual'] }).notNull(),
    status: text('status', { enum: ['active', 'revoked', 'refunded', 'expired'] }).notNull().default('active'),
    planName: text('plan_name').notNull(),
    deviceLimit: integer('device_limit').notNull().default(2),
    expiresAt: text('expires_at'),
    paymentProvider: text('payment_provider'),
    providerCustomerId: text('provider_customer_id'),
    providerTransactionId: text('provider_transaction_id'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('licenses_active_user_idx').on(table.userId, table.status, table.expiresAt),
    uniqueIndex('licenses_provider_transaction_idx').on(table.providerTransactionId)
  ]
)

export const devices = sqliteTable(
  'devices',
  {
    id: text('id').primaryKey(),
    licenseId: text('license_id').notNull().references(() => licenses.id, { onDelete: 'cascade' }),
    deviceHash: text('device_hash').notNull(),
    platform: text('platform'),
    appVersion: text('app_version'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: text('last_seen_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    deactivatedAt: text('deactivated_at')
  },
  (table) => [
    uniqueIndex('devices_license_hash_idx').on(table.licenseId, table.deviceHash),
    index('devices_active_license_idx').on(table.licenseId, table.deactivatedAt)
  ]
)

export const paymentEvents = sqliteTable(
  'payment_events',
  {
    id: text('id').primaryKey(),
    provider: text('provider').notNull(),
    providerEventId: text('provider_event_id').notNull(),
    eventType: text('event_type').notNull(),
    receivedAt: text('received_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [uniqueIndex('payment_events_provider_event_idx').on(table.provider, table.providerEventId)]
)

// Server-side state for short-lived desktop authentication and revocable
// desktop sessions. Tokens remain signed; these rows make them one-time and
// revocable without a separate Redis service.
export const desktopAuthGrants = sqliteTable(
  'desktop_auth_grants',
  {
    jti: text('jti').primaryKey(),
    expiresAt: text('expires_at').notNull(),
    consumedAt: text('consumed_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [index('desktop_auth_grants_expiry_idx').on(table.expiresAt)]
)

export const desktopSessions = sqliteTable(
  'desktop_sessions',
  {
    jti: text('jti').primaryKey(),
    userId: text('user_id').notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [index('desktop_sessions_expiry_idx').on(table.expiresAt)]
)

export const rateLimitBuckets = sqliteTable(
  'rate_limit_buckets',
  {
    key: text('key').primaryKey(),
    count: integer('count').notNull(),
    expiresAt: text('expires_at').notNull()
  },
  (table) => [index('rate_limit_buckets_expiry_idx').on(table.expiresAt)]
)

// Trial access is account based. The trial ledger stores counts and request
// outcomes only; transcripts and source media are never persisted here.
export const trialAccounts = sqliteTable(
  'trial_accounts',
  {
    userId: text('user_id').primaryKey(),
    status: text('status', { enum: ['active', 'blocked'] }).notNull().default('active'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [index('trial_accounts_status_idx').on(table.status)]
)

export const trialDeviceClaims = sqliteTable(
  'trial_device_claims',
  {
    deviceHash: text('device_hash').primaryKey(),
    userId: text('user_id').notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: text('last_seen_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [index('trial_device_claims_user_idx').on(table.userId)]
)

export const trialUsageCounts = sqliteTable(
  'trial_usage_counts',
  {
    userId: text('user_id').notNull(),
    action: text('action', { enum: ['clip_generation', 'smart_clean', 'caption_translation', 'media_assistant_plan'] }).notNull(),
    usedCount: integer('used_count').notNull().default(0),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('trial_usage_counts_user_action_idx').on(table.userId, table.action),
    index('trial_usage_counts_user_idx').on(table.userId)
  ]
)

export const trialActionRequests = sqliteTable(
  'trial_action_requests',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    requestId: text('request_id').notNull(),
    action: text('action', { enum: ['clip_generation', 'smart_clean', 'caption_translation', 'media_assistant_plan'] }).notNull(),
    status: text('status', { enum: ['pending', 'succeeded', 'failed', 'rejected'] }).notNull(),
    responseJson: text('response_json'),
    errorMessage: text('error_message'),
    dayKey: text('day_key').notNull(),
    monthKey: text('month_key').notNull(),
    reservedMicros: integer('reserved_micros').notNull().default(0),
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
    costMicros: integer('cost_micros').notNull().default(0),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('trial_action_requests_user_request_idx').on(table.userId, table.requestId),
    index('trial_action_requests_status_created_idx').on(table.status, table.createdAt),
    index('trial_action_requests_day_idx').on(table.dayKey)
  ]
)

export const trialDailySpend = sqliteTable(
  'trial_daily_spend',
  {
    dayKey: text('day_key').primaryKey(),
    reservedMicros: integer('reserved_micros').notNull().default(0),
    spentMicros: integer('spent_micros').notNull().default(0),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  }
)

export const trialMonthlySpend = sqliteTable(
  'trial_monthly_spend',
  {
    monthKey: text('month_key').primaryKey(),
    reservedMicros: integer('reserved_micros').notNull().default(0),
    spentMicros: integer('spent_micros').notNull().default(0),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  }
)

export const trialConfig = sqliteTable(
  'trial_config',
  {
    id: text('id').primaryKey(),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    clipGenerationsMax: integer('clip_generations_max').notNull().default(2),
    smartCleanMax: integer('smart_clean_max').notNull().default(1),
    captionTranslationsMax: integer('caption_translations_max').notNull().default(1),
    mediaAssistantPlansMax: integer('media_assistant_plans_max').notNull().default(1),
    dailyBudgetMicros: integer('daily_budget_micros').notNull().default(1_000_000),
    monthlyBudgetMicros: integer('monthly_budget_micros').notNull().default(10_000_000),
    updatedBy: text('updated_by'),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
  }
)
