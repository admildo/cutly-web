// Rules for a creator program application. Pure, so the dashboard form and the API share one definition.

export const CREATOR_PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'X', 'Twitch', 'Other']

export const CREATOR_AUDIENCES = [
  { value: 'under-1k', label: 'Under 1,000' },
  { value: '1k-10k', label: '1,000 to 10,000' },
  { value: '10k-100k', label: '10,000 to 100,000' },
  { value: '100k-plus', label: 'More than 100,000' }
]

export const CREATOR_PLAN_LIMITS = Object.freeze({ min: 20, max: 600 })

// Each approved creator gets an OpenRouter key with a spending limit in US cents, set by the admin at approval.
export const CREATOR_CREDIT_LIMIT_CENTS = Object.freeze({ min: 40, max: 100 })

// The most creators the program will ever approve. Each approval creates a paid-for key.
export const CREATOR_PROGRAM_MAX_APPROVED = 10

const dayFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })

// SQLite stores UTC timestamps without a zone, so read those as UTC.
export const formatCreatorDate = (value) => {
  if (!value) return ''
  const date = new Date(/^\d{4}-\d{2}-\d{2} \d/.test(value) ? `${value.replace(' ', 'T')}Z` : value)
  return Number.isNaN(date.valueOf()) ? '' : dayFormat.format(date)
}

export const formatCreatorUsd = (value) => `$${Number(value).toFixed(2)}`

export const creatorAudienceLabel = (value) => CREATOR_AUDIENCES.find((option) => option.value === value)?.label || value

export class CreatorProgramError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'CreatorProgramError'
    this.status = status
  }
}

const normalizeProfileUrl = (value) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw || raw.length > 300 || /\s/.test(raw)) {
    throw new CreatorProgramError('Add a link to your main channel or profile.')
  }

  // Accept a bare domain or an http link, and always store it as https.
  const candidate = raw.replace(/^https?:\/\//i, '')
  let url
  try {
    url = new URL(`https://${candidate}`)
  } catch {
    throw new CreatorProgramError('Enter a valid link, such as youtube.com/@yourname.')
  }
  if (!url.hostname.includes('.')) {
    throw new CreatorProgramError('Enter a valid link, such as youtube.com/@yourname.')
  }
  return url.href
}

const normalizePlatforms = (value) => {
  const platforms = Array.isArray(value) ? [...new Set(value)] : []
  if (platforms.length === 0 || platforms.some((platform) => !CREATOR_PLATFORMS.includes(platform))) {
    throw new CreatorProgramError('Choose where you publish.')
  }
  return platforms
}

const normalizeAudience = (value) => {
  if (!CREATOR_AUDIENCES.some((option) => option.value === value)) {
    throw new CreatorProgramError('Choose your audience size.')
  }
  return value
}

const normalizePlan = (value) => {
  const plan = typeof value === 'string' ? value.trim() : ''
  if (plan.length < CREATOR_PLAN_LIMITS.min || plan.length > CREATOR_PLAN_LIMITS.max) {
    throw new CreatorProgramError(
      `Describe what you will make with Deyn Studio in ${CREATOR_PLAN_LIMITS.min} to ${CREATOR_PLAN_LIMITS.max} characters.`
    )
  }
  return plan
}

/** Returns the cleaned application, or throws a CreatorProgramError that names the first problem. */
export const normalizeCreatorApplication = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new CreatorProgramError('A creator application is required.')
  }
  return {
    profileUrl: normalizeProfileUrl(input.profileUrl),
    platforms: normalizePlatforms(input.platforms),
    audience: normalizeAudience(input.audience),
    plan: normalizePlan(input.plan)
  }
}
