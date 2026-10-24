'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './ProductStory.module.css'

const stories = [
  {
    number: '01',
    title: 'Drop in a long video',
    description: 'Import a file or paste a supported public link. Let Deyn suggest clips, search for a moment, or pick the cut yourself.',

    image: '/app-shots/home-p.webp',
    imageBackground: '13 13 13',
    alt: 'Deyn Studio home screen with a video ready and saved clip sets'
  },
  {
    number: '02',
    title: 'Skip the scrubbing',
    description: 'AI reads the transcript and suggests clips with titles and timing. Keep the ones you like, drop the rest.',
    image: '/app-shots/clips-p.webp',
    imageBackground: '43 34 117',
    alt: 'A grid of clips generated from a video in Deyn Studio'
  },
  {
    number: '03',
    title: 'Caption, reframe, export',
    description: 'Edit the transcript, style your captions, frame for vertical video, and export without leaving the app.',
    image: '/app-shots/editor.webp',
    imageBackground: '43 34 117',
    alt: 'Deyn Studio editor with transcript, portrait preview, and caption controls'
  }
]

function DemoVideoPlayer({ story }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      if (video.ended) video.currentTime = 0
      video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <div className="group/player relative z-10 h-full w-full bg-black" data-video-player>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full bg-black object-cover"
        playsInline
        preload="metadata"
        poster={story.image}
        aria-label={story.alt}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={story.video} type="video/mp4" />
        Your browser does not support MP4 video playback.
      </video>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
        style={{
          background: 'linear-gradient(180deg, rgb(0 0 0 / .48), transparent 34%, rgb(0 0 0 / .28)), linear-gradient(90deg, rgb(0 0 0 / .24), transparent 16%, transparent 84%, rgb(0 0 0 / .24))',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)'
        }}
      />

      <button
        type="button"
        aria-label={isPlaying ? 'Stop demo video' : 'Play demo video'}
        aria-pressed={isPlaying}
        onClick={togglePlayback}
        className="absolute left-1/2 top-1/2 z-30 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white shadow-[0_8px_28px_rgb(0_0_0/.42),inset_0_1px_0_rgb(232_222_205/.24)] backdrop-blur-md transition-[transform,background-color,box-shadow] hover:scale-105 hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white max-[600px]:h-12 max-[600px]:w-12"
      >
        {isPlaying ? (
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="10" height="10" rx="1.5" /></svg>
        ) : (
          <svg className="ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.5 3.9c0-.72.79-1.15 1.39-.75l9.28 5.98a1.05 1.05 0 0 1 0 1.75l-9.28 5.98c-.6.4-1.39-.03-1.39-.75V3.9Z" /></svg>
        )}
      </button>
    </div>
  )
}

