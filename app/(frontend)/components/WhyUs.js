'use client'

import { useEffect, useRef, useState } from 'react'
import { LIFETIME_LICENSE_PRICE_LABEL } from '@/lib/pricing'
import styles from './WhyUs.module.css'

const reasons = [
  {
    label: 'Your budget',
    title: 'Pay once. Pay for AI only when you use it.',
    description: 'Deyn Studio is a one-time purchase, not another monthly plan with a clip allowance. Cloud AI runs through your own OpenRouter key after the included trial, so you pay only for the work you run. Local transcription costs nothing.'
  },
  {
    label: 'Your files',
    title: 'Your project files stay on your device.',
    description: 'Deyn stores project history locally. Whisper transcription and background removal run on your device too.'
  },
  {
    label: 'Your choice',
    title: 'Cloud AI runs only when you ask.',
    description: 'When you use cloud AI or transcription, only the data that task needs goes to OpenRouter. Your key stays in your system’s secure storage.'
  },
  {
    label: 'Less busywork',
    title: 'Review a plan, or skip straight to done.',
    description: 'Media Assistant turns a request into steps you can adjust or remove. Spot Assistant runs common edits straight away from any app. Save an edit once and reuse it on similar files.'
  },
  {
    label: 'Your Macs',
    title: 'One license covers two Macs.',
    description: `The ${LIFETIME_LICENSE_PRICE_LABEL} launch license includes lifetime access and future desktop updates, on up to two devices. OpenRouter usage is billed separately after the AI trial.`
  }
]

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

// The opening stretch of the scroll is two lines of copy, one after the other, and then the topic list
// reveals itself. The topics take the rest of the runway. INTRO is that opening stretch as a share of the
// whole scroll; the section is made taller by the same amount (see WhyUs.module.css) so each topic keeps its pace.
const INTRO = 0.12

// Each line fades in over `enter` and out over `leave`, as fractions of the opening stretch. The first
// line is already there when the section arrives.
const INTRO_LINES = [
  { text: 'NOT SURE?', leave: [0.28, 0.46] },
  { text: 'THE DEAL...', enter: [0.36, 0.54], leave: [0.72, 0.88] }
]

const lineState = (progress, { enter, leave }) => {
  const entered = enter ? easeInOut((progress - enter[0]) / (enter[1] - enter[0])) : 1
  const left = easeInOut((progress - leave[0]) / (leave[1] - leave[0]))
  return { visible: entered > 0 && left < 1, opacity: entered * (1 - left), blur: ((1 - entered) + left) * 14, shift: (1 - entered) * 30 - left * 30 }
}
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
        if (progress > INTRO * .12 && !hasStartedRef.current) {
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

  const introProgress = clamp(scrollProgress / INTRO)
  // The last line has gone by the time the topics start to arrive, so the two never overlap.
  const topicsReveal = easeInOut(clamp((introProgress - .8) / .2))
  const introLines = INTRO_LINES.map((line) => ({ ...line, ...lineState(introProgress, line) }))
  const inIntro = scrollProgress < INTRO
  const storyProgress = clamp((scrollProgress - INTRO) / (1 - INTRO))
  const scaledProgress = storyProgress * reasons.length
  const activeIndex = Math.min(Math.floor(scaledProgress), reasons.length - 1)
  const phaseProgress = scaledProgress - activeIndex
  const activeReason = reasons[activeIndex]
  const tickerExitProgress = easeInOut((phaseProgress - .08) / .1)
  const tickerEnterProgress = easeInOut((phaseProgress - .92) / .08)
  const tickerVisible = inIntro ? topicsReveal > .01 : phaseProgress < .18 || phaseProgress >= .92
  const tickerInteractive = inIntro ? topicsReveal >= .99 : tickerVisible && (phaseProgress <= .08 || phaseProgress >= .99)
  const tickerBlur = reducedMotion ? 0 : inIntro ? (1 - topicsReveal) * 14 : phaseProgress < .18
    ? tickerExitProgress * 14
    : phaseProgress >= .92 ? (1 - tickerEnterProgress) * 14 : 14
  const tickerRotateX = reducedMotion ? 0 : inIntro ? (1 - topicsReveal) * 12 : phaseProgress < .18
    ? -tickerExitProgress * 12
    : phaseProgress >= .92 ? (1 - tickerEnterProgress) * 12 : 12
  const tickerRotateZ = reducedMotion ? 0 : inIntro ? (1 - topicsReveal) * 2 : phaseProgress < .18
    ? -tickerExitProgress * 2
    : phaseProgress >= .92 ? (1 - tickerEnterProgress) * 2 : 2
  const tickerShiftY = reducedMotion ? 0 : inIntro ? (1 - topicsReveal) * 30 : phaseProgress < .18
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
    const targetProgress = INTRO + (1 - INTRO) * ((index + .26) / reasons.length)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: sectionTop + scrollDistance * targetProgress,
      behavior: reducedMotion ? 'instant' : 'smooth'
    })
  }

  return (
    <section ref={sectionRef} id="why-us" className={styles.section} aria-label="Why us">
      <div className={styles.stickyStage}>
        <div className={styles.intro} aria-hidden={!inIntro || topicsReveal > 0}>
          {introLines.map((line) => (
            <h2
              className={styles.introWord}
              key={line.text}
              style={{
                visibility: inIntro && line.visible ? 'visible' : 'hidden',
                opacity: line.opacity,
                filter: `blur(${reducedMotion ? 0 : line.blur}px)`,
                transform: `translate3d(0, ${reducedMotion ? 0 : line.shift}px, 0) rotateX(${reducedMotion ? 0 : line.shift * .4}deg)`
              }}
            >
              {line.text}
            </h2>
          ))}
        </div>

        <div
          className={styles.ticker}
          role="group"
          aria-label="Choose a reason to use Deyn Studio"
          aria-hidden={!tickerVisible}
          style={{
            visibility: tickerVisible ? 'visible' : 'hidden',
            opacity: inIntro ? topicsReveal : 1,
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

        <nav className={styles.progress} aria-label="Navigate Why us topics" style={{ opacity: inIntro ? topicsReveal : 1, pointerEvents: inIntro && topicsReveal < 0.99 ? 'none' : 'auto' }}>
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
