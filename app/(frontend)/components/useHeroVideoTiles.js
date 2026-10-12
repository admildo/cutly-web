'use client'

import { useSyncExternalStore } from 'react'

const query = '(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

// Images first: video tiles only unlock once the page has finished loading and
// the main thread is idle, so posters paint instantly and decoders never
// compete with the hero's first frames. If the visitor has already scrolled,
// the swap is skipped so the orbit is never rebuilt mid-scroll.
let videosUnlocked = false
let unlockScheduled = false
const unlockListeners = new Set()

const scheduleUnlock = () => {
  if (unlockScheduled || typeof window === 'undefined') return
  unlockScheduled = true
  const unlock = () => {
    const run = () => {
      if (window.scrollY > 10) return
      videosUnlocked = true
      unlockListeners.forEach((notify) => notify())
    }
    window.setTimeout(() => ('requestIdleCallback' in window ? window.requestIdleCallback(run, { timeout: 2500 }) : run()), 1200)
  }
  if (document.readyState === 'complete') unlock()
  else window.addEventListener('load', unlock, { once: true })
}

const subscribe = (notify) => {
  scheduleUnlock()
  unlockListeners.add(notify)
  const media = window.matchMedia(query)
  media.addEventListener('change', notify)
  const connection = navigator.connection
  connection?.addEventListener('change', notify)
  return () => {
    unlockListeners.delete(notify)
    media.removeEventListener('change', notify)
    connection?.removeEventListener('change', notify)
  }
}
const getSnapshot = () => videosUnlocked && window.matchMedia(query).matches && !navigator.connection?.saveData
const getServerSnapshot = () => false

export function useHeroVideoTiles() {
  // Posters first; phones and data-saver users never request decorative videos.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
