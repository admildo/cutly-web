'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './HeroLoader.module.css'

const SEEN_KEY = 'deyn:hero-loaded'
const MIN_VISIBLE_MS = 700
const MAX_WAIT_MS = 4000
const EXIT_MS = 600

/**
 * Holds the hero back until its images are decoded, so the orbit never opens
 * with half-empty cards. Progress reflects real loads, not a fake timer.
 * Videos are NOT awaited: tiles start as posters and upgrade later.
 */
const TILE_COUNT = 14

export function HeroLoader({ assets }) {
  const tileSources = assets.filter((src) => !src.includes('bgt1')).slice(0, TILE_COUNT)
  const rootRef = useRef(null)
  const barRef = useRef(null)
  const countRef = useRef(null)
  const tilesRef = useRef(null)
  const [phase, setPhase] = useState('loading') // loading | leaving | done

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let seen = false
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1' } catch {}

    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const start = performance.now()
    let loaded = 0
    let finished = false
    let shown = 0
    let frame = 0
    const timers = []
    const total = Math.max(assets.length, 1)

    const paint = (value) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${value})`
      if (countRef.current) countRef.current.textContent = String(Math.round(value * 100)).padStart(2, '0')
      const tiles = tilesRef.current?.children
      if (tiles) {
        for (let i = 0; i < tiles.length; i++) {
          tiles[i].style.opacity = String(Math.min(1, Math.max(0.12, value * tiles.length - i + 0.12)))
        }
      }
    }

    const finish = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(frame)
      paint(1)
      try { sessionStorage.setItem(SEEN_KEY, '1') } catch {}
      setPhase('leaving')
      timers.push(window.setTimeout(() => {
        html.style.overflow = previousOverflow
        setPhase('done')
        // Hero scroll triggers measured while the page was locked; re-measure once.
        window.dispatchEvent(new Event('resize'))
      }, reduced ? 0 : EXIT_MS))
    }

    const minVisible = seen || reduced ? 150 : MIN_VISIBLE_MS
    const tick = () => {
      const elapsed = performance.now() - start
      const target = loaded / total
      shown += (target - shown) * 0.18
      if (target - shown < 0.002) shown = target
      paint(Math.min(shown, 0.99))
      if (loaded >= total && elapsed >= minVisible && shown >= target) {
        finish()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    const markLoaded = () => { loaded += 1 }
    assets.forEach((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => { (image.decode ? image.decode().catch(() => {}) : Promise.resolve()).then(markLoaded) }
      image.onerror = markLoaded
      image.src = src
    })

    frame = requestAnimationFrame(tick)
    timers.push(window.setTimeout(finish, MAX_WAIT_MS))

    return () => {
      cancelAnimationFrame(frame)
      timers.forEach(window.clearTimeout)
      html.style.overflow = previousOverflow
    }
  }, [assets])

  if (phase === 'done') return null

  return (
    <div
      ref={rootRef}
      className={`${styles.loader} ${phase === 'leaving' ? styles.leaving : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Deyn Studio"
    >
      <noscript><style>{`.${styles.loader}{display:none}`}</style></noscript>
      <div className={styles.center}>
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.tilt}>
            <div className={styles.helix} ref={tilesRef}>
              {tileSources.map((src, i) => (
                <span
                  key={src}
                  className={styles.tile}
                  style={{ '--i': i, '--n': tileSources.length, backgroundImage: `url(${src})` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.meta} aria-hidden="true">
          <span className={styles.word}>Deyn Studio</span>
          <span className={styles.count}><span ref={countRef}>00</span>%</span>
        </div>
        <div className={styles.track} aria-hidden="true"><span ref={barRef} className={styles.bar} /></div>
      </div>
    </div>
  )
}
