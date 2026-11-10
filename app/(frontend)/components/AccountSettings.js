'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import { AccountNavigation } from '@/app/components/AccountNavigation'
import { AccountMenu } from '@/app/components/AccountMenu'
import { AccountAvatar } from '@/app/components/AccountAvatar'
import { SiteFooter, SiteHeader } from '@/app/components/SiteChrome'

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
    <main className="relative min-h-screen overflow-hidden [color-scheme:dark] bg-[#08090c] px-5 py-5 text-[#f2f2ee] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgb(255_255_255/.045),transparent_68%)]" />
      <div className="relative mx-auto max-w-4xl">
        <SiteHeader dashboard><div className="flex items-center gap-3"><AccountAvatar firstName={initialProfile.firstName} lastName={initialProfile.lastName} email={initialProfile.email} /><AccountMenu /></div></SiteHeader>
        <AccountNavigation active="settings" showTrialControls={isTrialAdmin} />

        <section className="pb-10 pt-8 sm:pb-14 sm:pt-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#929399]">ACCOUNT SETTINGS</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">Your account</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a5a6ab]">Manage the details connected to your Deyn Studio account.</p>

          <form onSubmit={saveProfile} className="mt-6 rounded-[24px] bg-[#151619] p-5 shadow-[0_18px_54px_rgb(0_0_0/.2)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-lg font-medium tracking-[-0.025em]">Personal details</h2>
                <p className="mb-0 mt-2 text-sm text-[#a5a6ab]">Your name appears with your Deyn Studio account.</p>
              </div>
              <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-[#242529] text-sm font-semibold text-[#d4d4d7] shadow-[0_5px_16px_rgb(0_0_0/.18)]">
                {(firstName || initialProfile.email || 'C').slice(0, 1).toUpperCase()}
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#d4d4d7]">
                First name
                <input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl bg-[#0d0e11] px-4 text-[15px] font-normal text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none transition placeholder:text-[#696a70] focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]" />
              </label>
              <label className="block text-sm font-medium text-[#d4d4d7]">
                Last name
                <input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl bg-[#0d0e11] px-4 text-[15px] font-normal text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none transition placeholder:text-[#696a70] focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]" />
              </label>
              <div className="sm:col-span-2">
                <span className="block text-sm font-medium text-[#d4d4d7]">Sign-in email</span>
                <p className="mb-0 mt-2 min-h-12 rounded-xl bg-[#0d0e11] px-4 py-3 text-[15px] text-[#a5a6ab] shadow-[inset_0_2px_5px_rgb(0_0_0/.28)]">{initialProfile.email || 'No email address available'}</p>
                <p className="mb-0 mt-2 text-xs leading-5 text-[#85858b]">Your Google account manages this email address.</p>
              </div>
            </div>

            {profileError ? <p role="alert" className="mb-0 mt-5 text-sm text-[#f2f2ee]">{profileError}</p> : null}
            {profileMessage ? <p role="status" className="mb-0 mt-5 text-sm text-[#d4d4d7]">{profileMessage}</p> : null}
            <button type="submit" disabled={!isLoaded || savingProfile} className="mt-6 min-h-11 rounded-full bg-[#f2f2ee] px-5 text-sm font-semibold text-[#171716] shadow-[0_6px_20px_rgb(0_0_0/.24)] transition hover:bg-white hover:shadow-[0_9px_26px_rgb(0_0_0/.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <section aria-labelledby="delete-account-title" className="mt-5 rounded-[24px] bg-[#151619] p-5 shadow-[0_18px_54px_rgb(0_0_0/.2)] sm:p-7">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-[#b8b8bd]">DATA & PRIVACY</p>
              <h2 id="delete-account-title" className="m-0 text-lg font-medium tracking-[-0.025em]">Delete your account</h2>
              <p className="mb-0 mt-3 text-sm leading-6 text-[#a5a6ab]">You can permanently remove your Deyn Studio sign-in and profile here. This also signs out your desktop sessions. License and transaction records may be retained as described in our <Link href="/privacy" className="font-medium text-[#f2f2ee] underline underline-offset-2">Privacy Policy</Link>.</p>
            </div>

            {!confirmingDelete ? (
              <button type="button" onClick={() => setConfirmingDelete(true)} className="mt-6 min-h-11 rounded-full bg-[#242529] px-5 text-sm font-semibold text-[#e5e5e7] shadow-[0_4px_14px_rgb(0_0_0/.16)] transition hover:bg-[#2d2e33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
                Delete account
              </button>
            ) : (
              <div className="mt-6 max-w-xl rounded-2xl bg-[#111216] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/.025)] sm:p-5">
                <p className="mb-0 text-sm font-semibold text-[#f2f2ee]">This action can’t be undone.</p>
                <label className="mt-3 block text-sm text-[#a5a6ab]">
                  Type <span className="font-semibold text-[#f2f2ee]">DELETE</span> to confirm.
                  <input autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg bg-[#0d0e11] px-3 text-sm text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]" />
                </label>
                {deleteError ? <p role="alert" className="mb-0 mt-3 text-sm text-[#f2f2ee]">{deleteError}</p> : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={deleteAccount} disabled={confirmation !== 'DELETE' || deleting} className="min-h-11 rounded-full bg-[#d4d4d7] px-5 text-sm font-semibold text-[#171716] shadow-[0_5px_16px_rgb(0_0_0/.2)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45">
                    {deleting ? 'Deleting account…' : 'Permanently delete account'}
                  </button>
                  <button type="button" onClick={() => { setConfirmingDelete(false); setConfirmation(''); setDeleteError('') }} disabled={deleting} className="min-h-11 rounded-full bg-[#242529] px-5 text-sm font-medium text-[#d4d4d7] shadow-[0_4px_14px_rgb(0_0_0/.16)] transition hover:bg-[#2d2e33] hover:text-white disabled:opacity-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </section>
        <SiteFooter dark />
      </div>
    </main>
  )
}
