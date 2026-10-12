'use client'

import { useState } from 'react'

export function AppAccess({ downloadUrl, compact = false, allowReleasePage = true, licensed = false, dark = true }) {
  const [opening, setOpening] = useState(false)
  const [launchMessage, setLaunchMessage] = useState('')
  const shell = dark ? 'bg-[#151619] text-[#f2f2ee] shadow-[0_18px_54px_rgb(0_0_0/.2)]' : 'bg-white text-[#171717] shadow-[0_14px_40px_rgb(0_0_0/.08)]'
  const copy = dark ? 'text-[#a5a6ab]' : 'text-black/55'
  const primary = dark ? 'bg-[#f2f2ee] text-[#17171a] hover:bg-white' : 'bg-[#171717] text-white hover:bg-black'
  const secondary = dark ? 'bg-[#242529] text-[#d4d4d7] shadow-[0_4px_14px_rgb(0_0_0/.16)] hover:bg-[#2d2e33] hover:text-white' : 'bg-[#f2f2f2] text-[#171717] shadow-[0_4px_14px_rgb(0_0_0/.08)] hover:bg-white'
  const openApp = () => {
    setOpening(true)
    setLaunchMessage('')
    window.location.assign('cutly://open')
    window.setTimeout(() => {
      setOpening(false)
      setLaunchMessage('If Deyn Studio didn’t open, check the installation or download the app.')
    }, 1800)
  }

  return (
    <section className={`flex flex-wrap items-center justify-between gap-5 rounded-[24px] p-6 shadow-[0_18px_54px_rgb(0_0_0/.2)] sm:p-7 ${shell} ${compact ? 'max-w-[34rem]' : ''}`} aria-label="Deyn Studio desktop app">
      <div>
        <p className="text-sm font-medium">Open Deyn Studio</p>
        <p className={`mt-1 text-sm leading-6 ${copy}`}>
          {licensed ? 'Use your lifetime desktop license in the app.' : 'Open the desktop app to use your editing tools and account.'}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={openApp} disabled={opening} className={`min-h-12 rounded-full px-6 text-sm font-semibold shadow-[0_6px_20px_rgb(0_0_0/.24)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60 ${primary}`}>
            {opening ? 'Opening Deyn Studio…' : 'Open Deyn Studio'}
          </button>
          {downloadUrl ? (
            <a href={downloadUrl} className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${secondary}`}>Download app</a>
          ) : allowReleasePage ? (
            <LinkToRelease dark={dark} />
          ) : (
            <span className={`self-center text-sm ${copy}`}>Download link coming soon</span>
          )}
        </div>
        {launchMessage ? <p role="status" className={`max-w-sm text-xs leading-5 ${copy}`}>{launchMessage}</p> : null}
      </div>
    </section>
  )
}

function LinkToRelease({ dark }) {
  return <a href="/download" className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium shadow-[0_4px_14px_rgb(0_0_0/.16)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${dark ? 'bg-[#242529] text-[#d4d4d7] hover:bg-[#2d2e33] hover:text-white' : 'bg-[#f2f2f2] text-[#171717] hover:bg-white'}`}>Download app</a>
}
