'use client'

import { useEffect, useRef, useState } from 'react'
import { LIFETIME_LICENSE_PRICE_LABEL } from '@/lib/pricing'
import styles from './WhyUs.module.css'

const reasons = [
  {
    label: 'Your budget',
    title: 'One video. Near-unlimited clips.',
    description: 'OpenRouter powers Deyn Studio’s cloud AI. After the included trial, pay for the work you run—not another $15–$20 monthly plan with a small clip allowance. Even $1 can cover many hours of transcript-led work; $5 can fuel clip-making for months, depending on your use. Buy the software once, own it, and keep AI costs in your hands.'
  },
  {
    label: 'Your files',
    title: 'Your project files stay on your device.',
    description: 'Deyn stores project history locally. Whisper transcription and background removal run on your device too.'
  },
  {
    label: 'Your choice',
    title: 'Cloud AI runs when you ask it to.',
    description: 'Cloud AI and transcription send the data needed for that task to OpenRouter. Your credentials stay in your operating system’s secure storage.'
  },
  {
    label: 'Less busywork',
    title: 'Review a plan, then reuse it.',
    description: 'Media Assistant turns a request into steps you can adjust or remove. Save a plan and reuse it with compatible files.'
  },
  {
    label: 'Lifetime license',
    title: 'One payment includes future updates.',
    description: `The ${LIFETIME_LICENSE_PRICE_LABEL} launch license includes lifetime access, future updates, and use on up to two devices. OpenRouter usage is billed separately after the AI trial.`
  }
]

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const easeInOut = (value) => {
  const progress = clamp(value)
  return progress * progress * (3 - 2 * progress)
}

function RevealWords({ text, progress }) {
  const words = text.split(' ')

  return words.map((word, index) => {
    const amount = easeInOut(progress * (words.length + 1) - index)
    return (
      <span className={styles.revealWord} key={`${index}-${word}`} style={{ color: `rgba(255,255,255,${.18 + amount * .82})`, filter: `blur(${(1 - amount) * 2.4}px)` }}>
        {word}{index < words.length - 1 ? ' ' : ''}
      </span>
    )
  })
}

