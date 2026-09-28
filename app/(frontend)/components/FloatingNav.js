'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignInButton } from '@clerk/nextjs'

export function FloatingNav({ downloadUrl }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuDate, setMenuDate] = useState('')

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 80)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    const updateMenuDate = () => {
      setMenuDate(new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).format(new Date()))
    }

    updateMenuDate()
    const interval = window.setInterval(updateMenuDate, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] text-[#f3f4f7]">
      <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-8 select-none items-center justify-between px-6 text-[14px] font-medium text-white transition-[opacity,transform] duration-500 ease-out max-[1000px]:hidden min-[1001px]:flex ${isScrolled ? 'translate-y-[-5px] opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-[22px]">
          <svg viewBox="0 0 24 24" className="h-[20px] w-[20px] fill-current" aria-hidden="true"><path d="M16.7 12.5c0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2-1.4-2.4-1.4-1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.2-.6-1.1 0-2.2.7-2.7 1.7-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.1-.5s1.3.5 2.2.5c.9 0 1.4-.8 1.9-1.6.6-.9.9-1.8.9-1.8s-1.8-.7-1.8-2.9ZM15.1 7.4c.4-.5.7-1.2.6-1.9-.6 0-1.4.4-1.9.9-.4.5-.7 1.1-.7 1.8.7.1 1.5-.3 2-.8Z" /></svg>
          <span className="font-bold">App</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
        </div>
        <div className="flex items-center gap-[18px]">
          <svg viewBox="0 0 28 16" className="h-[15px] w-[27px] fill-current" aria-hidden="true"><rect x="1" y="2" width="22" height="12" rx="3" /><path d="M25 5h2v6h-2z" /></svg>
          <svg viewBox="0 0 20 16" className="h-[15px] w-[18px] fill-none stroke-current stroke-[2.2]" aria-hidden="true"><path strokeLinecap="round" d="M2 5.5a12 12 0 0 1 16 0M5 8.5a7.5 7.5 0 0 1 10 0m-7 3a3.2 3.2 0 0 1 4 0" /><circle cx="10" cy="14" r="1" className="fill-current stroke-none" /></svg>
          <svg viewBox="0 0 18 18" className="h-[16px] w-[16px] fill-current" aria-hidden="true"><rect x="2" y="2" width="14" height="14" rx="4" /><path d="M5 6h8M5 9h8M5 12h8" stroke="#08090c" strokeWidth="1.2" /></svg>
          <svg viewBox="0 0 20 20" className="h-[17px] w-[17px] fill-none stroke-current stroke-[2]" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path strokeLinecap="round" d="m13 13 4 4" /></svg>
          <span className="ml-1 min-w-[124px] text-right tabular-nums">{menuDate}</span>
        </div>
      </div>
      <div className={`pointer-events-auto relative z-10 mx-auto transition-[width,top] duration-[560ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${isScrolled ? 'top-[14px] w-[min(576px,calc(100%_-_80px))] max-[700px]:top-[10px] max-[700px]:w-[min(292px,calc(100%_-_64px))]' : 'top-0 w-[min(640px,calc(100%_-_80px))] max-[700px]:w-[min(250px,calc(100%_-_48px))]'}`}>
        <div className={`relative transition-[height,border-radius,background-color,box-shadow,border-color] duration-[560ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${isScrolled ? 'h-[60px] rounded-full border border-[#aeb8ca]/4 bg-[#08090c] shadow-[0_14px_34px_rgb(0_0_0/.42),inset_0_1px_rgb(255_255_255/.08),inset_0_-1px_rgb(255_255_255/.02)] max-[700px]:h-[54px]' : 'h-[50px] rounded-b-[16px] border border-transparent bg-[#08090c] shadow-[0_14px_28px_rgb(0_0_0/.28)] max-[700px]:h-[50px] max-[700px]:rounded-b-[24px] max-[700px]:border-x max-[700px]:border-b max-[700px]:border-white/10 max-[700px]:shadow-[0_16px_36px_rgb(0_0_0/.28)]'}`}>
          <div
            className={`absolute flex h-[36px] items-center justify-between gap-5 transition-[top,inset] duration-[560ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none max-[700px]:inset-x-4 max-[700px]:top-0 max-[700px]:h-full max-[700px]:grid max-[700px]:grid-cols-[minmax(0,1fr)_auto] max-[700px]:gap-3 ${isScrolled ? 'inset-x-[14px] top-[9px]' : 'inset-x-[56px] top-[7px]'}`}
          >
            <Link href="#hero" aria-label="Cutly home" className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-[-.03em] text-white no-underline">
            
              <b>Cutly</b>
            </Link>
            <nav aria-label="Primary navigation" className="flex items-center justify-center gap-[25px] text-xs font-medium text-[#a5a8b1] max-[700px]:hidden">
              <a className="transition-colors hover:text-white" href="#features">Features</a>
              <a className="transition-colors hover:text-white" href="#pricing">Pricing</a>
              <a className="transition-colors hover:text-white" href="#faq">FAQ</a>
              <Link className="transition-colors hover:text-white" href="/blog">Blog</Link>
            </nav>
            <div className="flex items-center gap-1 max-[700px]:col-start-2 max-[700px]:row-start-1">
              <SignInButton forceRedirectUrl="/"><button type="button" className="h-[36px] min-w-[72px] rounded-full border-0 !bg-transparent px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90 max-[700px]:!h-[29px] max-[700px]:border max-[700px]:border-white max-[700px]:!bg-white max-[700px]:!text-[#111]">Log in</button></SignInButton>
              <a className="inline-flex h-7 items-center rounded-full bg-[#f2f2ee] px-[14px] text-xs font-semibold text-[#111] no-underline max-[700px]:hidden" href={downloadUrl || '/download'}>Download</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
