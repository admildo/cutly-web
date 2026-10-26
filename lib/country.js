// Where a request came from, from the country header Vercel sets. Only the two-letter code is kept;
// the IP address is never stored.
const COUNTRY_CODE = /^[A-Z]{2}$/
// Vercel reports XX when it cannot tell, and T1 for Tor exit nodes.
const NOT_A_COUNTRY = new Set(['XX', 'T1'])

const isCountry = (code) => COUNTRY_CODE.test(code) && !NOT_A_COUNTRY.has(code)

export const countryFromRequest = (request) => {
  const code = request.headers.get('x-vercel-ip-country')?.trim().toUpperCase() || ''
  return isCountry(code) ? code : null
}

// Two regional-indicator letters make a flag: PT becomes the Portuguese flag. Windows shows letters instead.
export const flagEmoji = (code) =>
  code && isCountry(code)
    ? String.fromCodePoint(...[...code].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65))
    : null

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export const countryName = (code) => {
  try {
    return regionNames.of(code)
  } catch {
    return code
  }
}
