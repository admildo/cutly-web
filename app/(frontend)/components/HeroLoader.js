'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './HeroLoader.module.css'

const SEEN_KEY = 'deyn:hero-loaded'
const MIN_VISIBLE_MS = 900
const MAX_WAIT_MS = 4000
const EXIT_MS = 500

/**
 * A quiet first-load veil. It holds the hero until its images are decoded, so
 * the orbit never opens half-filled. Videos are not awaited.
 */
export function HeroLoader({ assets }) {
  const [phase, setPhase] = useState('loading') // loading | leaving | done
  const barRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let seen = false
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1' } catch {}

    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const total = Math.max(assets.length, 1)
    const start = performance.now()
    const timers = []
    let loaded = 0
    let finished = false
    let shown = 0
    let frame = 0

    const finish = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(frame)
      if (barRef.current) barRef.current.style.transform = 'scaleX(1)'
      try { sessionStorage.setItem(SEEN_KEY, '1') } catch {}
      setPhase('leaving')
      timers.push(window.setTimeout(() => {
        root.style.overflow = previousOverflow
        setPhase('done')
        // Hero scroll triggers measured while the page was locked; re-measure once.
        window.dispatchEvent(new Event('resize'))
      }, reduced ? 0 : EXIT_MS))
    }

    const minVisible = seen || reduced ? 300 : MIN_VISIBLE_MS
    const markLoaded = () => { loaded += 1 }

    assets.forEach((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => {
        if (image.decode) image.decode().then(markLoaded, markLoaded)
        else markLoaded()
      }
      image.onerror = markLoaded
      image.src = src
    })

    const tick = () => {
      const elapsed = performance.now() - start
      const target = loaded / total
      shown += (target - shown) * 0.1
      if (target - shown < 0.001) shown = target
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`
      if (loaded >= total && elapsed >= minVisible && shown >= target) {
        finish()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    timers.push(window.setTimeout(finish, MAX_WAIT_MS))

    return () => {
      cancelAnimationFrame(frame)
      timers.forEach(window.clearTimeout)
      root.style.overflow = previousOverflow
    }
  }, [assets])

  if (phase === 'done') return null

  return (
    <div
      className={`${styles.loader} ${phase === 'leaving' ? styles.leaving : ''}`}
      role="status"
      aria-label="Loading Deyn Studio"
    >
      <noscript><style>{`.${styles.loader}{display:none}`}</style></noscript>
      <p className={styles.word} aria-hidden="true">Deyn Studio</p>
      <div className={styles.track} aria-hidden="true">
        <span ref={barRef} className={styles.bar} />
      </div>
    </div>
  )
}
