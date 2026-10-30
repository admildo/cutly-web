import { CreatorProgramError } from '@/lib/creator-program-options'

// Creating, reading and deleting keys needs OpenRouter's management key, not a normal API key.
const KEYS_URL = 'https://openrouter.ai/api/v1/keys'
const TIMEOUT_MS = 15_000

export const requireManagementKey = () => {
  const key = process.env.OPENROUTER_MANAGEMENT_KEY
  if (!key) {
    throw new CreatorProgramError('Creator keys are not set up. Add OPENROUTER_MANAGEMENT_KEY to the server settings first.', 503)
  }
  return key
}

const request = async (method, path, { body, failure } = {}) => {
  let response
  try {
    response = await fetch(`${KEYS_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${requireManagementKey()}`,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch (error) {
    if (error instanceof CreatorProgramError) throw error
    console.error(`OpenRouter key request failed (${method} ${path}):`, error)
    throw new CreatorProgramError(`${failure} Nothing was changed. Try again.`, 502)
  }

  const text = await response.text()
  if (!response.ok) {
    console.error(`OpenRouter key request returned ${response.status} (${method} ${path}):`, text.slice(0, 300))
    throw new CreatorProgramError(`${failure} Nothing was changed. Try again.`, 502)
  }
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}

/**
 * Creates a key whose total spend is capped at limitUsd and never resets. Returns the key string, which
 * OpenRouter shows only once, and its hash, which identifies the key for later reads and deletion.
 */
export const createCreatorKey = async ({ name, limitUsd }) => {
  const body = await request('POST', '', {
    body: { name, limit: limitUsd, limit_reset: null },
    failure: 'OpenRouter did not create the key.'
  })
  const hash = body?.data?.hash
  const key = body?.key
  if (typeof hash !== 'string' || typeof key !== 'string') {
    console.error('OpenRouter returned a key without a hash or key string.')
    throw new CreatorProgramError('OpenRouter did not create the key. Nothing was changed. Try again.', 502)
  }
  return { hash, key }
}

/** How much a key has been used and how much of its limit is left, in US dollars. */
export const readCreatorKeyUsage = async (hash) => {
  const body = await request('GET', `/${encodeURIComponent(hash)}`, {
    failure: 'OpenRouter did not return the key usage.'
  })
  const data = body?.data || body
  return {
    usage: Number(data?.usage ?? 0),
    limitRemaining: data?.limit_remaining == null ? null : Number(data.limit_remaining)
  }
}

/** Stops a key from spending. Its limit and usage are kept, but no further requests will go through. */
export const disableCreatorKey = async (hash) => {
  await request('PATCH', `/${encodeURIComponent(hash)}`, {
    body: { disabled: true },
    failure: 'OpenRouter did not disable the key.'
  })
}

export const deleteCreatorKey = async (hash) => {
  await request('DELETE', `/${encodeURIComponent(hash)}`, {
    failure: 'OpenRouter did not delete the key.'
  })
}
