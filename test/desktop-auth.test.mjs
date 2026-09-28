import assert from 'node:assert/strict'
import test from 'node:test'

process.env.DESKTOP_AUTH_SIGNING_KEY = 'test-only-desktop-auth-signing-key'

const { setStateStoreForTesting } = await import('../lib/state-store.js')
const {
  consumeDesktopAuthGrantUserId,
  createDesktopAuthGrant,
  createDesktopSession,
  getDesktopUserId,
  revokeDesktopSession
} = await import('../lib/desktop-auth.js')

class MemoryStateStore {
  grants = new Set()
  sessions = new Map()

  async consumeDesktopGrant(jti) {
    if (this.grants.has(jti)) return false
    this.grants.add(jti)
    return true
  }

  async createDesktopSession(jti, userId) {
    this.sessions.set(jti, userId)
  }

  async getDesktopSessionUserId(jti) {
    return this.sessions.get(jti) ?? null
  }

  async revokeDesktopSession(jti) {
    return this.sessions.delete(jti)
  }

  async incrementRateLimit() {
    throw new Error('Not used by desktop-auth tests')
  }
}

const requestWithToken = (token) =>
  new Request('https://cutly.example/api/auth/desktop-session', {
    headers: { Authorization: `Bearer ${token}` }
  })

test('a desktop auth grant can only be exchanged once', async () => {
  setStateStoreForTesting(new MemoryStateStore())
  const grant = createDesktopAuthGrant('user_test')

  assert.equal(await consumeDesktopAuthGrantUserId(requestWithToken(grant)), 'user_test')
  assert.equal(await consumeDesktopAuthGrantUserId(requestWithToken(grant)), null)
})

test('revoking a desktop session invalidates it immediately', async () => {
  setStateStoreForTesting(new MemoryStateStore())
  const session = await createDesktopSession('user_test')
  const request = requestWithToken(session)

  assert.equal(await getDesktopUserId(request), 'user_test')
  assert.equal(await revokeDesktopSession(request), true)
  assert.equal(await getDesktopUserId(request), null)
})
