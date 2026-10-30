'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SiteFooter } from '@/app/components/SiteChrome'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Frames from the homepage hero. They burst out of the centre and settle into a ring that turns slowly.
const frames = [
  '/card-media/se-15.webp', '/card-media/se-2.webp', '/card-media/se-16-poster.webp',
  '/card-media/se-3.webp', '/card-media/se-17-poster.webp', '/card-media/se-4.webp',
  '/card-media/se-18-poster.webp', '/card-media/se-5.webp', '/card-media/se-19-poster.webp',
  '/card-media/se-6.webp', '/card-media/se-20-poster.webp', '/card-media/se-7.webp',
  '/card-media/se-21.webp', '/card-media/se-8.webp', '/card-media/se-9.webp',
  '/card-media/se-10.webp', '/card-media/se-11.webp', '/card-media/se-12.webp'
]

const RING_SPIN_SECONDS = 64
const INTRO_END = 3.2
const headlineWords = ['Deyn', 'Studio,', 'free', 'for', 'creators.']
const SHINE_FROM = 2
const highlights = ['Free lifetime license', 'Usage credits for cloud AI', 'Up to two devices']

// Stable pseudo-random values per frame, so the burst looks the same on every load.
const noise = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const ringRadius = (width, height) => (
  width < 760 ? Math.max(200, width * 0.7) : Math.max(260, Math.min(width * 0.36, height * 0.6, 560))
)

const ringPose = (index, radius) => {
  const angle = (index / frames.length) * 360
  const radians = (angle * Math.PI) / 180
  return { angle, x: Math.sin(radians) * radius, z: Math.cos(radians) * radius }
}

const burstPose = (index, width, height) => ({
  x: (noise(index, 1) * 2 - 1) * width * 0.42,
  y: (noise(index, 2) * 2 - 1) * height * 0.38,
  z: noise(index, 3) * 700 - 260,
  rotationY: (noise(index, 4) * 2 - 1) * 90,
  scale: 0.9 + noise(index, 5) * 0.35
})

function ApplyLink({ isSignedIn, className = '' }) {
  const href = isSignedIn ? '/dashboard#creator-program' : `/sign-up?returnTo=${encodeURIComponent('/dashboard#creator-program')}`
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[56px] min-w-[200px] items-center justify-center rounded-[14px] bg-[#f4f2ec] px-9 text-[16px] font-semibold text-[#15161a] no-underline shadow-[0_10px_40px_rgb(0_0_0/.35)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9c4ff] ${className}`}
    >
      Apply
    </Link>
  )
}

