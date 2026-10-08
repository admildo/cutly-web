'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const desktopNavigationLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

const navigationLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Blog', href: '/blog' },
]

const islandStateEvent = 'cutly:hero-island-state'

export function DynamicIslandNav({ downloadUrl, isSignedIn = false }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const updateIslandState = (event) => {
      setIsScrolled(Boolean(event.detail?.active))
    }

    setIsScrolled(document.documentElement.dataset.cutlyHeroIsland === 'true')
    window.addEventListener(islandStateEvent, updateIslandState)
    return () => window.removeEventListener(islandStateEvent, updateIslandState)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)
  const ctaUrl = downloadUrl || '/download'

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-[max(env(safe-area-inset-top),4px)] text-[#f4f5f8]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[220px] max-[760px]:h-[100px] bg-[linear-gradient(180deg,rgb(3_4_7/.68)_0%,rgb(3_4_7/.52)_42%,rgb(3_4_7/.26)_78%,rgb(3_4_7/0)_100%)]"
      />
      <div className={`pointer-events-auto relative mx-auto w-[460px] max-w-[calc(100vw-24px)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isScrolled ? 'translate-y-2' : 'translate-y-0'} ${isMenuOpen ? 'max-[760px]:w-full' : 'max-[760px]:w-full'}`}>
        <div className={`relative transition-[border-radius,background-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isScrolled ? 'overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgb(255_255_255/.12),rgb(255_255_255/.05))] shadow-[0_10px_30px_rgb(0_0_0/.14)] backdrop-blur-[8px] backdrop-saturate-105 max-[760px]:rounded-[27px]' : 'overflow-visible rounded-none bg-transparent shadow-none backdrop-blur-0 max-[760px]:rounded-[22px] max-[760px]:bg-[#0b0c10]/90 max-[760px]:backdrop-blur-xl'}`}>
          <div className={`relative z-10 grid grid-cols-[auto_1fr_auto] items-center transition-[height,padding] duration-[620ms] ease-[cubic-bezier(.65,0,.35,1)] ${isScrolled ? 'h-[60px] px-5 max-[760px]:h-[56px] max-[760px]:px-3' : 'h-[68px] px-4 max-[760px]:h-[56px] max-[760px]:px-4'}`}>
            <Link href="#top" aria-label="Deyn Studio home" onClick={closeMenu} className="flex shrink-0 items-center rounded-sm text-sm font-semibold tracking-[-.035em] text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80">
              <span>Deyn Studio</span>
            </Link>

            <nav aria-label="Primary navigation" className="flex items-center justify-self-center gap-[14px] whitespace-nowrap text-[12px] font-medium text-white/70 max-[760px]:hidden">
              {desktopNavigationLinks.map(({ label, href }) => (
              <Link key={label} href={href} className="whitespace-nowrap rounded-sm no-underline transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80">{label}</Link>
              ))}
            </nav>

            <div className="col-start-3 flex shrink-0 items-center justify-self-end gap-1.5 max-[760px]:hidden">
              <Link href={isSignedIn ? '/dashboard' : '/sign-in'} className="inline-flex h-[38px] items-center whitespace-nowrap rounded-full px-3 text-[12px] font-semibold text-white/90 no-underline transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70">{isSignedIn ? 'Dashboard' : 'Log in'}</Link>
              <Link href={ctaUrl} className="inline-flex h-[38px] items-center whitespace-nowrap rounded-full bg-[#f4f3ef] px-[14px] text-[12px] font-semibold text-[#111216] no-underline shadow-[0_2px_10px_rgb(0_0_0/.18)] transition-[transform,background-color] hover:-translate-y-px hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Download</Link>
            </div>

            <button
              type="button"
              className="col-start-3 hidden h-[44px] w-[44px] shrink-0 place-items-center justify-self-end rounded-full bg-white/[0.07] text-white transition-colors hover:bg-white/[0.13] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 max-[760px]:grid"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-island-navigation"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.7] transition-transform duration-300" style={{ transform: isMenuOpen ? 'rotate(45deg)' : 'none' }}>
                <path strokeLinecap="round" d="M3.5 6h13M3.5 10h13M3.5 14h13" style={{ opacity: isMenuOpen ? 0 : 1, transition: 'opacity 160ms ease' }} />
                <path strokeLinecap="round" d="M10 4v12M4 10h12" style={{ opacity: isMenuOpen ? 1 : 0, transition: 'opacity 160ms ease' }} />
              </svg>
            </button>
          </div>

          <div
            id="mobile-island-navigation"
            className={`relative z-10 grid transition-[grid-template-rows,opacity] duration-300 ease-out min-[761px]:hidden ${isMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            aria-hidden={!isMenuOpen}
          >
            <div className="overflow-hidden">
              <nav aria-label="Mobile navigation" className="grid gap-1 px-3 pb-3 pt-2">
                {navigationLinks.map(({ label, href }) => (
                <Link key={label} href={href} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} className="flex min-h-[44px] items-center rounded-[13px] px-3 text-[13px] font-medium text-white/75 no-underline transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:bg-white/[0.07] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/70">{label}</Link>
                ))}
                <div className="mt-1 grid grid-cols-2 gap-2 pt-2">
                  <Link href={isSignedIn ? '/dashboard' : '/sign-in'} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white/[0.06] text-[12px] font-semibold text-white no-underline transition-colors hover:bg-white/[0.11] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70">{isSignedIn ? 'Dashboard' : 'Log in'}</Link>
                  <Link href={ctaUrl} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#f4f3ef] text-[12px] font-semibold text-[#111216] no-underline transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Download</Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
