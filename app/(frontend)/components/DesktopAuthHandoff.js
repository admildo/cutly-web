'use client'

import { useEffect, useState } from 'react'

export function DesktopAuthHandoff({ href, fallbackHref }) {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    window.location.assign(href)
    const timer = setTimeout(() => setShowFallback(true), 6000)
    return () => clearTimeout(timer)
  }, [href])

  return (
    <section aria-labelledby="desktop-handoff-title">
      <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-[#a6a4a4]">
        DESKTOP SIGN-IN
      </p>
      <h1 id="desktop-handoff-title" className="mb-0 text-[clamp(32px,4vw,42px)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#f2f0ef]">
        Opening Deyn Studio.
      </h1>
      <p className="mb-0 mt-3 text-[15px] leading-6 text-[#a6a4a4]">
        Allow your browser to open Deyn Studio to finish signing in. You can close this tab afterwards.
      </p>
      <a
        href={href}
        className="mt-8 inline-flex min-h-[56px] w-full items-center justify-center rounded-xl bg-[#f2f0ef] px-5 text-[15px] font-semibold text-[#171716] no-underline transition-colors hover:bg-[#cccbca]"
      >
        Open Deyn Studio
      </a>
      {showFallback && fallbackHref ? (
        <p className="mb-0 mt-4 text-center text-[13px] leading-5 text-[#a6a4a4]">
          Nothing happened?{' '}
          <a href={fallbackHref} className="text-[#f2f0ef] underline underline-offset-4">Finish sign-in without opening the app</a>.
        </p>
      ) : null}
    </section>
  )
}
