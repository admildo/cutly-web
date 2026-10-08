'use client'

import { useState } from 'react'

export function BuyLicenseButton({ priceLabel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST' })
      const payload = await response.json()
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Could not start checkout.')
      window.location.assign(payload.url)
    } catch (checkoutError) {
      setError(checkoutError.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={startCheckout} disabled={loading} className="min-h-12 rounded-full bg-[#f2f2ee] px-6 text-sm font-semibold text-[#17171a] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">
        {loading ? 'Opening checkout…' : priceLabel ? `Buy lifetime · ${priceLabel}` : 'Buy lifetime license'}
      </button>
      {error ? <p className="mt-3 text-sm text-[#f2f2ee]">{error}</p> : null}
    </div>
  )
}
