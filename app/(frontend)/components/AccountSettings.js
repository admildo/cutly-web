'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'

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
    <main className="min-h-screen [color-scheme:dark] bg-[#171716] px-5 py-6 text-[#f2f0ef] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#807e7e]/40 pb-5">
          <Link href="/" aria-label="Deyn Studio home" className="text-sm font-semibold tracking-[0.22em] text-[#f2f0ef] no-underline">DEYN STUDIO</Link>
          <div className="flex flex-wrap items-center gap-4">
            {isTrialAdmin ? <Link href="/account/trial-settings" className="text-sm text-[#a6a4a4] underline-offset-4 hover:text-[#f2f0ef] hover:underline">Trial controls</Link> : null}
            <Link href="/" className="text-sm text-[#a6a4a4] underline-offset-4 hover:text-[#f2f0ef] hover:underline">Back to your license</Link>
            <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="rounded-full border border-[#807e7e] px-4 py-2 text-sm font-medium text-[#cccbca] transition hover:border-[#cccbca] hover:text-[#f2f0ef]">Sign out</button>
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#a6a4a4]">YOUR DEYN STUDIO ACCOUNT</p>
          <h1 className="mb-0 mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Account settings</h1>
          <p className="mb-0 mt-3 max-w-2xl text-base leading-7 text-[#a6a4a4]">Manage the details connected to your Deyn Studio account.</p>

          <form onSubmit={saveProfile} className="mt-9 rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#807e7e]/40 pb-5">
              <div>
                <h2 className="m-0 text-xl font-medium tracking-[-0.025em]">Personal details</h2>
                <p className="mb-0 mt-2 text-sm text-[#a6a4a4]">Your name appears with your Deyn Studio account.</p>
              </div>
              <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-[#343332] text-sm font-semibold text-[#cccbca]">
                {(firstName || initialProfile.email || 'C').slice(0, 1).toUpperCase()}
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#cccbca]">
                First name
                <input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#807e7e] bg-[#171716] px-4 text-[15px] font-normal text-[#f2f0ef] outline-none transition focus:border-[#cccbca] focus:ring-2 focus:ring-[#cccbca]/20" />
              </label>
              <label className="block text-sm font-medium text-[#cccbca]">
                Last name
                <input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#807e7e] bg-[#171716] px-4 text-[15px] font-normal text-[#f2f0ef] outline-none transition focus:border-[#cccbca] focus:ring-2 focus:ring-[#cccbca]/20" />
              </label>
              <div className="sm:col-span-2">
                <span className="block text-sm font-medium text-[#cccbca]">Sign-in email</span>
                <p className="mb-0 mt-2 min-h-12 rounded-xl border border-[#807e7e]/60 bg-[#171716] px-4 py-3 text-[15px] text-[#a6a4a4]">{initialProfile.email || 'No email address available'}</p>
                <p className="mb-0 mt-2 text-xs leading-5 text-[#807e7e]">Your Google account manages this email address.</p>
              </div>
            </div>

            {profileError ? <p role="alert" className="mb-0 mt-5 text-sm text-[#cccbca]">{profileError}</p> : null}
            {profileMessage ? <p role="status" className="mb-0 mt-5 text-sm text-[#cccbca]">{profileMessage}</p> : null}
            <button type="submit" disabled={!isLoaded || savingProfile} className="mt-6 min-h-11 rounded-full bg-[#f2f0ef] px-5 text-sm font-semibold text-[#171716] transition hover:bg-[#cccbca] disabled:cursor-wait disabled:opacity-60">
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <section aria-labelledby="delete-account-title" className="mt-7 rounded-2xl border border-[#807e7e]/50 bg-[#242322] p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-[#a6a4a4]">DATA & PRIVACY</p>
              <h2 id="delete-account-title" className="m-0 text-xl font-medium tracking-[-0.025em]">Delete your account</h2>
              <p className="mb-0 mt-3 text-sm leading-6 text-[#a6a4a4]">You can permanently remove your Deyn Studio sign-in and profile here. This also signs out your desktop sessions. License and transaction records may be retained as described in our <Link href="/privacy" className="font-medium text-[#f2f0ef] underline underline-offset-2">Privacy Policy</Link>.</p>
            </div>

            {!confirmingDelete ? (
              <button type="button" onClick={() => setConfirmingDelete(true)} className="mt-6 min-h-11 rounded-full border border-[#a6a4a4] px-5 text-sm font-semibold text-[#f2f0ef] transition hover:border-[#f2f0ef] hover:bg-[#343332]">
                Delete account
              </button>
            ) : (
              <div className="mt-6 max-w-xl rounded-xl border border-[#807e7e] bg-[#171716] p-4 sm:p-5">
                <p className="mb-0 text-sm font-semibold text-[#f2f0ef]">This action can’t be undone.</p>
                <label className="mt-3 block text-sm text-[#a6a4a4]">
                  Type <span className="font-semibold text-[#f2f0ef]">DELETE</span> to confirm.
                  <input autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#807e7e] bg-[#242322] px-3 text-sm text-[#f2f0ef] outline-none focus:border-[#cccbca] focus:ring-2 focus:ring-[#cccbca]/20" />
                </label>
                {deleteError ? <p role="alert" className="mb-0 mt-3 text-sm text-[#cccbca]">{deleteError}</p> : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={deleteAccount} disabled={confirmation !== 'DELETE' || deleting} className="min-h-11 rounded-full bg-[#cccbca] px-5 text-sm font-semibold text-[#171716] transition hover:bg-[#f2f0ef] disabled:cursor-not-allowed disabled:opacity-45">
                    {deleting ? 'Deleting account…' : 'Permanently delete account'}
                  </button>
                  <button type="button" onClick={() => { setConfirmingDelete(false); setConfirmation(''); setDeleteError('') }} disabled={deleting} className="min-h-11 rounded-full border border-[#807e7e] px-5 text-sm font-medium text-[#cccbca] transition hover:border-[#cccbca] hover:text-[#f2f0ef] disabled:opacity-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}
