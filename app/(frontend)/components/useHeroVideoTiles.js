'use client'

import { useSyncExternalStore } from 'react'

const query = '(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const subscribe = (notify) => {
  const media = window.matchMedia(query)
  media.addEventListener('change', notify)
  const connection = navigator.connection
  connection?.addEventListener('change', notify)
  return () => {
    media.removeEventListener('change', notify)
    connection?.removeEventListener('change', notify)
  }
}
const getSnapshot = () => window.matchMedia(query).matches && !navigator.connection?.saveData
const getServerSnapshot = () => false

export function useHeroVideoTiles() {
  // Start with posters so phones never request or decode decorative videos.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
