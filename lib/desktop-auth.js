import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import {
  consumeDesktopGrant,
  createStoredDesktopSession,
  getStoredDesktopSessionUserId,
  revokeStoredDesktopSession,
  revokeStoredDesktopSessionsForUser
} from './state-store.js'

const grantLifetimeSeconds = 60
const sessionLifetimeSeconds = 60 * 60 * 24 * 30

const signingKey = () => {
  if (!process.env.DESKTOP_AUTH_SIGNING_KEY) {
    throw new Error('DESKTOP_AUTH_SIGNING_KEY is required for desktop authentication.')
  }

  return process.env.DESKTOP_AUTH_SIGNING_KEY
}

const sign = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', signingKey()).update(body).digest('base64url')
  return `${body}.${signature}`
}

const verify = (token, purpose) => {
  if (typeof token !== 'string') return null

  const [body, signature, extra] = token.split('.')
  if (!body || !signature || extra) return null

  const expected = createHmac('sha256', signingKey()).update(body).digest()
  const supplied = Buffer.from(signature, 'base64url')
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (
      payload.purpose !== purpose ||
      typeof payload.sub !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export const getBearerToken = (request) => {
  const authorization = request.headers.get('authorization')
  if (!authorization) return null

  const token = authorization.replace(/^Bearer\s+/i, '').trim()
  return token || null
}

// This grant is created only after Clerk has authenticated the browser. It is
// deliberately short-lived because it travels through the loopback callback.
export const createDesktopAuthGrant = (userId) => sign({
  sub: userId,
  purpose: 'desktop-auth-grant',
  jti: randomUUID(),
  exp: Math.floor(Date.now() / 1000) + grantLifetimeSeconds
})

export const consumeDesktopAuthGrantUserId = async (request) => {
  const grant = verify(getBearerToken(request), 'desktop-auth-grant')
  if (!grant?.jti) return null

  const consumed = await consumeDesktopGrant(grant.jti, grant.exp)
  return consumed ? grant.sub : null
}

// Electron keeps this token in the operating system keychain and presents it
// for later desktop API requests. It is not a Clerk browser-session cookie.
export const createDesktopSession = async (userId) => {
  const jti = randomUUID()
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds
  const token = sign({
    sub: userId,
    purpose: 'desktop-session',
    jti,
    exp: expiresAt
  })
  await createStoredDesktopSession(jti, userId, expiresAt)
  return token
}

export const getDesktopUserId = async (request) => {
  const session = verify(getBearerToken(request), 'desktop-session')
  if (!session?.jti) return null

  const userId = await getStoredDesktopSessionUserId(session.jti, Math.floor(Date.now() / 1000))
  return userId === session.sub ? session.sub : null
}

export const revokeDesktopSession = async (request) => {
  const session = verify(getBearerToken(request), 'desktop-session')
  if (!session?.jti) return false
  return revokeStoredDesktopSession(session.jti)
}

export const revokeDesktopSessionsForUser = (userId) => revokeStoredDesktopSessionsForUser(userId)
