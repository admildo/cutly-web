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
