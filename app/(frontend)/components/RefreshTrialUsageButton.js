'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshTrialUsageButton() {
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={refreshing}
      className="min-h-10 shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-[#d4d4d7] transition hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
    >
      {refreshing ? 'Updating…' : 'Refresh usage'}
    </button>
  )
}