function Frame({ src, index }) {
  return (
    <div
      data-creator-frame
      className="absolute left-0 top-0 aspect-[3/4] h-[clamp(118px,15vw,176px)] overflow-hidden rounded-[18px] bg-[#151619] opacity-0 shadow-[0_24px_60px_rgb(0_0_0/.55)] will-change-transform"
    >
      <img src={src} alt="" loading={index < 10 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover" />
    </div>
  )
}

export function CreatorProgram({ isSignedIn = false }) {
  const heroRef = useRef(null)
  const stageRef = useRef(null)
  const tiltRef = useRef(null)
  const carouselRef = useRef(null)
  const copyRef = useRef(null)
  const glowRef = useRef(null)
  const introDoneRef = useRef(false)

  useGSAP(() => {
    const hero = heroRef.current
    const carousel = carouselRef.current
    const frameNodes = gsap.utils.toArray('[data-creator-frame]', carousel)
    const words = gsap.utils.toArray('[data-creator-word]', hero)
    const shine = gsap.utils.toArray('[data-creator-shine]', hero)
    const copyLines = gsap.utils.toArray('[data-creator-copy]', hero)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { innerWidth: width, innerHeight: height } = window
    const ring = frameNodes.map((_, index) => ringPose(index, ringRadius(width, height)))
    const burst = frameNodes.map((_, index) => burstPose(index, width, height))

    introDoneRef.current = false

    if (reduced) {
      // The finished layout with no motion: the ring, dimmed, behind the copy.
      gsap.set(carousel, { rotationX: -10 })
      gsap.set(frameNodes, {
        xPercent: -50,
        yPercent: -50,
        x: (index) => ring[index].x,
        z: (index) => ring[index].z,
        rotationY: (index) => ring[index].angle,
        opacity: 0.55
      })
      return
    }

    gsap.set(carousel, { rotationX: 86 })
    gsap.set(frameNodes, { xPercent: -50, yPercent: -50, x: 0, y: 0, z: 0, rotationY: 0, scale: 0.2, opacity: 0, filter: 'blur(14px)' })
    gsap.set(shine, { backgroundPosition: '130% 0%' })

    // The ring rises from flat, the frames burst out, then settle into their places on the ring.
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to(carousel, { rotationX: -12, duration: 2.6, ease: 'expo.inOut' }, 0.1)
      .to(frameNodes, {
        x: (index) => burst[index].x,
        y: (index) => burst[index].y,
        z: (index) => burst[index].z,
        rotationY: (index) => burst[index].rotationY,
        scale: (index) => burst[index].scale,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power4.out',
        stagger: { each: 0.03, from: 'center' }
      }, 0.2)
      .to(frameNodes, {
        x: (index) => ring[index].x,
        y: 0,
        z: (index) => ring[index].z,
        rotationY: (index) => ring[index].angle,
        scale: 1,
        duration: 1.7,
        ease: 'expo.inOut',
        stagger: { each: 0.025, from: 'center' }
      }, 1.25)
      .from(words, { yPercent: 115, opacity: 0, filter: 'blur(12px)', duration: 1.2, stagger: 0.08 }, 1.9)
      .from(copyLines, { y: 22, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 2.5)
      .call(() => { introDoneRef.current = true }, null, INTRO_END)

    // Once the words have landed, a light sweep crosses the highlighted words, then repeats now and then.
    gsap.fromTo(shine,
      { backgroundPosition: '130% 0%' },
      { backgroundPosition: '-30% 0%', duration: 1.6, ease: 'power2.inOut', stagger: 0.08, repeat: -1, repeatDelay: 6, delay: 3 })

    // The ring turns slowly once it has landed.
    gsap.to(carousel, { rotationY: 360, duration: RING_SPIN_SECONDS, ease: 'none', repeat: -1, delay: INTRO_END })
    gsap.to(glowRef.current, { opacity: 0.7, scale: 1.08, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })

    // Scrolling away pushes the ring back and fades the copy.
    gsap.to(stageRef.current, {
      scale: 1.12,
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
  }, { scope: heroRef })

  // The ring fades at the back and the whole ring leans toward the pointer. These listeners are removed on unmount.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined

    const carousel = carouselRef.current
    const tilt = tiltRef.current
    const frameNodes = gsap.utils.toArray('[data-creator-frame]', carousel)
    const setOpacity = frameNodes.map((node) => gsap.quickSetter(node, 'opacity'))
    const leanX = gsap.quickTo(tilt, 'rotationX', { duration: 1.4, ease: 'power3.out' })
    const leanY = gsap.quickTo(tilt, 'rotationY', { duration: 1.4, ease: 'power3.out' })

    const fade = () => {
      if (!introDoneRef.current) return
      const spin = gsap.getProperty(carousel, 'rotationY')
      setOpacity.forEach((set, index) => {
        const radians = (((index / frameNodes.length) * 360 + spin) * Math.PI) / 180
        const front = (Math.cos(radians) + 1) / 2
        set(0.22 + 0.78 * front ** 1.6)
      })
    }

    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse') return
      leanY(((event.clientX / window.innerWidth) - 0.5) * 16)
      leanX(-((event.clientY / window.innerHeight) - 0.5) * 10)
    }

    // The frames keep their angles; only their distance from the centre changes when the window is resized.
    const onResize = () => {
      if (!introDoneRef.current) return
      const radius = ringRadius(window.innerWidth, window.innerHeight)
      frameNodes.forEach((node, index) => {
        const pose = ringPose(index, radius)
        gsap.set(node, { x: pose.x, z: pose.z })
      })
    }

    gsap.ticker.add(fade)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('resize', onResize)
    return () => {
      gsap.ticker.remove(fade)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      gsap.killTweensOf(tilt)
    }
  }, [])

  return (
    <main className="min-h-screen overflow-x-clip bg-[#08090c] text-[#f1f3fa]">
      <section ref={heroRef} aria-labelledby="creator-program-title" className="relative isolate flex h-[100svh] min-h-[640px] items-center justify-center overflow-hidden px-6 text-center">
        <div ref={stageRef} aria-hidden="true" className="pointer-events-none absolute inset-0 [perspective:1800px]">
          <div ref={tiltRef} className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]">
            <div ref={carouselRef} className="absolute left-0 top-0 h-0 w-0 [transform-style:preserve-3d]">
              {frames.map((src, index) => <Frame key={src} src={src} index={index} />)}
            </div>
          </div>
        </div>

        <div ref={glowRef} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(214_178_112/.22),transparent)] opacity-60" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[660px] w-[min(1040px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(8_9_12/.92),rgb(8_9_12/.7)_62%,rgb(8_9_12/0))]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(8_9_12/0)_40%,rgb(8_9_12/.7)_100%)]" />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-5 px-6 py-6 sm:px-10">
          <Link href="/" aria-label="Deyn Studio home" className="text-sm font-semibold tracking-[.22em] text-[#f4f5f8] no-underline">DEYN STUDIO</Link>
          <Link href={isSignedIn ? '/dashboard' : '/sign-in'} className="text-[15px] font-medium text-[#e4e7f0] no-underline transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9c4ff]">
            {isSignedIn ? 'Dashboard' : 'Log in'}
          </Link>
        </header>

        <div ref={copyRef} className="relative z-10 flex max-w-[880px] flex-col items-center">
          <p data-creator-copy className="m-0 text-[13px] font-semibold uppercase tracking-[.22em] text-[#cbd6f2] [text-shadow:0_2px_16px_rgb(0_0_0/.8)]">Creator program</p>
          <h1 id="creator-program-title" className="mb-0 mt-5 text-[clamp(44px,7.2vw,94px)] font-semibold leading-[1] tracking-[-.05em] text-[#f7f8fb] [text-shadow:0_4px_40px_rgb(0_0_0/.6)] text-balance">
            {headlineWords.map((word, index) => (
              <span key={word}>
                <span className="inline-block overflow-hidden pb-[.12em] align-top">
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

          <p data-creator-copy className="mx-auto mb-0 mt-6 max-w-[600px] text-[17px] leading-[1.65] text-[#e9ebf2] [text-shadow:0_2px_18px_rgb(0_0_0/.85)] sm:text-[19px]">
            Selected creators get a free Deyn Studio license and usage credits for AI actions. Log in or create an account, then apply from your dashboard.
          </p>

          <ul data-creator-copy className="m-0 mt-7 flex list-none flex-wrap justify-center gap-2.5 p-0">
            {highlights.map((item) => (
              <li key={item} className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[13px] font-medium text-[#eef0f6] backdrop-blur-sm sm:px-4 sm:py-2 sm:text-[14px]">{item}</li>
            ))}
          </ul>

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
