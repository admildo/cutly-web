'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { button } from './dashboard-ui'

export function RefreshLicenseStatusButton() {
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()

  // The webhook usually lands within seconds; keep checking so the person doesn't have to.
  useEffect(() => {
    let attempts = 0
    const timer = setInterval(() => {
      attempts += 1
      if (attempts > 20) clearInterval(timer)
      else router.refresh()
    }, 3000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={refreshing}
      className={button.secondary}
    >
      {refreshing ? 'Checking…' : 'Check again'}
    </button>
  )
}
