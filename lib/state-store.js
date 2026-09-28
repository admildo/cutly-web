import { sql } from 'drizzle-orm'

let testStore = null

const iso = (seconds) => new Date(seconds * 1000).toISOString()
const database = async () => (await import('./db.js')).getDb()

const databaseStore = {
  async consumeDesktopGrant(jti, expiresAt) {
    const db = await database()
    await db.run(sql`DELETE FROM desktop_auth_grants WHERE expires_at <= ${iso(Math.floor(Date.now() / 1000))}`)
    const result = await db.run(sql`
      INSERT INTO desktop_auth_grants (jti, expires_at)
      VALUES (${jti}, ${iso(expiresAt)})
      ON CONFLICT(jti) DO NOTHING
    `)
    return result.rowsAffected === 1
  },

  async createDesktopSession(jti, userId, expiresAt) {
    const db = await database()
    await db.run(sql`DELETE FROM desktop_sessions WHERE expires_at <= ${iso(Math.floor(Date.now() / 1000))}`)
    await db.run(sql`
      INSERT INTO desktop_sessions (jti, user_id, expires_at)
      VALUES (${jti}, ${userId}, ${iso(expiresAt)})
    `)
  },

  async getDesktopSessionUserId(jti, now) {
    const result = await (await database()).get(sql`
      SELECT user_id AS userId
      FROM desktop_sessions
      WHERE jti = ${jti} AND expires_at > ${iso(now)}
    `)
    return result?.userId || null
  },

  async revokeDesktopSession(jti) {
    const result = await (await database()).run(sql`DELETE FROM desktop_sessions WHERE jti = ${jti}`)
    return result.rowsAffected === 1
  },

  async incrementRateLimit(key, expiresAt, now) {
    const db = await database()
    await db.run(sql`DELETE FROM rate_limit_buckets WHERE expires_at <= ${iso(now)}`)
    const result = await db.get(sql`
      INSERT INTO rate_limit_buckets (key, count, expires_at)
      VALUES (${key}, 1, ${iso(expiresAt)})
      ON CONFLICT(key) DO UPDATE SET
        count = CASE WHEN rate_limit_buckets.expires_at <= ${iso(now)} THEN 1 ELSE rate_limit_buckets.count + 1 END,
        expires_at = CASE WHEN rate_limit_buckets.expires_at <= ${iso(now)} THEN ${iso(expiresAt)} ELSE rate_limit_buckets.expires_at END
      RETURNING count
    `)
    return Number(result?.count || 0)
  }
}

const store = () => testStore || databaseStore

export const consumeDesktopGrant = (jti, expiresAt) => store().consumeDesktopGrant(jti, expiresAt)
export const createStoredDesktopSession = (jti, userId, expiresAt) =>
  store().createDesktopSession(jti, userId, expiresAt)
export const getStoredDesktopSessionUserId = (jti, now) => store().getDesktopSessionUserId(jti, now)
export const revokeStoredDesktopSession = (jti) => store().revokeDesktopSession(jti)
export const incrementRateLimit = (key, expiresAt, now) =>
  store().incrementRateLimit(key, expiresAt, now)

export const setStateStoreForTesting = (nextStore) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The state store cannot be replaced in production.')
  }
  testStore = nextStore
}
