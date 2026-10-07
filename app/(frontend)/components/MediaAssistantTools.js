'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './MediaAssistantTools.module.css'

const slides = [
  {
    number: '01',
    title: 'Describe the job. Get a plan.',
    description: 'Choose files and tell Media Assistant what you need. Review the steps before they run.',
    image: '/app-shots/tools.png',
    width: 1920,
    height: 1440,
    alt: 'Deyn Studio media assistant and tool selection screen'
  },
  {
    number: '02',
    title: 'Review each step before it runs',
    description: 'Adjust the plan, remove a step, or save it to reuse with compatible files.',
    image: '/app-shots/tools-2.png',
    width: 1920,
    height: 1440,
    alt: 'Media Assistant plan with proposed video changes for review'
  },
  {
    number: '03',
    title: 'Track your work over time',
    description: 'See clip, export, and assistant activity at a glance, right in Deyn Studio.',
    image: '/app-shots/usage-p.png',
    width: 1920,
    height: 1440,
    alt: 'Deyn Studio activity dashboard with clip and export statistics'
  }
]

const stackPositions = [
  { position: 'active', filter: 'blur(0)', opacity: 1, zIndex: 3 },
  { position: 'right', filter: 'blur(1.5px)', opacity: 0.88, zIndex: 2 },
  { position: 'left', filter: 'blur(2.5px)', opacity: 0.76, zIndex: 1 }
]

function ArrowIcon({ direction }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {direction === 'previous'
        ? <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="m7.5 4.5 5.5 5.5-5.5 5.5M12.5 10H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

export function MediaAssistantTools() {
  const [active, setActive] = useState(0)
  const activeSlide = slides[active]

  const changeSlide = (direction) => {
    setActive((current) => (current + direction + slides.length) % slides.length)
  }

  return (
    <section
      id="media-assistant-tools"
      className="relative overflow-hidden bg-[#0d0d0e] px-6 py-[clamp(88px,8vw,112px)] text-[#f0efe9] max-[700px]:py-[clamp(64px,10vw,72px)] max-[600px]:px-4"
      aria-label="Media Assistant and tools"
    >
      <div className="pointer-events-none absolute left-1/2 top-[22%] h-[460px] w-[min(850px,90vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(110_132_170/.14),transparent_68%)] blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1120px]">
        <p className="mb-8 text-center text-[11px] font-medium uppercase tracking-[.2em] text-[#aeb4c2] max-[600px]:mb-6">Media Assistant &amp; Tools</p>

        <div className="relative mx-auto aspect-[1.64] w-full max-w-[980px] [perspective:1400px] max-[700px]:aspect-[1.38] max-[480px]:aspect-[1.3]">
          <div className="absolute inset-[12%_13%] rounded-[50%] bg-[#8294b8]/[.12] blur-[70px]" aria-hidden="true" />
          {slides.map((slide, index) => {
            const offset = (index - active + slides.length) % slides.length
            const { position: stackPosition, ...visualStyle } = stackPositions[offset]
            const isActive = index === active

            return (
              <div
                className={`${styles.stackCard} absolute left-1/2 top-1/2 aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_38px_100px_rgb(0_0_0/.62)] max-[600px]:rounded-[14px]`}
                style={visualStyle}
                data-position={stackPosition}
                aria-hidden={!isActive}
                key={slide.number}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-[#101116] max-[600px]:rounded-[14px]">
                  <Image
                    className="h-full w-full object-contain"
                    src={slide.image}
                    width={slide.width}
                    height={slide.height}
                    alt={isActive ? slide.alt : ''}
                    priority={index === 0}
                    sizes="(max-width: 700px) 77.4vw, 683px"
                  />
                </div>
              </div>
            )
          })}

        </div>

        <div className="mx-auto mt-9 flex max-w-[690px] flex-col items-center text-center max-[600px]:mt-7">
          <div aria-live="polite" aria-atomic="true">
            <h2 key={`title-${active}`} className={`m-0 text-balance font-serif text-[clamp(21px,4.10vw,30px)] font-normal leading-[1.02] tracking-[-.055em] text-[#f0efe9] max-[600px]:text-[30px] ${styles.titleAnimation}`}>
              {activeSlide.title}
            </h2>
            <p key={`description-${active}`} className={`mb-0 mt-4 max-w-[600px] text-[15px] leading-[1.7] text-[#a6a8ae] max-[600px]:mt-3 max-[600px]:text-[14px] ${styles.descriptionAnimation}`}>
              {activeSlide.description}
            </p>
          </div>
          <nav aria-label="Slide controls" className="mt-7 flex min-h-11 items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => changeSlide(-1)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/[.13] bg-white/[.035] text-[#d6d7dc] transition-colors hover:border-white/25 hover:bg-white/[.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
            >
              <ArrowIcon direction="previous" />
            </button>
            <div className="flex items-center gap-1" role="group" aria-label="Choose a slide">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.number}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  className="group grid h-11 w-8 shrink-0 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                >
                  <span className={`block h-[6px] rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${index === active ? 'w-7 bg-[#e8ddc8]' : 'w-[7px] bg-white/35 group-hover:bg-white/70'}`} />
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => changeSlide(1)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/[.13] bg-white/[.035] text-[#d6d7dc] transition-colors hover:border-white/25 hover:bg-white/[.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
            >
              <ArrowIcon direction="next" />
            </button>
          </nav>
        </div>
      </div>
    </section>
  )
}
