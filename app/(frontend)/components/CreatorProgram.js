'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SiteFooter } from '@/app/components/SiteChrome'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Small frames from the homepage hero. They pop in around the copy, kick away from each headline word as it lands, and shy away from the pointer.
const sources = [
  '/card-media/se-15.webp', '/card-media/se-2.webp', '/card-media/se-16-poster.webp',
  '/card-media/se-3.webp', '/card-media/se-17-poster.webp', '/card-media/se-4.webp',
  '/card-media/se-18-poster.webp', '/card-media/se-5.webp', '/card-media/se-19-poster.webp',
  '/card-media/se-6.webp', '/card-media/se-20-poster.webp', '/card-media/se-7.webp',
  '/card-media/se-21.webp', '/card-media/se-8.webp', '/card-media/se-9.webp',
  '/card-media/se-10.webp', '/card-media/se-11.webp', '/card-media/se-12.webp',
  '/card-media/se-13.webp', '/card-media/se-14.webp'
]
const CARD_COUNT = 44
const cards = Array.from({ length: CARD_COUNT }, (_, index) => sources[index % sources.length])

const headlineWords = ['Free', 'tools', 'for', 'creators', 'who', 'make', 'clips.']
const SHINE_FROM = 3
const WORDS_AT = 1.7
const WORD_STEP = 0.1

const REPEL_RADIUS = 170
const KICK_RADIUS = 300

// Stable pseudo-random values per card, so the layout looks the same on every load.
const noise = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

// Card height in px, 46 to 92.
const cardHeight = (index) => 46 + noise(index, 11) * 46

// Spreads the cards evenly over the hero, outside an area kept clear for the copy. Cards that do not fit are left out.
const scatter = (width, height) => {
  const halfW = width / 2
  const halfH = height / 2
  const clearW = Math.min(halfW - 8, 360)
  const clearH = Math.min(halfH * 0.7, 230)
  const placed = []
  for (let attempt = 0; attempt < 900 && placed.length < CARD_COUNT; attempt += 1) {
    const x = (noise(attempt, 1) * 2 - 1) * (halfW + 20)
    const y = (noise(attempt, 2) * 2 - 1) * (halfH + 20)
    if (Math.abs(x) < clearW && Math.abs(y) < clearH) continue
    if (y < 76 - halfH) continue // keeps the header links clear
    if (placed.some((spot) => Math.hypot(spot.x - x, spot.y - y) < 86)) continue
    placed.push({ x, y })
  }
  return placed
}

function ApplyLink({ isSignedIn, className = '' }) {
  const href = isSignedIn ? '/dashboard#creator-program' : `/sign-up?returnTo=${encodeURIComponent('/dashboard#creator-program')}`
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[56px] min-w-[200px] items-center justify-center rounded-full bg-[#f4f2ec] px-9 text-[16px] font-semibold text-[#15161a] no-underline shadow-[0_10px_40px_rgb(0_0_0/.35)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9c4ff] ${className}`}
    >
      Apply
    </Link>
  )
}

