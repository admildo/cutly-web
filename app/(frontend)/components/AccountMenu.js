'use client'

import { useClerk } from '@clerk/nextjs'
import { SignOut } from '@phosphor-icons/react'
import { useState } from 'react'
import { button } from './dashboard-ui'

export function AccountMenu({ className = '' }) {
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
    <button type="button" onClick={handleSignOut} disabled={signingOut} className={`${button.quiet} ${className}`}>
      <SignOut aria-hidden="true" className="size-4" />
      {signingOut ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
