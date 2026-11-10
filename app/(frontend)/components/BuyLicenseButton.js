'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { button } from './dashboard-ui'

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
      <button type="button" onClick={startCheckout} disabled={loading} className={button.primary}>
        {loading ? 'Opening checkout…' : priceLabel ? `Buy lifetime · ${priceLabel}` : 'Buy lifetime license'}
      </button>
      {error ? <p role="alert" className="m-0 mt-3 text-sm text-app-danger">{error}</p> : null}
    </div>
  )
}
