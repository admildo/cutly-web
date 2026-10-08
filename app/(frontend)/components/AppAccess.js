'use client'

import { useState } from 'react'

export function AppAccess({ downloadUrl, compact = false, allowReleasePage = true, licensed = false, dark = true }) {
  const [opening, setOpening] = useState(false)
  const shell = dark ? 'border-white/10 bg-[#151619] text-[#f2f2ee] shadow-[0_24px_80px_rgb(0_0_0/.18)]' : 'border-black/10 bg-white text-[#171717]'
  const copy = dark ? 'text-[#a5a6ab]' : 'text-black/55'
  const primary = dark ? 'bg-[#f2f2ee] text-[#17171a] hover:bg-white' : 'bg-[#171717] text-white hover:bg-black'
  const secondary = dark ? 'border-white/20 bg-transparent text-[#d4d4d7] hover:border-white/50 hover:text-white' : 'border-black/15 bg-white text-[#171717] hover:border-black/35'
  const openApp = () => {
    setOpening(true)
    window.location.assign('cutly://open')
    window.setTimeout(() => setOpening(false), 1800)
  }

  return (
    <section className={`flex flex-wrap items-center justify-between gap-5 rounded-[24px] border p-6 sm:p-7 ${shell} ${compact ? 'max-w-[34rem]' : ''}`} aria-label="Deyn Studio desktop app">
      <div>
        <p className="text-sm font-medium">Use Deyn Studio on your desktop</p>
        <p className={`mt-1 text-sm leading-6 ${copy}`}>
          {licensed ? 'Your account and license are ready in Deyn Studio.' : 'Open Deyn Studio if it is installed, or download the app to get started.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={openApp} className={`rounded-full px-5 py-3 text-sm font-medium transition ${primary}`}>
          {opening ? 'Opening Deyn Studio…' : 'Open Deyn Studio'}
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
  return <a href="/download" className={`rounded-full border px-5 py-3 text-sm font-medium transition ${dark ? 'border-white/20 bg-transparent text-[#d4d4d7] hover:border-white/50 hover:text-white' : 'border-black/15 bg-white text-[#171717] hover:border-black/35'}`}>Download app</a>
}
