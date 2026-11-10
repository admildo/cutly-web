'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import { AccountShell } from '@/app/components/AccountShell'
import { CardHeader, button, card, field, fieldLabel } from '@/app/components/dashboard-ui'

export function AccountSettings({ initialProfile, isTrialAdmin = false }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [firstName, setFirstName] = useState(initialProfile.firstName || '')
  const [lastName, setLastName] = useState(initialProfile.lastName || '')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const saveProfile = async (event) => {
    event.preventDefault()
    if (!user || savingProfile) return

    setSavingProfile(true)
    setProfileError('')
    setProfileMessage('')
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
      setProfileMessage('Your profile has been updated.')
    } catch (error) {
      setProfileError(error?.errors?.[0]?.longMessage || 'We couldn’t save your profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  const deleteAccount = async () => {
    if (confirmation !== 'DELETE' || deleting) return

    setDeleting(true)
    setDeleteError('')
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'We couldn’t delete your account. Please try again.')

      try {
        await signOut()
      } catch {
        // Account deletion already invalidated the user on the server.
      }
      window.location.replace('/')
    } catch (error) {
      setDeleteError(error.message || 'We couldn’t delete your account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <AccountShell active="settings" profile={initialProfile} isAdmin={isTrialAdmin} title="Settings" description="Manage the details connected to your Deyn Studio account.">
      <div className="grid gap-5">
        <form onSubmit={saveProfile} className={card}>
          <CardHeader title="Profile" description="Your name appears with your Deyn Studio account." />

          <div className="grid gap-4 px-5 pb-5 pt-5 sm:grid-cols-2 sm:px-6">
            <label className={fieldLabel}>
              First name
              <input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={field} />
            </label>
            <label className={fieldLabel}>
              Last name
              <input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className={field} />
            </label>
            <div className="sm:col-span-2">
              <label className={fieldLabel}>
                Sign-in email
                <input readOnly value={initialProfile.email || 'No email address available'} className={`${field} cursor-default text-app-mute hover:border-app-line focus-visible:border-app-line`} />
              </label>
              <p className="m-0 mt-1.5 text-xs leading-5 text-app-faint">Your Google account manages this email address.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-line px-5 py-4 sm:px-6">
            <div aria-live="polite" className="min-h-5 text-sm">
              {profileError ? <p role="alert" className="m-0 text-app-danger">{profileError}</p> : null}
              {profileMessage ? <p role="status" className="m-0 text-app-ok">{profileMessage}</p> : null}
            </div>
            <button type="submit" disabled={!isLoaded || savingProfile} className={button.primary}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

        <section aria-labelledby="delete-account-title" className="rounded-xl border border-app-danger/25 bg-app-panel">
          <CardHeader
            id="delete-account-title"
            title="Delete account"
            description={<>Permanently remove your Deyn Studio sign-in and profile. This also signs out your desktop sessions. License and transaction records may be retained as described in our <Link href="/privacy" className="text-app-ink underline underline-offset-2">Privacy Policy</Link>.</>}
          />

          <div className="px-5 pb-5 pt-5 sm:px-6">
            {!confirmingDelete ? (
              <button type="button" onClick={() => setConfirmingDelete(true)} className={`${button.secondary} !border-app-danger/30 !text-app-danger hover:!bg-app-danger/10`}>
                Delete account
              </button>
            ) : (
              <div className="max-w-md">
                <p className="m-0 text-sm font-medium text-app-ink">This action can’t be undone.</p>
                <label className={`${fieldLabel} mt-3 font-normal text-app-mute`}>
                  <span>Type <span className="font-semibold text-app-ink">DELETE</span> to confirm.</span>
                  <input autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={field} />
                </label>
                {deleteError ? <p role="alert" className="m-0 mt-3 text-sm text-app-danger">{deleteError}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={deleteAccount} disabled={confirmation !== 'DELETE' || deleting} className={`${button.primary} !bg-app-danger hover:!bg-[#f29b96] disabled:!cursor-not-allowed`}>
                    {deleting ? 'Deleting account…' : 'Permanently delete account'}
                  </button>
                  <button type="button" onClick={() => { setConfirmingDelete(false); setConfirmation(''); setDeleteError('') }} disabled={deleting} className={button.secondary}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AccountShell>
  )
}
