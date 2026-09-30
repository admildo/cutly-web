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
      <Link href="/account" className="text-sm font-medium text-[#a6a4a4] underline-offset-4 hover:text-[#f2f0ef] hover:underline">Account settings</Link>
      <button type="button" onClick={handleSignOut} disabled={signingOut} className="rounded-full border border-[#807e7e] px-4 py-2 text-sm font-medium text-[#cccbca] transition hover:border-[#cccbca] hover:text-[#f2f0ef] disabled:opacity-60">
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
