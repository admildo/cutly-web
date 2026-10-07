'use client'

import { useState } from 'react'

export function BuyLicenseButton() {
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
      <button type="button" onClick={startCheckout} disabled={loading} className="rounded-full bg-[#f2f2ee] px-5 py-3 text-sm font-semibold text-[#17171a] transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
        {loading ? 'Opening checkout…' : 'Buy Deyn Studio Lifetime'}
      </button>
      {error ? <p className="mt-3 text-sm text-[#e5d2a8]">{error}</p> : null}
    </div>
  )
}
