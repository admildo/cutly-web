export function normalizeInternalReturnPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/'
  }

  try {
    const destination = new URL(value, 'https://cutly.invalid')
    if (destination.origin !== 'https://cutly.invalid') return '/'
    if (/^\/(sign-in|sign-up|sso-callback)(\/|$)/.test(destination.pathname)) return '/'
    return `${destination.pathname}${destination.search}${destination.hash}`
  } catch {
    return '/'
  }
}
