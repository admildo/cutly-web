'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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
      className="min-h-10 rounded-full bg-[#242529] px-4 text-sm font-medium text-[#d4d4d7] shadow-[0_4px_14px_rgb(0_0_0/.16)] transition hover:bg-[#2d2e33] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
    >
      {refreshing ? 'Checking…' : 'Check again'}
    </button>
  )
}
