'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshLicenseStatusButton() {
  const router = useRouter()
  const [refreshing, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={refreshing}
      className="rounded-full border border-[#807e7e] px-4 py-2.5 text-sm font-medium text-[#cccbca] transition hover:border-[#cccbca] hover:text-[#f2f0ef] disabled:opacity-60"
    >
      {refreshing ? 'Checking…' : 'Check again'}
    </button>
  )
}
