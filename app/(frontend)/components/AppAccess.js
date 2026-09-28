'use client'

import { useState } from 'react'

export function AppAccess({ downloadUrl, compact = false, allowReleasePage = true }) {
  const [opening, setOpening] = useState(false)
  const openApp = () => {
    setOpening(true)
    window.location.assign('cutly://open')
    window.setTimeout(() => setOpening(false), 1800)
  }

  return (
    <section className={`flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-black/10 bg-white p-6 ${compact ? 'max-w-[34rem]' : ''}`} aria-label="Cutly desktop app">
      <div>
        <p className="text-sm font-medium">Use Cutly on your desktop</p>
        <p className="mt-1 text-sm leading-6 text-black/55">
          {compact ? 'Open the app if it is installed, or download it to get started.' : 'Your account and license are ready in the Cutly desktop app.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={openApp} className="rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black">
          {opening ? 'Opening Cutly…' : 'Open Cutly'}
        </button>
        {downloadUrl ? (
          <a href={downloadUrl} className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-medium transition hover:border-black/35">Download app</a>
        ) : allowReleasePage ? (
          <LinkToRelease />
        ) : (
          <span className="self-center text-sm text-black/55">Download link coming soon</span>
        )}
      </div>
    </section>
  )
}

function LinkToRelease() {
  return <a href="/download" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-medium transition hover:border-black/35">Download app</a>
}
