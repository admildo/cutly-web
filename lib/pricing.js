export const LIFETIME_LICENSE_PRICE_EUR = 29

export const LIFETIME_LICENSE_PRICE_LABEL = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
}).format(LIFETIME_LICENSE_PRICE_EUR)
