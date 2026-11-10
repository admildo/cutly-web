'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { button } from './dashboard-ui'

export function RefreshTrialUsageButton() {
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={refreshing}
      className={button.small}
    >
      {refreshing ? 'Updating…' : 'Refresh usage'}
    </button>
  )
}
