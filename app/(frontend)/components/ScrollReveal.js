'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './SpotAssistant.module.css'

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

// Fades, lifts and un-blurs its children the first time they scroll into view. Content is visible
// until the page has loaded, so nothing is hidden for people without JavaScript.
export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const [armed, setArmed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || reduced || typeof IntersectionObserver === 'undefined') return undefined
    setArmed(true)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      observer.disconnect()
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <div ref={ref} className={`${styles.reveal} ${className}`} data-armed={armed} data-visible={visible} style={{ '--delay': `${delay}ms` }}>
      {children}
    </div>
  )
}
