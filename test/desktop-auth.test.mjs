import assert from 'node:assert/strict'
import test from 'node:test'

process.env.DESKTOP_AUTH_SIGNING_KEY = 'test-only-desktop-auth-signing-key'

const { setRedisClientForTesting } = await import('../lib/redis.js')
const {
  consumeDesktopAuthGrantUserId,
  createDesktopAuthGrant,
  createDesktopSession,
  getDesktopUserId,
  revokeDesktopSession
} = await import('../lib/desktop-auth.js')

class MemoryRedis {
  values = new Map()

  async set(key, value, options = {}) {
    if (options.nx && this.values.has(key)) return null
    this.values.set(key, value)
    return 'OK'
  }

  async get(key) {
    return this.values.get(key) ?? null
  }

  async del(key) {
    return this.values.delete(key) ? 1 : 0
  }
}

const requestWithToken = (token) =>
  new Request('https://cutly.example/api/auth/desktop-session', {
    headers: { Authorization: `Bearer ${token}` }
  })

test('a desktop auth grant can only be exchanged once', async () => {
  setRedisClientForTesting(new MemoryRedis())
  const grant = createDesktopAuthGrant('user_test')

  assert.equal(await consumeDesktopAuthGrantUserId(requestWithToken(grant)), 'user_test')
  assert.equal(await consumeDesktopAuthGrantUserId(requestWithToken(grant)), null)
})

test('revoking a desktop session invalidates it immediately', async () => {
  setRedisClientForTesting(new MemoryRedis())
  const session = await createDesktopSession('user_test')
  const request = requestWithToken(session)

  assert.equal(await getDesktopUserId(request), 'user_test')
  assert.equal(await revokeDesktopSession(request), true)
  assert.equal(await getDesktopUserId(request), null)
})
