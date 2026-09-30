'use client'

import { useState } from 'react'

export function AppAccess({ downloadUrl, compact = false, allowReleasePage = true, licensed = false, dark = true }) {
  const [opening, setOpening] = useState(false)
  const shell = dark ? 'border-[#807e7e]/50 bg-[#242322] text-[#f2f0ef]' : 'border-black/10 bg-white text-[#171717]'
  const copy = dark ? 'text-[#a6a4a4]' : 'text-black/55'
  const primary = dark ? 'bg-[#f2f0ef] text-[#171716] hover:bg-[#cccbca]' : 'bg-[#171717] text-white hover:bg-black'
  const secondary = dark ? 'border-[#807e7e] bg-[#242322] text-[#cccbca] hover:border-[#cccbca] hover:text-[#f2f0ef]' : 'border-black/15 bg-white text-[#171717] hover:border-black/35'
  const openApp = () => {
    setOpening(true)
    window.location.assign('cutly://open')
    window.setTimeout(() => setOpening(false), 1800)
  }

  return (
    <section className={`flex flex-wrap items-center justify-between gap-5 rounded-2xl border p-6 ${shell} ${compact ? 'max-w-[34rem]' : ''}`} aria-label="Cutly desktop app">
      <div>
        <p className="text-sm font-medium">Use Cutly on your desktop</p>
        <p className={`mt-1 text-sm leading-6 ${copy}`}>
          {licensed ? 'Your account and license are ready in the Cutly desktop app.' : 'Open the desktop app if it is installed, or download Cutly to get started.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={openApp} className={`rounded-full px-5 py-3 text-sm font-medium transition ${primary}`}>
          {opening ? 'Opening Cutly…' : 'Open Cutly'}
        </button>
        {downloadUrl ? (
          <a href={downloadUrl} className={`rounded-full border px-5 py-3 text-sm font-medium transition ${secondary}`}>Download app</a>
        ) : allowReleasePage ? (
          <LinkToRelease dark={dark} />
        ) : (
          <span className={`self-center text-sm ${copy}`}>Download link coming soon</span>
        )}
      </div>
    </section>
  )
}

function LinkToRelease({ dark }) {
  return <a href="/download" className={`rounded-full border px-5 py-3 text-sm font-medium transition ${dark ? 'border-[#807e7e] bg-[#242322] text-[#cccbca] hover:border-[#cccbca] hover:text-[#f2f0ef]' : 'border-black/15 bg-white text-[#171717] hover:border-black/35'}`}>Download app</a>
}
