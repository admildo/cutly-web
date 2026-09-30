import { auth } from '@clerk/nextjs/server'
import { getTrialConfigForAdmin, isTrialAdmin, updateTrialConfig } from '@/lib/trial'

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0' }
})

const requireAdmin = async (request, { requireOrigin = false } = {}) => {
  const { userId } = await auth()
  if (!userId || !isTrialAdmin(userId)) return null
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return null
  if (requireOrigin && !origin) return null
  return userId
}

export async function GET(request) {
  const userId = await requireAdmin(request)
  if (!userId) return json({ error: 'Not found.' }, 404)
  try {
    return json(await getTrialConfigForAdmin())
  } catch (error) {
    console.error('Could not read trial settings:', error)
    return json({ error: 'Could not load trial settings.' }, 503)
  }
}

export async function PATCH(request) {
  const userId = await requireAdmin(request, { requireOrigin: true })
  if (!userId) return json({ error: 'Not found.' }, 404)

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'A valid settings object is required.' }, 400)
  }
  const allowedKeys = new Set([
    'enabled', 'clipGenerationsMax', 'smartCleanMax', 'captionTranslationsMax',
    'dailyBudgetDollars', 'monthlyBudgetDollars'
  ])
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
    Object.keys(payload).some((key) => !allowedKeys.has(key)) || typeof payload.enabled !== 'boolean') {
    return json({ error: 'The trial settings are invalid.' }, 400)
  }

  const counts = ['clipGenerationsMax', 'smartCleanMax', 'captionTranslationsMax']
  if (counts.some((key) => !Number.isInteger(payload[key]) || payload[key] < 0 || payload[key] > 20)) {
    return json({ error: 'Each trial allowance must be a whole number from 0 to 20.' }, 400)
  }
  if (!Number.isFinite(payload.dailyBudgetDollars) || payload.dailyBudgetDollars < 0 || payload.dailyBudgetDollars > 100) {
    return json({ error: 'The daily spend limit must be between $0 and $100.' }, 400)
  }
  if (!Number.isFinite(payload.monthlyBudgetDollars) || payload.monthlyBudgetDollars < 0 || payload.monthlyBudgetDollars > 1000) {
    return json({ error: 'The monthly spend limit must be between $0 and $1,000.' }, 400)
  }

  try {
    const config = await updateTrialConfig({
      enabled: payload.enabled,
      clipGenerationsMax: payload.clipGenerationsMax,
      smartCleanMax: payload.smartCleanMax,
      captionTranslationsMax: payload.captionTranslationsMax,
      dailyBudgetMicros: Math.round(payload.dailyBudgetDollars * 1_000_000),
      monthlyBudgetMicros: Math.round(payload.monthlyBudgetDollars * 1_000_000)
    }, userId)
    return json(config)
  } catch (error) {
    console.error('Could not update trial settings:', error)
    return json({ error: 'Could not save trial settings. Please try again.' }, 503)
  }
}
