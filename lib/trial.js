import { createHmac, randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'

export const TRIAL_MODEL = 'openai/gpt-6-luna'

// The desktop sends a stable machine identifier for one-device trial claims.
// Store only a keyed digest so a database read cannot reveal or correlate the
// original identifier. Reuse the long-lived desktop auth secret to avoid
// adding another deployment secret that could drift between instances..
export const hashTrialDeviceId = (deviceId) => {
  const secret = process.env.DESKTOP_AUTH_SIGNING_KEY
  if (!secret) throw new Error('DESKTOP_AUTH_SIGNING_KEY is required to protect trial device claims.')
  return createHmac('sha256', secret).update(`cutly-trial-device:${deviceId}`).digest('hex')
}

export const TRIAL_ACTIONS = Object.freeze({
  clip_generation: { limitField: 'clipGenerationsMax', reserveMicros: 50_000 },
  smart_clean: { limitField: 'smartCleanMax', reserveMicros: 50_000 },
  caption_translation: { limitField: 'captionTranslationsMax', reserveMicros: 50_000 },
  media_assistant_plan: { limitField: 'mediaAssistantPlansMax', reserveMicros: 100_000 }
})

const DEFAULT_CONFIG = {
  enabled: true,
  clipGenerationsMax: 2,
  smartCleanMax: 1,
  captionTranslationsMax: 2,
  mediaAssistantPlansMax: 1,
  dailyBudgetMicros: 1_000_000,
  monthlyBudgetMicros: 10_000_000
}

const firstRow = async (database, statement) => {
  const [row] = await database.all(statement)
  return row || null
}

const ensureConfig = async () => {
  const db = getDb()
  const columns = await db.all(sql`PRAGMA table_info('trial_config')`)
  const hasMediaAssistantLimit = columns.some(
    (column) => column.name === 'media_assistant_plans_max'
  )

  if (hasMediaAssistantLimit) {
    await db.run(sql`
      INSERT INTO trial_config (
        id, enabled, clip_generations_max, smart_clean_max,
        caption_translations_max, media_assistant_plans_max,
        daily_budget_micros, monthly_budget_micros
      ) VALUES (
        'global', ${DEFAULT_CONFIG.enabled ? 1 : 0}, ${DEFAULT_CONFIG.clipGenerationsMax},
        ${DEFAULT_CONFIG.smartCleanMax}, ${DEFAULT_CONFIG.captionTranslationsMax},
        ${DEFAULT_CONFIG.mediaAssistantPlansMax},
        ${DEFAULT_CONFIG.dailyBudgetMicros}, ${DEFAULT_CONFIG.monthlyBudgetMicros}
      ) ON CONFLICT(id) DO NOTHING
    `)
    return firstRow(db, sql`
      SELECT enabled, clip_generations_max AS clipGenerationsMax,
        smart_clean_max AS smartCleanMax,
        caption_translations_max AS captionTranslationsMax,
        media_assistant_plans_max AS mediaAssistantPlansMax,
        daily_budget_micros AS dailyBudgetMicros,
        monthly_budget_micros AS monthlyBudgetMicros,
        updated_at AS updatedAt, updated_by AS updatedBy
      FROM trial_config WHERE id = 'global'
    `)
  }

  // Migration 0006 adds this optional feature-specific limit. Older production
  // databases can still resolve account access while that migration is pending;
  // getTrialConfig supplies the same default used for a new configuration.
  console.warn('Trial config is missing media_assistant_plans_max; using the default allowance.')
  await db.run(sql`
    INSERT INTO trial_config (
      id, enabled, clip_generations_max, smart_clean_max,
      caption_translations_max, daily_budget_micros, monthly_budget_micros
    ) VALUES (
      'global', ${DEFAULT_CONFIG.enabled ? 1 : 0}, ${DEFAULT_CONFIG.clipGenerationsMax},
      ${DEFAULT_CONFIG.smartCleanMax}, ${DEFAULT_CONFIG.captionTranslationsMax},
      ${DEFAULT_CONFIG.dailyBudgetMicros}, ${DEFAULT_CONFIG.monthlyBudgetMicros}
    ) ON CONFLICT(id) DO NOTHING
  `)
  return firstRow(db, sql`
    SELECT enabled, clip_generations_max AS clipGenerationsMax,
      smart_clean_max AS smartCleanMax,
      caption_translations_max AS captionTranslationsMax,
      daily_budget_micros AS dailyBudgetMicros,
      monthly_budget_micros AS monthlyBudgetMicros,
      updated_at AS updatedAt, updated_by AS updatedBy
    FROM trial_config WHERE id = 'global'
  `)
}

export const getTrialConfig = async () => {
  const config = await ensureConfig()
  return {
    enabled: config?.enabled === 1 || config?.enabled === true,
    clipGenerationsMax: Number(config?.clipGenerationsMax ?? DEFAULT_CONFIG.clipGenerationsMax),
    smartCleanMax: Number(config?.smartCleanMax ?? DEFAULT_CONFIG.smartCleanMax),
    captionTranslationsMax: Number(config?.captionTranslationsMax ?? DEFAULT_CONFIG.captionTranslationsMax),
    mediaAssistantPlansMax: Number(config?.mediaAssistantPlansMax ?? DEFAULT_CONFIG.mediaAssistantPlansMax),
    dailyBudgetMicros: Number(config?.dailyBudgetMicros ?? DEFAULT_CONFIG.dailyBudgetMicros),
    monthlyBudgetMicros: Number(config?.monthlyBudgetMicros ?? DEFAULT_CONFIG.monthlyBudgetMicros),
    updatedAt: config?.updatedAt || null,
    updatedBy: config?.updatedBy || null
  }
}

export const getTrialConfigForAdmin = getTrialConfig

export const updateTrialConfig = async (values, updatedBy) => {
  const current = await getTrialConfig()
  const next = { ...current, ...values }
  const db = getDb()
  await db.run(sql`
    UPDATE trial_config SET
      enabled = ${next.enabled ? 1 : 0},
      clip_generations_max = ${next.clipGenerationsMax},
      smart_clean_max = ${next.smartCleanMax},
      caption_translations_max = ${next.captionTranslationsMax},
      media_assistant_plans_max = ${next.mediaAssistantPlansMax},
      daily_budget_micros = ${next.dailyBudgetMicros},
      monthly_budget_micros = ${next.monthlyBudgetMicros},
      updated_by = ${updatedBy}, updated_at = CURRENT_TIMESTAMP
    WHERE id = 'global'
  `)
  return getTrialConfig()
}

const getUsage = async (userId) => {
  const rows = await getDb().all(sql`
    SELECT action, used_count AS usedCount
    FROM trial_usage_counts WHERE user_id = ${userId}
  `)
  return Object.fromEntries(rows.map((row) => [row.action, Number(row.usedCount || 0)]))
}

export const getTrialAccount = async (userId) => {
  return firstRow(getDb(), sql`
    SELECT user_id AS userId, status, created_at AS createdAt
    FROM trial_accounts WHERE user_id = ${userId}
  `)
}

export const getTrialSnapshot = async (userId) => {
  const [account, config, usage] = await Promise.all([
    getTrialAccount(userId),
    getTrialConfig(),
    getUsage(userId)
  ])
  const limits = {
    clip_generation: config.clipGenerationsMax,
    smart_clean: config.smartCleanMax,
    caption_translation: config.captionTranslationsMax,
    media_assistant_plan: config.mediaAssistantPlansMax
  }
  const used = {
    clip_generation: usage.clip_generation || 0,
    smart_clean: usage.smart_clean || 0,
    caption_translation: usage.caption_translation || 0,
    media_assistant_plan: usage.media_assistant_plan || 0
  }
  const remaining = Object.fromEntries(
    Object.entries(limits).map(([action, limit]) => [action, Math.max(0, limit - used[action])])
  )
  const remainingTotal = Object.values(remaining).reduce((total, count) => total + count, 0)

  return {
    status: !account || account.status !== 'active' || !config.enabled
      ? 'trial-unavailable'
      : remainingTotal > 0 ? 'trial' : 'trial-complete',
    trial: {
      enabled: config.enabled,
      startedAt: account?.createdAt || null,
      limits,
      used,
      remaining,
      remainingTotal
    }
  }
}

export const enrollTrialAccount = async (userId, deviceHash) => {
  const db = getDb()
  const existing = await getTrialAccount(userId)
  if (existing) {
    const claim = await firstRow(db, sql`
      SELECT user_id AS userId FROM trial_device_claims WHERE device_hash = ${deviceHash}
    `)
    if (claim && claim.userId !== userId) return { success: false, reason: 'device_claimed' }
    await db.run(sql`
      INSERT INTO trial_device_claims (device_hash, user_id)
      VALUES (${deviceHash}, ${userId}) ON CONFLICT(device_hash) DO NOTHING
    `)
    await db.run(sql`
      UPDATE trial_device_claims SET last_seen_at = CURRENT_TIMESTAMP
      WHERE device_hash = ${deviceHash} AND user_id = ${userId}
    `)
    return { success: true }
  }

  const claimResult = await db.run(sql`
    INSERT INTO trial_device_claims (device_hash, user_id)
    VALUES (${deviceHash}, ${userId}) ON CONFLICT(device_hash) DO NOTHING
  `)
  if (claimResult.rowsAffected !== 1) {
    const claim = await firstRow(db, sql`
      SELECT user_id AS userId FROM trial_device_claims WHERE device_hash = ${deviceHash}
    `)
    if (claim?.userId !== userId) return { success: false, reason: 'device_claimed' }
  }
  await db.run(sql`
    INSERT INTO trial_accounts (user_id, status)
    VALUES (${userId}, 'active') ON CONFLICT(user_id) DO NOTHING
  `)
  return { success: true }
}

const requestByKey = (database, userId, requestId) => firstRow(database, sql`
  SELECT action, status, response_json AS responseJson, error_message AS errorMessage
  FROM trial_action_requests WHERE user_id = ${userId} AND request_id = ${requestId}
`)

const saveRejectedRequest = (database, userId, requestId, status, message) => database.run(sql`
  UPDATE trial_action_requests SET status = ${status}, error_message = ${message},
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = ${userId} AND request_id = ${requestId}
`)

const releaseBudgetReservation = (database, dayKey, amount) => database.run(sql`
  UPDATE trial_daily_spend SET
    reserved_micros = MAX(0, reserved_micros - ${amount}), updated_at = CURRENT_TIMESTAMP
  WHERE day_key = ${dayKey}
`)

const releaseMonthlyReservation = (database, monthKey, amount) => database.run(sql`
  UPDATE trial_monthly_spend SET
    reserved_micros = MAX(0, reserved_micros - ${amount}), updated_at = CURRENT_TIMESTAMP
  WHERE month_key = ${monthKey}
`)

const expireStaleRequests = async (transaction) => {
  const staleRequests = await transaction.all(sql`
    SELECT id, day_key AS dayKey, month_key AS monthKey, reserved_micros AS reservedMicros
    FROM trial_action_requests
    WHERE status = 'pending' AND created_at < datetime('now', '-15 minutes')
  `)

  for (const stale of staleRequests) {
    const expired = await transaction.run(sql`
      UPDATE trial_action_requests SET
        status = 'failed', error_message = 'This trial action timed out.',
        cost_micros = reserved_micros, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${stale.id} AND status = 'pending'
    `)
    if (expired.rowsAffected !== 1) continue

    await transaction.run(sql`
      UPDATE trial_daily_spend SET
        reserved_micros = MAX(0, reserved_micros - ${stale.reservedMicros}),
        spent_micros = spent_micros + ${stale.reservedMicros},
        updated_at = CURRENT_TIMESTAMP
      WHERE day_key = ${stale.dayKey}
    `)
    await transaction.run(sql`
      UPDATE trial_monthly_spend SET
        reserved_micros = MAX(0, reserved_micros - ${stale.reservedMicros}),
        spent_micros = spent_micros + ${stale.reservedMicros},
        updated_at = CURRENT_TIMESTAMP
      WHERE month_key = ${stale.monthKey}
    `)
  }

  await transaction.run(sql`
    DELETE FROM trial_action_requests
    WHERE status != 'pending' AND created_at < datetime('now', '-1 day')
  `)
}

export const reserveTrialAction = async ({ userId, action, requestId, config }) => {
  const db = getDb()
  const actionConfig = TRIAL_ACTIONS[action]
  if (!actionConfig) return { kind: 'rejected', message: 'This trial feature is not available.' }
  if (!config.enabled) return { kind: 'rejected', message: 'The free trial is temporarily paused.' }

  return db.transaction(async (transaction) => {
    // Expire reservations and update both shared budgets in one transaction.
    // The conditional status update makes cleanup safe when requests race.
    await expireStaleRequests(transaction)

    const inserted = await transaction.run(sql`
      INSERT INTO trial_action_requests (
        id, user_id, request_id, action, status, day_key, month_key, reserved_micros
      ) VALUES (
        ${randomUUID()}, ${userId}, ${requestId}, ${action}, 'pending',
        strftime('%Y-%m-%d', 'now'), strftime('%Y-%m', 'now'), ${actionConfig.reserveMicros}
      ) ON CONFLICT(user_id, request_id) DO NOTHING
    `)

    if (inserted.rowsAffected !== 1) {
      const existing = await requestByKey(transaction, userId, requestId)
      if (!existing || existing.action !== action) {
        return { kind: 'rejected', message: 'This request ID has already been used.' }
      }
      if (existing.status === 'succeeded' && existing.responseJson) {
        return { kind: 'replay', response: JSON.parse(existing.responseJson) }
      }
      if (existing.status === 'failed' || existing.status === 'rejected') {
        return { kind: 'rejected', message: existing.errorMessage || 'This request could not be completed.' }
      }
      return { kind: 'pending' }
    }

    const period = await firstRow(transaction, sql`
      SELECT strftime('%Y-%m-%d', 'now') AS dayKey, strftime('%Y-%m', 'now') AS monthKey
    `)
    const dayKey = period?.dayKey
    const monthKey = period?.monthKey
    await transaction.run(sql`
      INSERT INTO trial_daily_spend (day_key, reserved_micros, spent_micros)
      VALUES (${dayKey}, 0, 0) ON CONFLICT(day_key) DO NOTHING
    `)
    const spendReservation = await firstRow(transaction, sql`
      UPDATE trial_daily_spend SET
        reserved_micros = reserved_micros + ${actionConfig.reserveMicros},
        updated_at = CURRENT_TIMESTAMP
      WHERE day_key = ${dayKey}
        AND spent_micros + reserved_micros + ${actionConfig.reserveMicros} <= ${config.dailyBudgetMicros}
      RETURNING day_key AS dayKey
    `)
    if (!spendReservation) {
      const message = 'The free trial has reached today’s usage limit. Please try again tomorrow.'
      await saveRejectedRequest(transaction, userId, requestId, 'rejected', message)
      return { kind: 'rejected', message }
    }

    await transaction.run(sql`
      INSERT INTO trial_monthly_spend (month_key, reserved_micros, spent_micros)
      VALUES (${monthKey}, 0, 0) ON CONFLICT(month_key) DO NOTHING
    `)
    const monthlyReservation = await firstRow(transaction, sql`
      UPDATE trial_monthly_spend SET
        reserved_micros = reserved_micros + ${actionConfig.reserveMicros},
        updated_at = CURRENT_TIMESTAMP
      WHERE month_key = ${monthKey}
        AND spent_micros + reserved_micros + ${actionConfig.reserveMicros} <= ${config.monthlyBudgetMicros}
      RETURNING month_key AS monthKey
    `)
    if (!monthlyReservation) {
      await releaseBudgetReservation(transaction, dayKey, actionConfig.reserveMicros)
      const message = 'The free trial has reached this month’s usage limit.'
      await saveRejectedRequest(transaction, userId, requestId, 'rejected', message)
      return { kind: 'rejected', message }
    }

    const limit = Number(config[actionConfig.limitField])
    const usageReservation = await firstRow(transaction, sql`
      INSERT INTO trial_usage_counts (user_id, action, used_count)
      VALUES (${userId}, ${action}, 1)
      ON CONFLICT(user_id, action) DO UPDATE SET
        used_count = trial_usage_counts.used_count + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE trial_usage_counts.used_count < ${limit}
      RETURNING used_count AS usedCount
    `)
    if (!usageReservation) {
      await releaseBudgetReservation(transaction, dayKey, actionConfig.reserveMicros)
      await releaseMonthlyReservation(transaction, monthKey, actionConfig.reserveMicros)
      const message = 'You’ve used all free actions for this feature.'
      await saveRejectedRequest(transaction, userId, requestId, 'rejected', message)
      return { kind: 'quota', message }
    }

    await transaction.run(sql`
      UPDATE trial_action_requests SET day_key = ${dayKey}, month_key = ${monthKey}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND request_id = ${requestId}
    `)
    return { kind: 'reserved', dayKey, monthKey, reserveMicros: actionConfig.reserveMicros }
  })
}

const costFromUsage = (usage) => {
  const inputTokens = Math.max(0, Math.trunc(Number(usage?.prompt_tokens || usage?.input_tokens || 0)))
  const outputTokens = Math.max(0, Math.trunc(Number(usage?.completion_tokens || usage?.output_tokens || 0)))
  const providerCost = Number(usage?.cost)
  // OpenRouter's current list price for GPT-6 Luna is $0.10/M input and
  // $0.50/M output. Use a 20% reserve margin if the response omits cost.
  const costMicros = Number.isFinite(providerCost) && providerCost >= 0
    ? Math.ceil(providerCost * 1_200_000)
    : Math.ceil(inputTokens * 0.12 + outputTokens * 0.6)
  return { inputTokens, outputTokens, costMicros }
}

export const settleTrialAction = async ({
  userId,
  requestId,
  result,
  usage,
  chargeEstimate = false,
  errorMessage,
  refundAction = false
}) => {
  const db = getDb()
  return db.transaction(async (transaction) => {
    const request = await firstRow(transaction, sql`
      SELECT action, status, day_key AS dayKey, month_key AS monthKey,
        reserved_micros AS reservedMicros
      FROM trial_action_requests
      WHERE user_id = ${userId} AND request_id = ${requestId}
    `)
    if (!request || request.status !== 'pending') return null

    const { inputTokens, outputTokens, costMicros: measuredCost } = costFromUsage(usage)
    const costMicros = usage ? measuredCost : chargeEstimate ? request.reservedMicros : 0
    const status = errorMessage ? 'failed' : 'succeeded'
    const responseJson = result ? JSON.stringify(result) : null
    await transaction.run(sql`
      UPDATE trial_daily_spend SET
        reserved_micros = MAX(0, reserved_micros - ${request.reservedMicros}),
        spent_micros = spent_micros + ${costMicros},
        updated_at = CURRENT_TIMESTAMP
      WHERE day_key = ${request.dayKey}
    `)
    await transaction.run(sql`
      UPDATE trial_monthly_spend SET
        reserved_micros = MAX(0, reserved_micros - ${request.reservedMicros}),
        spent_micros = spent_micros + ${costMicros},
        updated_at = CURRENT_TIMESTAMP
      WHERE month_key = ${request.monthKey}
    `)
    if (refundAction) {
      await transaction.run(sql`
        UPDATE trial_usage_counts SET used_count = MAX(0, used_count - 1), updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND action = ${request.action}
      `)
    }
    await transaction.run(sql`
      UPDATE trial_action_requests SET
        status = ${status}, response_json = ${responseJson}, error_message = ${errorMessage || null},
        input_tokens = ${inputTokens}, output_tokens = ${outputTokens},
        cost_micros = ${costMicros}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND request_id = ${requestId} AND status = 'pending'
    `)
    return { inputTokens, outputTokens, costMicros }
  })
}

export const isTrialAdmin = (userId) => {
  const allowed = (process.env.TRIAL_ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  return Boolean(userId && allowed.includes(userId))
}
