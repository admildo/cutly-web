'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function BuyLicenseButton({ priceLabel, autoStart = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const autoStarted = useRef(false)

  const startCheckout = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST' })
      if (response.status === 401) {
        // The session expired; sign in again and come straight back to checkout.
        window.location.assign(`/sign-in?returnTo=${encodeURIComponent('/dashboard?buy=1')}`)
        return
      }
      const payload = await response.json()
      if (response.status === 409) {
        window.location.assign('/dashboard')
        return
      }
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Could not start checkout.')
      window.location.assign(payload.url)
    } catch (checkoutError) {
      setError(checkoutError.message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!autoStart || autoStarted.current) return
    autoStarted.current = true
    void startCheckout()
  }, [autoStart, startCheckout])

  return (
    <div>
      <button type="button" onClick={startCheckout} disabled={loading} className="min-h-12 rounded-full bg-[#f2f2ee] px-6 text-sm font-semibold text-[#17171a] shadow-[0_6px_20px_rgb(0_0_0/.24)] transition hover:bg-white hover:shadow-[0_9px_26px_rgb(0_0_0/.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">
        {loading ? 'Opening checkout…' : priceLabel ? `Buy lifetime · ${priceLabel}` : 'Buy lifetime license'}
      </button>
      {error ? <p className="mt-3 text-sm text-[#f2f2ee]">{error}</p> : null}
    </div>
  )
}
