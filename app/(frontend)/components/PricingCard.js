'use client'

import { useEffect, useRef } from 'react'
import styles from './PricingCard.module.css'

export function PricingCard({ children }) {
  const cardRef = useRef(null)
  useEffect(() => {
    const card = cardRef.current
    const observer = new IntersectionObserver(([entry]) => {
      card.dataset.active = String(entry.isIntersecting)
    })
    observer.observe(card)
    return () => observer.disconnect()
  }, [])
  const handlePointerMove = (event) => {
    if (event.pointerType === 'touch') return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100))

    event.currentTarget.style.setProperty('--pointer-x', `${x}%`)
    event.currentTarget.style.setProperty('--pointer-y', `${y}%`)
    event.currentTarget.style.setProperty('--pointer-alpha', '1')
  }

  const handlePointerLeave = (event) => {
    event.currentTarget.style.setProperty('--pointer-alpha', '0')
  }

  return (
    <div ref={cardRef} className={styles.card} data-active="false" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <div className={`${styles.smoke} ${styles.smokeOne}`} aria-hidden="true" />
      <div className={`${styles.smoke} ${styles.smokeTwo}`} aria-hidden="true" />
      <div className={`${styles.smoke} ${styles.smokeThree}`} aria-hidden="true" />
      <div className={styles.pointerGlow} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  )
}
