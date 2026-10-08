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
    <main className="min-h-screen [color-scheme:dark] bg-[#08090c] px-5 py-6 text-[#f2f2ee] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" aria-label="Deyn Studio home" className="text-sm font-semibold tracking-[0.22em] text-[#f2f2ee] no-underline">DEYN STUDIO</Link>
          <div className="flex flex-wrap items-center gap-4">
            {isTrialAdmin ? <Link href="/account/trial-settings" className="text-sm text-[#a5a6ab] underline-offset-4 hover:text-white hover:underline">Trial controls</Link> : null}
            <Link href="/" className="text-sm text-[#a5a6ab] underline-offset-4 hover:text-white hover:underline">Back to your license</Link>
            <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-[#d4d4d7] transition hover:border-white/50 hover:text-white">Sign out</button>
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#b8b8bd]">YOUR DEYN STUDIO ACCOUNT</p>
          <h1 className="mb-0 mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Account settings</h1>
          <p className="mb-0 mt-3 max-w-2xl text-base leading-7 text-[#a5a6ab]">Manage the details connected to your Deyn Studio account.</p>

          <form onSubmit={saveProfile} className="mt-9 rounded-2xl border border-white/10 bg-[#151619] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h2 className="m-0 text-xl font-medium tracking-[-0.025em]">Personal details</h2>
                <p className="mb-0 mt-2 text-sm text-[#a5a6ab]">Your name appears with your Deyn Studio account.</p>
              </div>
              <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-white/[.08] text-sm font-semibold text-[#d4d4d7]">
                {(firstName || initialProfile.email || 'C').slice(0, 1).toUpperCase()}
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#d4d4d7]">
                First name
                <input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#08090c] px-4 text-[15px] font-normal text-[#f2f2ee] outline-none transition focus:border-white/50 focus:ring-2 focus:ring-white/15" />
              </label>
              <label className="block text-sm font-medium text-[#d4d4d7]">
                Last name
                <input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#08090c] px-4 text-[15px] font-normal text-[#f2f2ee] outline-none transition focus:border-white/50 focus:ring-2 focus:ring-white/15" />
              </label>
              <div className="sm:col-span-2">
                <span className="block text-sm font-medium text-[#d4d4d7]">Sign-in email</span>
                <p className="mb-0 mt-2 min-h-12 rounded-xl border border-white/10 bg-[#08090c] px-4 py-3 text-[15px] text-[#a5a6ab]">{initialProfile.email || 'No email address available'}</p>
                <p className="mb-0 mt-2 text-xs leading-5 text-[#85858b]">Your Google account manages this email address.</p>
              </div>
            </div>

            {profileError ? <p role="alert" className="mb-0 mt-5 text-sm text-[#f2f2ee]">{profileError}</p> : null}
            {profileMessage ? <p role="status" className="mb-0 mt-5 text-sm text-[#d4d4d7]">{profileMessage}</p> : null}
            <button type="submit" disabled={!isLoaded || savingProfile} className="mt-6 min-h-11 rounded-full bg-[#f2f2ee] px-5 text-sm font-semibold text-[#171716] transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <section aria-labelledby="delete-account-title" className="mt-7 rounded-2xl border border-white/10 bg-[#151619] p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-[#b8b8bd]">DATA & PRIVACY</p>
              <h2 id="delete-account-title" className="m-0 text-xl font-medium tracking-[-0.025em]">Delete your account</h2>
              <p className="mb-0 mt-3 text-sm leading-6 text-[#a5a6ab]">You can permanently remove your Deyn Studio sign-in and profile here. This also signs out your desktop sessions. License and transaction records may be retained as described in our <Link href="/privacy" className="font-medium text-[#f2f2ee] underline underline-offset-2">Privacy Policy</Link>.</p>
            </div>

            {!confirmingDelete ? (
              <button type="button" onClick={() => setConfirmingDelete(true)} className="mt-6 min-h-11 rounded-full border border-white/25 px-5 text-sm font-semibold text-[#f2f2ee] transition hover:border-white/50 hover:bg-white/[.07]">
                Delete account
              </button>
            ) : (
              <div className="mt-6 max-w-xl rounded-xl border border-white/15 bg-[#111216] p-4 sm:p-5">
                <p className="mb-0 text-sm font-semibold text-[#f2f2ee]">This action can’t be undone.</p>
                <label className="mt-3 block text-sm text-[#a5a6ab]">
                  Type <span className="font-semibold text-[#f2f2ee]">DELETE</span> to confirm.
                  <input autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-white/15 bg-[#151619] px-3 text-sm text-[#f2f2ee] outline-none focus:border-white/50 focus:ring-2 focus:ring-white/15" />
                </label>
                {deleteError ? <p role="alert" className="mb-0 mt-3 text-sm text-[#f2f2ee]">{deleteError}</p> : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={deleteAccount} disabled={confirmation !== 'DELETE' || deleting} className="min-h-11 rounded-full bg-[#d4d4d7] px-5 text-sm font-semibold text-[#171716] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45">
                    {deleting ? 'Deleting account…' : 'Permanently delete account'}
                  </button>
                  <button type="button" onClick={() => { setConfirmingDelete(false); setConfirmation(''); setDeleteError('') }} disabled={deleting} className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-medium text-[#d4d4d7] transition hover:border-white/50 hover:text-white disabled:opacity-50">
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