export function ProductStory() {
  const [active, setActive] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('down')
  const [copyReadyIndex, setCopyReadyIndex] = useState(-1)
  const panelRefs = useRef([])
  const activeRef = useRef(0)
  const stickyStageRef = useRef(null)

  const setCurrentStory = useCallback((index) => {
    if (index !== activeRef.current) {
      setScrollDirection(index > activeRef.current ? 'down' : 'up')
      setCopyReadyIndex(-1)
    }
    activeRef.current = index
    setActive((current) => current === index ? current : index)
  }, [])

  useEffect(() => {
    const revealTimer = window.setTimeout(() => setCopyReadyIndex(active), 650)
    return () => window.clearTimeout(revealTimer)
  }, [active])

  useEffect(() => {
    let frame = 0
    let didInitialSync = false

    const updateActiveStory = () => {
      if (window.matchMedia('(max-width: 767px)').matches) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const stageRect = stickyStageRef.current?.getBoundingClientRect()
        const focusLine = stageRect
          ? stageRect.top + stageRect.height / 2
          : window.innerHeight / 2
        let nearestIndex = activeRef.current
        let nearestDistance = Infinity

        panelRefs.current.forEach((panel, index) => {
          if (!panel) return
          const rect = panel.getBoundingClientRect()
          const center = rect.top + rect.height / 2
          const distance = Math.abs(center - focusLine)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = index
          }
        })

        if (!didInitialSync) {
          didInitialSync = true
          setCurrentStory(nearestIndex)
          return
        }

        if (nearestIndex !== activeRef.current) {
          const activePanel = panelRefs.current[activeRef.current]
          const activeRect = activePanel?.getBoundingClientRect()
          const activeCenter = activeRect ? activeRect.top + activeRect.height / 2 : Infinity
          const activeDistance = Math.abs(activeCenter - focusLine)

          // Switch just past the midpoint between triggers; a tiny dead zone
          // prevents flicker without making the deck feel late while scrolling.
          if (nearestDistance + 8 < activeDistance) {
            setCurrentStory(nearestIndex)
          }
        }
      })
    }

    const handleResize = () => {
      didInitialSync = false
      updateActiveStory()
    }

    window.addEventListener('scroll', updateActiveStory, { passive: true })
    window.addEventListener('resize', handleResize)
    updateActiveStory()
    return () => {
      window.removeEventListener('scroll', updateActiveStory)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frame)
    }
  }, [setCurrentStory])

  return (
    <section
      className="relative scroll-mt-[24px] overflow-clip bg-[#0d0d0e] px-[clamp(24px,3.2vw,64px)] section-pt max-[767px]:px-5"
      id="features"
      aria-labelledby="product-story-heading"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1420px]">
        <h2 id="product-story-heading" className="relative z-30 mx-auto section-title-gap max-w-[640px] text-balance text-center font-serif section-title text-[#f0efe9]">
          Turn long videos into clips ready to post
        </h2>


        <div role="group" aria-label="Deyn Studio editing workflow" className="relative pt-[clamp(56px,6vw,96px)] max-[767px]:hidden">
          <div ref={stickyStageRef} className="sticky top-[72px] z-20 flex h-[calc(100svh-84px)] w-full items-center overflow-hidden max-[600px]:top-[64px] max-[600px]:h-[calc(100svh-76px)]">
            <div
              className="relative w-full"
              style={{ '--card': 'min(1040px, 70vw, calc((100svh - 300px) * 1.5))', '--gap': 'clamp(20px, 2.4vw, 40px)' }}
            >
              <div
                className="flex items-start will-change-transform transition-transform duration-[650ms] ease-[cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none"
                style={{
                  gap: 'var(--gap)',
                  paddingLeft: 'calc(50% - var(--card) / 2)',
                  transform: `translate3d(calc(${active} * (var(--card) + var(--gap)) * -1), 0, 0)`
                }}
              >
                {stories.map((story, index) => {
                  const isActive = index === active
                  const showCopy = isActive && copyReadyIndex === index
                  const titleAnimation = scrollDirection === 'up' ? styles.titleRollInUp : styles.titleRollInDown
                  const descriptionAnimation = scrollDirection === 'up' ? styles.descriptionBlurInUp : styles.descriptionBlurInDown

                  return (
                    <article
                      key={story.number}
                      aria-current={isActive ? 'step' : undefined}
                      aria-hidden={!isActive}
                      className={`shrink-0 transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none ${isActive ? 'opacity-100' : 'pointer-events-none opacity-40'}`}
                      style={{ width: 'var(--card)', transform: isActive ? 'scale(1)' : 'scale(.92)', transformOrigin: 'center top' }}
                    >
                      <div
                        className={`relative w-full overflow-hidden rounded-[14px] bg-black ${story.video ? 'aspect-video' : 'aspect-[3/2]'}`}
                        style={{
                          boxShadow: isActive
                            ? '0 34px 72px -28px rgb(0 0 0 / .8), 0 8px 22px -10px rgb(0 0 0 / .48)'
                            : '0 14px 30px -12px rgb(0 0 0 / .58)'
                        }}
                        aria-label={isActive ? story.alt : undefined}
                      >
                        {story.video && isActive ? (
                          <DemoVideoPlayer story={story} />
                        ) : (
                          <Image
                            className="object-cover object-center"
                            src={story.image}
                            alt={isActive ? story.alt : ''}
                            fill
                            sizes="(max-width: 600px) 94vw, 1040px"
                            priority={index === 0}
                            draggable={false}
                          />
                        )}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background: `linear-gradient(180deg, rgb(0 0 0 / .02) 40%, rgb(0 0 0 / .16) 72%, rgb(0 0 0 / .38) 100%), radial-gradient(80% 65% at 50% 100%, rgb(${story.imageBackground} / .3), transparent 90%)`
                          }}
                        />
                      </div>

                      <div
                        id={`product-story-copy-${index}`}
                        aria-hidden={!showCopy}
                        className={`relative z-20 mt-5 flex min-h-[152px] items-start justify-center px-7 py-4 text-center transition-opacity duration-[425ms] ease-[cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none max-[900px]:min-h-[166px] ${showCopy ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                      >
                        <div key={`${story.number}-${showCopy ? `active-${active}-${scrollDirection}` : 'idle'}`} className="relative">
                          <h3 className={`${showCopy ? titleAnimation : ''} mx-auto mb-0 max-w-[680px] text-[clamp(16px,2.6vw,26px)] font-medium leading-[1.08] tracking-[-.05em] text-[#f7f4ed]`}>
                            {story.title}
                          </h3>
                          <p className={`${showCopy ? descriptionAnimation : ''} mx-auto mb-0 mt-3 max-w-[52ch] text-[15px] leading-[1.65] text-[#b9babd] max-[900px]:text-[14px]`}>
                            {story.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="mt-2 flex justify-center gap-2" aria-hidden="true">
                {stories.map((story, index) => (
                  <span key={story.number} className={`h-[6px] rounded-full transition-[width,background-color] duration-300 ${index === active ? 'w-6 bg-[#f0efe9]' : 'w-[6px] bg-white/25'}`} />
                ))}
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="pointer-events-none">
            {stories.map((story, index) => (
              <div
                key={`story-trigger-${story.number}`}
                ref={(node) => { panelRefs.current[index] = node }}
                className="h-[85svh] min-h-[480px] max-[600px]:h-[80svh] max-[600px]:min-h-[520px]"
              />
            ))}
          </div>
        </div>
        <div className={styles.mobileStories}>
          {stories.map((story) => (
            <article key={story.number} className={styles.mobileStory}>
              <Image src={story.image} alt={story.alt} width={1200} height={800} sizes="(max-width: 767px) calc(100vw - 40px), 1px" className={styles.mobileImage} />
              <div className={styles.mobileCopy}>
                <span className={styles.stepNumber}>{story.number}</span>
                <div><h3>{story.title}</h3><p>{story.description}</p></div>
              </div>
            </article>
          ))}
        </div>
        <div className="sr-only max-[767px]:hidden" aria-live="polite" aria-atomic="true">Step {stories[active].number}: {stories[active].title}</div>
      </div>
      <div className="h-[clamp(24px,3svh,40px)] max-[767px]:h-0" aria-hidden="true" />
    </section>
  )
}
