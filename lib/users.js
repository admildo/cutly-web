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
  await db.update(users).set({
    deletedAt: sql`CURRENT_TIMESTAMP`,
    lastSeenAt: sql`CURRENT_TIMESTAMP`
  }).where(eq(users.clerkId, clerkId))
}
