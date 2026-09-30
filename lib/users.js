import { eq, sql } from 'drizzle-orm'
import { users } from '@/db/schema'
import { getDb } from '@/lib/db'

export const syncUser = async (clerkId, { login = false } = {}) => {
  if (!clerkId) throw new Error('A Clerk user ID is required.')

  const db = getDb()
  await db.insert(users).values({
    clerkId,
    lastLoginAt: login ? sql`CURRENT_TIMESTAMP` : null
  }).onConflictDoUpdate({
    target: users.clerkId,
    set: {
      lastSeenAt: sql`CURRENT_TIMESTAMP`,
      ...(login ? { lastLoginAt: sql`CURRENT_TIMESTAMP` } : {}),
      deletedAt: null
    }
  })

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
  return user
}

export const markUserDeleted = async (clerkId) => {
  const db = getDb()
  await db.run(sql`DELETE FROM trial_action_requests WHERE user_id = ${clerkId}`)
  await db.run(sql`DELETE FROM trial_usage_counts WHERE user_id = ${clerkId}`)
  await db.run(sql`DELETE FROM trial_accounts WHERE user_id = ${clerkId}`)
  // Keep only an unlinked device hash so a deleted account cannot be used to
  // start another free trial on the same machine.
  await db.run(sql`UPDATE trial_device_claims SET user_id = 'deleted-account' WHERE user_id = ${clerkId}`)
  await db.update(users).set({
    deletedAt: sql`CURRENT_TIMESTAMP`,
    lastSeenAt: sql`CURRENT_TIMESTAMP`
  }).where(eq(users.clerkId, clerkId))
}
