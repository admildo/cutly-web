'use client'

import { useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'

export function AccountMenu() {
  const { signOut } = useClerk()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut({ redirectUrl: '/' })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/account" className="text-sm font-medium text-[#d4d4d7] underline-offset-4 hover:text-white hover:underline">Account settings</Link>
      <button type="button" onClick={handleSignOut} disabled={signingOut} className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-[#d4d4d7] transition hover:border-white/50 hover:text-white disabled:opacity-60">
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
