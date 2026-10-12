'use client'

import { useClerk } from '@clerk/nextjs'
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
      <button type="button" onClick={handleSignOut} disabled={signingOut} className="min-h-10 rounded-full bg-[#1b1c20] px-4 text-sm font-medium text-[#c7c7cb] shadow-[0_4px_14px_rgb(0_0_0/.16)] transition hover:bg-[#25262a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60">
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
