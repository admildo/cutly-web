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
      className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium text-[#d4d4d7] transition hover:border-white/50 hover:text-white disabled:opacity-60"
    >
      {refreshing ? 'Checking…' : 'Check again'}
    </button>
  )
}
