'use client'

import styles from './PricingCard.module.css'

export function PricingCard({ children }) {
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
    <div className={styles.card} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <svg className={styles.filters} aria-hidden="true">
        <filter id="pricing-smoke-distortion" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="7" result="smokeNoise">
            <animate attributeName="baseFrequency" dur="18s" values="0.012 0.022;0.024 0.036;0.012 0.022" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="smokeNoise" scale="30" xChannelSelector="R" yChannelSelector="G" result="billowedSmoke" />
          <feGaussianBlur in="billowedSmoke" stdDeviation="10" />
        </filter>
      </svg>
      <div className={`${styles.smoke} ${styles.smokeOne}`} aria-hidden="true" />
      <div className={`${styles.smoke} ${styles.smokeTwo}`} aria-hidden="true" />
      <div className={`${styles.smoke} ${styles.smokeThree}`} aria-hidden="true" />
      <div className={styles.pointerGlow} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  )
}