function Frame({ src, index }) {
  const height = cardHeight(index)
  return (
    <div
      data-creator-frame
      style={{ height, width: height * 0.75, opacity: 0 }}
      className="absolute left-1/2 top-1/2 overflow-hidden rounded-[10px] bg-[#151619] shadow-[0_10px_26px_rgb(0_0_0/.5)] will-change-transform"
    >
      <img src={src} alt="" loading={index < 16 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover" />
    </div>
  )
}

export function CreatorProgram({ isSignedIn = false }) {
  const heroRef = useRef(null)
  const stageRef = useRef(null)
  const copyRef = useRef(null)
  const glowRef = useRef(null)

  useGSAP(() => {
    const hero = heroRef.current
    const nodes = gsap.utils.toArray('[data-creator-frame]', stageRef.current)
    const wordBoxes = gsap.utils.toArray('[data-creator-word-box]', hero)
    const words = gsap.utils.toArray('[data-creator-word]', hero)
    const shine = gsap.utils.toArray('[data-creator-shine]', hero)
    const copyLines = gsap.utils.toArray('[data-creator-copy]', hero)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // One state object per card. The ticker turns it into a transform every frame.
    const state = nodes.map((node, index) => ({
      node,
      bx: 0,
      by: 0,
      kx: 0, // push from a headline word
      ky: 0,
      rx: 0, // push from the pointer
      ry: 0,
      pulse: 0,
      show: 0,
      travel: 0, // 0 far off-screen, 1 home
      orbit: 8 + noise(index, 15) * 10,
      speed: 0.3 + noise(index, 16) * 0.4,
      flip: noise(index, 17) > 0.45,
      flipSpeed: 0.7 + noise(index, 18) * 0.9,
      tilt: (noise(index, 8) * 2 - 1) * 22,
      depth: 0.4 + noise(index, 12) * 1.2,
      phase: noise(index, 13) * Math.PI * 2,
      alpha: 0.55 + noise(index, 10) * 0.45,
      on: false
    }))

    const layout = () => {
      const spots = scatter(hero.clientWidth, hero.clientHeight)
      state.forEach((card, index) => {
        const spot = spots[index]
        card.on = Boolean(spot)
        if (spot) {
          card.bx = spot.x
          card.by = spot.y
        }
        card.node.style.display = spot ? '' : 'none'
      })
    }

    const pointer = { x: 0, y: 0, active: false, sx: 0, sy: 0 }
    const draw = (time) => {
      state.forEach((card) => {
        if (!card.on) return
        // Each card pops in place: it grows from nothing with a small overshoot, then settles.
        card.show = Math.max(0, card.travel)
        const x = card.bx + card.kx + card.rx + Math.cos(time * card.speed + card.phase) * card.orbit * card.show - pointer.sx * 16 * card.depth
        const y = card.by + card.ky + card.ry + Math.sin(time * card.speed * 1.3 + card.phase) * card.orbit * 0.6 * card.show - pointer.sy * 10 * card.depth
        const spin = (1 - Math.min(card.show, 1)) * 40
        const flipX = card.flip ? 0.25 + 0.75 * Math.abs(Math.cos(time * card.flipSpeed + card.phase)) : 1
        const scale = card.show * (1 + card.pulse * 0.28)
        card.node.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(card.tilt + card.pulse * 8 + spin).toFixed(1)}deg) scale(${(scale * flipX).toFixed(3)}, ${scale.toFixed(3)})`
        card.node.style.opacity = String(Math.min(1, card.show * card.alpha))
      })
    }

    layout()

    if (reduced) {
      state.forEach((card) => { card.travel = 1 })
      draw(0)
      const onStaticResize = () => { layout(); draw(0) }
      window.addEventListener('resize', onStaticResize)
      return () => window.removeEventListener('resize', onStaticResize)
    }

    // Cards shy away from the pointer and drift a little with it.
    const tick = (time) => {
      const bounds = hero.getBoundingClientRect()
      if (bounds.bottom < 0) return
      pointer.sx += ((pointer.active ? (pointer.x / bounds.width - 0.5) * 2 : 0) - pointer.sx) * 0.06
      pointer.sy += ((pointer.active ? (pointer.y / bounds.height - 0.5) * 2 : 0) - pointer.sy) * 0.06
      state.forEach((card) => {
        let targetX = 0
        let targetY = 0
        if (pointer.active && card.on && card.show > 0.9) {
          const dx = card.bx - (pointer.x - bounds.width / 2)
          const dy = card.by - (pointer.y - bounds.height / 2)
          const distance = Math.hypot(dx, dy) || 1
          if (distance < REPEL_RADIUS) {
            const push = ((1 - distance / REPEL_RADIUS) ** 2) * 80
            targetX = (dx / distance) * push
            targetY = (dy / distance) * push
          }
        }
        card.rx += (targetX - card.rx) * 0.14
        card.ry += (targetY - card.ry) * 0.14
      })
      draw(time)
    }

    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse') return
      const bounds = hero.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }
    const onPointerLeave = () => { pointer.active = false }
    const onResize = () => layout()

    // When a headline word lands, the cards near it jump away from it, spring back, and pulse.
    const kickFrom = (wordIndex) => {
      const box = wordBoxes[wordIndex]
      if (!box) return
      const bounds = hero.getBoundingClientRect()
      const rect = box.getBoundingClientRect()
      const wx = rect.left + rect.width / 2 - bounds.left - bounds.width / 2
      const wy = rect.top + rect.height / 2 - bounds.top - bounds.height / 2
      const reach = KICK_RADIUS + rect.width / 2
      state.forEach((card) => {
        if (!card.on || card.show < 0.9) return
        const dx = card.bx - wx
        const dy = card.by - wy
        const distance = Math.hypot(dx, dy) || 1
        if (distance > reach) return
        const strength = 1 - distance / reach
        gsap.timeline()
          .to(card, { kx: (dx / distance) * 46 * strength, ky: (dy / distance) * 46 * strength, pulse: strength, duration: 0.22, ease: 'power2.out' })
          .to(card, { kx: 0, ky: 0, pulse: 0, duration: 1.3, ease: 'elastic.out(1, 0.45)' })
      })
    }

    gsap.set(shine, { backgroundPosition: '130% 0%' })

    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })
    intro.to(state, { travel: 1, duration: 0.7, ease: 'back.out(2.4)', stagger: { each: 0.025, from: 'random' } }, 0.2)
    intro.from(words, { yPercent: 115, opacity: 0, filter: 'blur(12px)', duration: 1.1, stagger: WORD_STEP }, WORDS_AT)
    words.forEach((_, index) => intro.call(() => kickFrom(index), null, WORDS_AT + 0.45 + index * WORD_STEP))
    intro.from(copyLines, { y: 22, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, WORDS_AT + 0.8)

    // Once the words have landed, a light sweep crosses the highlighted words, then repeats now and then.
    gsap.fromTo(shine,
      { backgroundPosition: '130% 0%' },
      { backgroundPosition: '-30% 0%', duration: 1.6, ease: 'power2.inOut', stagger: 0.08, repeat: -1, repeatDelay: 6, delay: 3.4 })
    gsap.to(glowRef.current, { opacity: 0.7, scale: 1.08, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })

    // Scrolling away fades the cards and the copy.
    gsap.to(stageRef.current, {
      scale: 1.08,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    })
    gsap.to(copyRef.current, {
      yPercent: -14,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '70% top', scrub: true }
    })

    gsap.ticker.add(tick)
    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', onResize)
    return () => {
      gsap.ticker.remove(tick)
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', onResize)
      gsap.killTweensOf(state)
    }
  }, { scope: heroRef })

  return (
    <main className="min-h-screen overflow-x-clip bg-[#08090c] text-[#f1f3fa]">
      <section ref={heroRef} aria-labelledby="creator-program-title" className="relative isolate flex h-[100svh] min-h-[640px] items-center justify-center overflow-hidden px-6 text-center">
        <div ref={stageRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
          {cards.map((src, index) => <Frame key={`${src}-${index}`} src={src} index={index} />)}
        </div>

        <div ref={glowRef} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(214_178_112/.18),transparent)] opacity-60" />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-5 px-6 py-6 sm:px-10">
          <Link href="/" aria-label="Deyn Studio home" className="text-sm font-semibold tracking-[.22em] text-[#f4f5f8] no-underline">DEYN STUDIO</Link>
          <Link href={isSignedIn ? '/dashboard' : '/sign-in'} className="text-[15px] font-medium text-[#e4e7f0] no-underline transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9c4ff]">
            {isSignedIn ? 'Dashboard' : 'Log in'}
          </Link>
        </header>

        <div ref={copyRef} className="relative z-10 flex max-w-[880px] flex-col items-center">
          <p data-creator-copy className="m-0 text-[13px] font-semibold uppercase tracking-[.22em] text-[#cbd6f2] [text-shadow:0_2px_16px_rgb(0_0_0/.8)]">Creator program</p>
          <h1 id="creator-program-title" className="mb-0 mt-5 text-balance text-[30px] font-bold leading-[1.02] tracking-[-.04em] text-[#f7f8fb] [text-shadow:0_4px_40px_rgb(0_0_0/.6)] sm:text-[44px] lg:text-[64px]">
            {headlineWords.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span data-creator-word-box className="inline-block overflow-hidden pb-[.12em] align-top">
                  <span
                    data-creator-word
                    data-creator-shine={index >= SHINE_FROM ? '' : undefined}
                    className={`inline-block ${index >= SHINE_FROM ? 'bg-[linear-gradient(100deg,#f7f8fb_36%,#f2dcaa_50%,#f7f8fb_64%)] bg-[length:260%_100%] bg-clip-text text-transparent' : ''}`}
                  >
                    {word}
                  </span>
                </span>
                {index < headlineWords.length - 1 ? ' ' : null}
              </span>
            ))}
          </h1>

          <p data-creator-copy className="mx-auto mb-0 mt-6 max-w-[560px] text-balance text-[18px] leading-[1.5] text-[#e9ebf2] [text-shadow:0_2px_18px_rgb(0_0_0/.85)] sm:text-[22px]">
            Show us what you make. If it fits, you get a free lifetime Deyn Studio license and AI usage credits.
          </p>

          <div data-creator-copy className="mt-9 flex flex-col items-center gap-4">
            <ApplyLink isSignedIn={isSignedIn} />
            <p className="m-0 text-[14px] leading-6 text-[#d3d8e4] [text-shadow:0_2px_14px_rgb(0_0_0/.9)]">
              {isSignedIn ? 'Your application is sent from your dashboard.' : 'You apply from your dashboard, so log in or create an account first.'}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-[min(1120px,calc(100%_-_48px))] text-[#9aa2b2] [&_footer]:mt-[55px] [&_footer_a]:text-[#aeb5c4] [&_footer_a]:transition-colors [&_footer_a]:hover:text-[#f1f3fa] [&_footer_a]:focus-visible:rounded-sm [&_footer_a]:focus-visible:outline [&_footer_a]:focus-visible:outline-2 [&_footer_a]:focus-visible:outline-offset-2 [&_footer_a]:focus-visible:outline-[#a9c4ff]">
        <SiteFooter dark />
      </div>
    </main>
  )
}