export function WhyUs() {
  const sectionRef = useRef(null)
  const hasStartedRef = useRef(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    let frame = 0

    const updateProgress = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current
        if (!section) return

        const scrollDistance = section.offsetHeight - window.innerHeight
        if (scrollDistance <= 0) return

        const sectionTop = section.getBoundingClientRect().top
        const progress = clamp(-sectionTop / scrollDistance)
        setScrollProgress(progress)
        if (progress > .004 && !hasStartedRef.current) {
          hasStartedRef.current = true
          setHasStarted(true)
        }
      })
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      cancelAnimationFrame(frame)
    }
  }, [])

  const scaledProgress = scrollProgress * reasons.length
  const activeIndex = Math.min(Math.floor(scaledProgress), reasons.length - 1)
  const phaseProgress = scaledProgress - activeIndex
  const activeReason = reasons[activeIndex]
  const tickerExitProgress = easeInOut((phaseProgress - .08) / .1)
  const tickerEnterProgress = easeInOut((phaseProgress - .92) / .08)
  const tickerVisible = phaseProgress < .18 || phaseProgress >= .92
  const tickerInteractive = tickerVisible && (phaseProgress <= .08 || phaseProgress >= .99)
  const tickerBlur = reducedMotion ? 0 : phaseProgress < .18
    ? tickerExitProgress * 14
    : phaseProgress >= .92 ? (1 - tickerEnterProgress) * 14 : 14
  const tickerRotateX = reducedMotion ? 0 : phaseProgress < .18
    ? -tickerExitProgress * 12
    : phaseProgress >= .92 ? (1 - tickerEnterProgress) * 12 : 12
  const tickerRotateZ = reducedMotion ? 0 : phaseProgress < .18
    ? -tickerExitProgress * 2
    : phaseProgress >= .92 ? (1 - tickerEnterProgress) * 2 : 2
  const tickerShiftY = reducedMotion ? 0 : phaseProgress < .18
    ? -tickerExitProgress * 30
    : phaseProgress >= .92 ? (1 - tickerEnterProgress) * 30 : -30
  const contentEnterProgress = easeInOut((phaseProgress - .18) / .1)
  const contentExitProgress = easeInOut((phaseProgress - .8) / .1)
  const contentVisible = phaseProgress >= .18 && phaseProgress < .9
  const contentBlur = reducedMotion ? 0 : (1 - contentEnterProgress + contentExitProgress) * 14
  const contentRotateX = reducedMotion ? 0 : (1 - contentEnterProgress - contentExitProgress) * 7
  const contentRotateZ = reducedMotion ? 0 : (1 - contentEnterProgress - contentExitProgress) * -2
  const contentShiftY = reducedMotion ? 0 : (1 - contentEnterProgress - contentExitProgress) * 30
  const titleProgress = easeInOut((phaseProgress - .24) / .28)
  const descriptionProgress = easeInOut((phaseProgress - .52) / .26)
  const descriptionEnterProgress = easeInOut((phaseProgress - .47) / .1)
  const descriptionBlur = reducedMotion ? 0 : (1 - descriptionEnterProgress) * 8
  const descriptionShiftY = reducedMotion ? 0 : (1 - descriptionEnterProgress) * 18
  const descriptionRotateZ = reducedMotion ? 0 : (1 - descriptionEnterProgress) * -1.2
  const tickerIndex = phaseProgress >= .92 && activeIndex < reasons.length - 1 ? activeIndex + 1 : activeIndex
  const progressIndex = tickerIndex

  const navigateToReason = (index) => {
    const section = sectionRef.current
    if (!section) return

    const scrollDistance = section.offsetHeight - window.innerHeight
    const sectionTop = window.scrollY + section.getBoundingClientRect().top
    const targetProgress = (index + .26) / reasons.length
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: sectionTop + scrollDistance * targetProgress,
      behavior: reducedMotion ? 'instant' : 'smooth'
    })
  }

  return (
    <section ref={sectionRef} id="why-us" className={styles.section} aria-label="Why us">
      <div className={styles.stickyStage}>
        <div
          className={styles.ticker}
          role="group"
          aria-label="Choose a reason to use Deyn Studio"
          aria-hidden={!tickerVisible}
          style={{
            visibility: tickerVisible ? 'visible' : 'hidden',
            filter: `blur(${tickerBlur}px)`,
            pointerEvents: tickerInteractive ? 'auto' : 'none',
            transform: `translate3d(0, ${tickerShiftY}px, 0) rotateX(${tickerRotateX}deg) rotateZ(${tickerRotateZ}deg)`
          }}
        >
          {[-1, 0, 1].map((offset) => {
            const absoluteIndex = tickerIndex + offset
            const index = ((absoluteIndex % reasons.length) + reasons.length) % reasons.length
            const isActive = offset === 0

            return (
              <button
                className={`${styles.topic} ${offset < 0 ? styles.previous : ''} ${isActive ? styles.active : ''} ${offset > 0 ? styles.next : ''}`}
                type="button"
                key={absoluteIndex}
                aria-pressed={isActive}
                tabIndex={tickerInteractive ? 0 : -1}
                onClick={() => navigateToReason(index)}
              >
                {reasons[index].label}
              </button>
            )
          })}
        </div>

        <article
          className={styles.content}
          aria-hidden={!contentVisible}
          style={{
            visibility: contentVisible ? 'visible' : 'hidden',
            filter: `blur(${contentBlur}px)`,
            transform: `translate3d(-50%, calc(-50% + ${contentShiftY}px), 0) rotateX(${contentRotateX}deg) rotateZ(${contentRotateZ}deg)`
          }}
        >
          <p className={styles.topicLabel}>{activeReason.label}</p>
          <h2 className={styles.title}>
            <RevealWords text={activeReason.title} progress={titleProgress} />
          </h2>
          <p
            className={styles.description}
            style={{ filter: `blur(${descriptionBlur}px)`, transform: `translateY(${descriptionShiftY}px) rotateZ(${descriptionRotateZ}deg)` }}
          >
            <RevealWords text={activeReason.description} progress={descriptionProgress} />
          </p>
        </article>

        <nav className={styles.progress} aria-label="Navigate Why us topics">
          <span className={styles.progressCount} aria-label={`Reason ${progressIndex + 1} of ${reasons.length}`}>
            {String(progressIndex + 1).padStart(2, '0')} <span aria-hidden="true">/</span> {String(reasons.length).padStart(2, '0')}
          </span>
          <div className={styles.progressDots}>
            {reasons.map((reason, index) => (
              <button
                className={styles.progressDotButton}
                type="button"
                key={reason.label}
                aria-label={`Go to reason ${index + 1}: ${reason.label}`}
                aria-current={progressIndex === index ? 'step' : undefined}
                onClick={() => navigateToReason(index)}
              >
                <span className={`${styles.progressDot} ${progressIndex === index ? styles.progressDotActive : ''}`} aria-hidden="true" />
              </button>
            ))}
          </div>
        </nav>

        <div className={`${styles.scrollHint} ${hasStarted ? styles.scrollHintHidden : ''}`} aria-hidden="true">
          <span>Scroll to explore</span>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2.5v10m0 0 3.5-3.5M8 12.5 4.5 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </section>
  )
}
