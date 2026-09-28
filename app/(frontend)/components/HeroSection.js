'use client'

import { useEffect, useRef, useState } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function HeroSection({ downloadUrl }) {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const mobileSectionRef = useRef(null)
  const mobileStageRef = useRef(null)
  const videoRef = useRef(null)
  const mobileHeroVideoRef = useRef(null)
  const [viewportSize, setViewportSize] = useState({ width: 1440, height: 900 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mobileScrollProgress, setMobileScrollProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMobilePlaying, setIsMobilePlaying] = useState(false)

  useEffect(() => {
    let frame = 0
    const updateProgress = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current
        const stage = stageRef.current
        if (section && stage) {
          const scrollRange = section.offsetHeight - stage.offsetHeight
          const next = scrollRange > 0
            ? clamp(-section.getBoundingClientRect().top / scrollRange, 0, 1)
            : 0
          setScrollProgress((current) => Math.abs(current - next) > 0.004 ? next : current)
        }

        const mobileSection = mobileSectionRef.current
        const mobileStage = mobileStageRef.current
        if (mobileSection && mobileStage) {
          const scrollRange = mobileSection.offsetHeight - mobileStage.offsetHeight
          const next = scrollRange > 0
            ? clamp(-mobileSection.getBoundingClientRect().top / scrollRange, 0, 1)
            : 0
          setMobileScrollProgress((current) => Math.abs(current - next) > 0.004 ? next : current)
        }
      })
    }

    const updateViewportSize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    updateViewportSize()
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    window.addEventListener('resize', updateViewportSize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      window.removeEventListener('resize', updateViewportSize)
    }
  }, [])

  const viewportWidth = viewportSize.width
  const viewportHeight = viewportSize.height
  const isMobile = viewportWidth <= 700
  const cardWidth = isMobile
    ? viewportWidth - 24
    : Math.min(viewportWidth * 0.85, viewportHeight * 0.82 * 16 / 9)
  const cardHeight = cardWidth * 9 / 16
  // Keep a generous pixel-art frame around the demo on portrait screens. If
  // the backdrop shrinks to the video’s landscape ratio, it becomes a tiny bar.
  const finalHeightScale = isMobile ? 0.68 : cardHeight / viewportHeight
  const finalWidthScale = cardWidth / viewportWidth
  const easedProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress)
  const backgroundScaleX = 1 - (1 - finalWidthScale) * easedProgress
  const backgroundScaleY = 1 - (1 - finalHeightScale) * easedProgress
  const videoOpacity = isMobile
    ? clamp((easedProgress - 0.06) / 0.62, 0, 1)
    : clamp((easedProgress - 0.36) / 0.64, 0, 1)
  const copyOpacity = clamp((0.34 - easedProgress) / 0.22, 0, 1)
  const mobileEasedProgress = mobileScrollProgress * mobileScrollProgress * (3 - 2 * mobileScrollProgress)
  const mobileBlurProgress = clamp((mobileEasedProgress - 0.12) / 0.55, 0, 1)
  const mobilePlayOpacity = clamp((mobileEasedProgress - 0.28) / 0.22, 0, 1)
  const mobileCopyOpacity = clamp((0.38 - mobileEasedProgress) / 0.22, 0, 1)

  return (
    <>
    <section ref={sectionRef} className="relative h-[260svh] max-[700px]:hidden" id="hero">
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden bg-[#08090c]">
        <div
          className="absolute overflow-hidden"
          style={{
            width: `${backgroundScaleX * 100}%`,
            height: `${backgroundScaleY * 100}%`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: `${easedProgress * 28}px`,
            border: `1px solid rgb(137 158 219 / ${easedProgress * 0.16})`,
            boxShadow: `0 ${easedProgress * 36}px ${easedProgress * 100}px rgb(0 0 0 / ${easedProgress * 0.55})`,
          }}
        >
          <div className="absolute -inset-[4%] bg-[url('/cutly-hero-pixel.png')] bg-cover bg-[position:72%_center] bg-no-repeat motion-safe:animate-pixel-scene motion-reduce:animate-none max-[700px]:bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgb(5_7_12/.18)_0%,_rgb(5_7_12/.3)_36%,_rgb(5_7_12/.4)_58%,_rgb(8_9_12/.62)_100%)]" />
          <div className="absolute inset-x-0 top-[24%] z-0 h-[52%] bg-[radial-gradient(ellipse_at_center,_rgb(4_8_18/.42)_0%,_rgb(4_8_18/.24)_44%,_transparent_78%)]" />
          <div className="absolute inset-0 bg-[#08090c]" style={{ opacity: 0.05 + easedProgress * 0.4 }} />
          <img
            src="/cutly-pixel-clouds.png"
            alt=""
            aria-hidden="true"
            draggable="false"
            className="pointer-events-none absolute left-[15%] top-[5%] z-[1] w-[70%] max-w-none opacity-40 [image-rendering:pixelated] motion-safe:animate-pixel-clouds motion-reduce:animate-none max-[700px]:left-0 max-[700px]:top-[9%] max-[700px]:w-full"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
            <span className="absolute left-[17%] top-[15%] h-[2px] w-[2px] bg-[#dbe8ff] shadow-[0_0_8px_2px_rgb(190_213_255/.55)] motion-safe:animate-pixel-twinkle motion-reduce:animate-none" />
            <span className="absolute left-[32%] top-[24%] h-[2px] w-[2px] bg-[#dbe8ff] shadow-[0_0_8px_2px_rgb(190_213_255/.55)] [animation-delay:-1.2s] motion-safe:animate-pixel-twinkle motion-reduce:animate-none" />
            <span className="absolute left-[47%] top-[11%] h-[2px] w-[2px] bg-[#dbe8ff] shadow-[0_0_8px_2px_rgb(190_213_255/.55)] [animation-delay:-2.4s] motion-safe:animate-pixel-twinkle motion-reduce:animate-none" />
            <span className="absolute left-[70%] top-[20%] h-[2px] w-[2px] bg-[#dbe8ff] shadow-[0_0_8px_2px_rgb(190_213_255/.55)] [animation-delay:-.8s] motion-safe:animate-pixel-twinkle motion-reduce:animate-none" />
            <span className="absolute left-[10%] top-[12%] h-[2px] w-[108px] origin-left rounded-full bg-[linear-gradient(90deg,transparent_0%,rgb(173_211_255/.08)_42%,rgb(218_235_255/.72)_86%,#fff_100%)] shadow-[0_0_10px_rgb(167_207_255/.7)] motion-safe:animate-pixel-meteor motion-reduce:animate-none max-[700px]:left-[4%] max-[700px]:top-[13%]" />
          </div>

          <div
            className="absolute inset-0 z-[3] overflow-hidden"
            style={{
              pointerEvents: isPlaying ? 'auto' : 'none'
            }}
            inert={!isPlaying}
          >
            <video ref={videoRef} className="absolute inset-0 block h-full w-full object-cover transition-opacity duration-500" style={{ opacity: isPlaying ? 1 : 0 }} controls={isPlaying} playsInline preload="metadata" aria-label="Cutly product demo" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)}>
              <source src="/app-shots/demo-video.mp4" type="video/mp4" />
              Your browser does not support MP4 video playback.
            </video>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[4] bg-[#050812]/45 transition-opacity duration-500"
            style={{ opacity: isPlaying ? 0 : videoOpacity, backdropFilter: isPlaying ? 'none' : `blur(${videoOpacity * 10}px)` }}
          />
          <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center transition-opacity duration-500" style={{ opacity: isPlaying || videoOpacity < 0.55 ? 0 : 1 }}>
            <div className="flex flex-col items-center gap-5 text-center [text-shadow:0_2px_16px_rgb(0_0_0/.65)]">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.2em] text-[#c5d2f1]">The Cutly workflow</p>
                <h2 className="m-0 text-[clamp(30px,3vw,42px)] font-medium leading-[1.04] tracking-[-.05em] text-white">See a full video become<br />share-ready clips.</h2>
              </div>
              <button type="button" aria-label="Play Cutly product demo" onClick={() => videoRef.current?.play().catch(() => {})} className="group pointer-events-auto grid h-[76px] w-[76px] place-items-center rounded-full border border-white/45 bg-white/20 text-white shadow-[0_12px_50px_rgb(0_0_0/.4),inset_0_1px_rgb(255_255_255/.35)] backdrop-blur-xl transition-[transform,background-color,border-color] duration-300 hover:scale-105 hover:border-white/70 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white max-[600px]:h-[64px] max-[600px]:w-[64px]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current transition-transform duration-300 group-hover:scale-110 max-[600px]:h-6 max-[600px]:w-6"><path d="M7.5 4.9c0-.78.86-1.25 1.52-.82l10.1 6.6a1.56 1.56 0 0 1 0 2.62l-10.1 6.6a1 1 0 0 1-1.52-.82V4.9Z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6 pb-8 pt-[70px] text-center text-white [text-shadow:0_3px_24px_rgb(0_0_0/.42)] max-[600px]:px-5 max-[600px]:pb-4 max-[600px]:pt-[60px]"
          style={{ opacity: copyOpacity, transform: `translateY(${-easedProgress * 44}px)`, pointerEvents: copyOpacity < 0.05 ? 'none' : 'auto' }}
        >
          <h1 className="m-0 text-[clamp(40px,5vw,68px)] font-medium leading-[1.03] tracking-[-.064em] max-[600px]:text-[clamp(34px,9vw,42px)] max-[600px]:leading-[1.02]">One video<br />unlimited clips</h1>
           <a href={downloadUrl || '/download'} className="mt-7 inline-flex min-h-[54px] items-center gap-2.5 rounded-[13px] border border-white/15 bg-[#f2f2ee] px-5 text-[15px] font-semibold text-[#0b0b0d] shadow-[inset_0_1px_rgb(255_255_255/.22),0_15px_40px_rgb(74_83_193/.3)] transition-transform duration-200 hover:-translate-y-0.5 max-[600px]:mt-6 max-[600px]:min-h-[50px]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M16.7 12.5c0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2-1.4-2.4-1.4-1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.2-.6-1.1 0-2.2.7-2.7 1.7-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.1-.5s1.3.5 2.2.5c.9 0 1.4-.8 1.9-1.6.6-.9.9-1.8.9-1.8s-1.8-.7-1.8-2.9ZM15.1 7.4c.4-.5.7-1.2.6-1.9-.6 0-1.4.4-1.9.9-.4.5-.7 1.1-.7 1.8.7.1 1.5-.3 2-.8Z" /></svg>Download for Mac</a>
          <p className="mx-auto mt-6 max-w-[630px] text-base leading-[1.6] text-[#e0e5ef] [text-shadow:0_2px_12px_rgb(0_0_0/.72)] max-[600px]:mt-5 max-[600px]:text-[15px]">Smart clipping, reframing, captions, and media tools all on your Mac. No subscriptions.</p>
         
          <div className="mt-4 flex items-center justify-center gap-2.5 text-[11px] text-[#d0d7e4] [text-shadow:0_2px_10px_rgb(0_0_0/.78)] max-[600px]:mt-3"><span>Fast local workflow</span><i className="h-[3px] w-[3px] rounded-full bg-current" /><span>Coming soon to Windows &amp; Linux</span></div>
        </div>

        <div className="absolute bottom-9 left-1/2 z-[2] -translate-x-1/2 text-center text-[11px] font-medium tracking-[.12em] text-white/65 max-[600px]:bottom-7" style={{ opacity: copyOpacity }}>Scroll to watch demo <span aria-hidden="true" className="mt-2 block text-base leading-none">↓</span></div>

        </div>
    </section>

    <div className="hidden max-[700px]:block" id="hero-mobile">
      <section ref={mobileSectionRef} className="relative h-[190svh] bg-[#08090c]">
        <div ref={mobileStageRef} className="sticky top-0 h-svh overflow-hidden bg-[#08090c] px-5 text-center text-white">
          <div aria-hidden="true" className="absolute inset-0 bg-[url('/cutly-hero-pixel.png')] bg-cover bg-center opacity-90 motion-safe:animate-pixel-scene motion-reduce:animate-none" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,_rgb(5_7_12/.28)_0%,_rgb(5_7_12/.26)_28%,_rgb(4_8_18/.48)_48%,_rgb(4_8_18/.4)_68%,_rgb(8_9_12/.76)_100%)]" />
          <div aria-hidden="true" className="absolute inset-x-0 top-[28%] z-0 h-[44%] bg-[radial-gradient(ellipse_at_center,_rgb(4_8_18/.52)_0%,_rgb(4_8_18/.3)_45%,_transparent_78%)]" />
          <img src="/cutly-pixel-clouds.png" alt="" aria-hidden="true" draggable="false" className="pointer-events-none absolute left-[-12%] top-[12%] w-[124%] opacity-35 [image-rendering:pixelated] motion-safe:animate-pixel-clouds motion-reduce:animate-none" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            <span className="absolute left-[17%] top-[15%] h-[2px] w-[2px] bg-[#dbe8ff] shadow-[0_0_8px_2px_rgb(190_213_255/.55)] motion-safe:animate-pixel-twinkle motion-reduce:animate-none" />
            <span className="absolute left-[32%] top-[24%] h-[2px] w-[2px] bg-[#dbe8ff] shadow-[0_0_8px_2px_rgb(190_213_255/.55)] [animation-delay:-1.2s] motion-safe:animate-pixel-twinkle motion-reduce:animate-none" />
            <span className="absolute left-[70%] top-[20%] h-[2px] w-[2px] bg-[#dbe8ff] shadow-[0_0_8px_2px_rgb(190_213_255/.55)] [animation-delay:-.8s] motion-safe:animate-pixel-twinkle motion-reduce:animate-none" />
            <span className="absolute left-[4%] top-[13%] h-[2px] w-[108px] origin-left rounded-full bg-[linear-gradient(90deg,transparent_0%,rgb(173_211_255/.08)_42%,rgb(218_235_255/.72)_86%,#fff_100%)] shadow-[0_0_10px_rgb(167_207_255/.7)] motion-safe:animate-pixel-meteor motion-reduce:animate-none" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] transition-[backdrop-filter,background-color,opacity] duration-500" style={{ opacity: mobileBlurProgress, backdropFilter: `blur(${mobileBlurProgress * 12}px)`, backgroundColor: `rgb(5 8 18 / ${mobileBlurProgress * 0.28})` }} />
          <div className={`absolute inset-x-5 top-1/2 z-[3] mx-auto w-auto max-w-[620px] -translate-y-1/2 transition-[opacity,margin] duration-500 ${mobilePlayOpacity < 0.05 ? 'pointer-events-none opacity-0' : 'opacity-100'}`} style={{ opacity: mobilePlayOpacity, marginTop: `${(1 - mobilePlayOpacity) * 18}px` }}>
            <div className="mb-5 text-center [text-shadow:0_3px_22px_rgb(0_0_0/.5)]">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#c5d2f1]">The Cutly workflow</p>
              <h2 className="m-0 text-[clamp(25px,7vw,34px)] font-medium leading-[1.04] tracking-[-.05em] text-white">See a full video become<br />share-ready clips.</h2>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-[18px] border border-white/20 bg-[#080a10] shadow-[0_24px_70px_rgb(0_0_0/.52),inset_0_1px_rgb(255_255_255/.08)]">
              <video ref={mobileHeroVideoRef} className="absolute inset-0 h-full w-full object-contain" style={{ opacity: isMobilePlaying ? 1 : 0 }} controls={isMobilePlaying} playsInline preload="none" aria-label="Cutly product demo" onPlay={() => setIsMobilePlaying(true)} onEnded={() => setIsMobilePlaying(false)}>
                <source src="/app-shots/demo-video.mp4" type="video/mp4" />
                Your browser does not support MP4 video playback.
              </video>
              <button type="button" aria-label="Play Cutly product demo" onClick={() => mobileHeroVideoRef.current?.play().catch(() => {})} className={`absolute inset-0 m-auto grid h-[76px] w-[76px] place-items-center rounded-full border border-white/50 bg-white/20 text-white shadow-[0_12px_50px_rgb(0_0_0/.4),inset_0_1px_rgb(255_255_255/.35)] backdrop-blur-xl transition-[opacity,transform,background-color] duration-300 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${isMobilePlaying ? 'pointer-events-none scale-90 opacity-0' : 'pointer-events-auto scale-100 opacity-100 hover:bg-white/30'}`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current"><path d="M7.5 4.9c0-.78.86-1.25 1.52-.82l10.1 6.6a1.56 1.56 0 0 1 0 2.62l-10.1 6.6a1 1 0 0 1-1.52-.82V4.9Z" /></svg>
              </button>
            </div>
          </div>
          <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center px-5 pb-16 pt-24 transition-opacity duration-300" style={{ opacity: isMobilePlaying ? 0 : mobileCopyOpacity, pointerEvents: mobileCopyOpacity > 0.05 && !isMobilePlaying ? 'auto' : 'none' }}>
            <div className="mx-auto flex w-full max-w-[460px] flex-col items-center [text-shadow:0_3px_22px_rgb(0_0_0/.38)]">
              <h1 className="m-0 text-[clamp(36px,9.5vw,44px)] font-medium leading-[1.02] tracking-[-.064em]">One video<br />unlimited clips</h1>
              <p className="mx-auto mt-5 max-w-[410px] text-[15px] leading-[1.6] text-[#e0e5ef] [text-shadow:0_2px_12px_rgb(0_0_0/.72)]">Smart clipping, reframing, captions, and media tools all on your Mac. No subscriptions.</p>
              <a href={downloadUrl || '/download'} className="mt-6 inline-flex min-h-[50px] items-center gap-2.5 rounded-[13px] border border-white/15 bg-[#f2f2ee] px-5 text-[15px] font-semibold text-[#0b0b0d] shadow-[0_15px_40px_rgb(74_83_193/.3)] transition-transform duration-200 active:scale-[.98]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M16.7 12.5c0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2-1.4-2.4-1.4-1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.2-.6-1.1 0-2.2.7-2.7 1.7-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.1-.5s1.3.5 2.2.5c.9 0 1.4-.8 1.9-1.6.6-.9.9-1.8.9-1.8s-1.8-.7-1.8-2.9ZM15.1 7.4c.4-.5.7-1.2.6-1.9-.6 0-1.4.4-1.9.9-.4.5-.7 1.1-.7 1.8.7.1 1.5-.3 2-.8Z" /></svg>Download for Mac</a>
              <div className="mt-3 flex items-center justify-center gap-2.5 text-[11px] text-[#d0d7e4] [text-shadow:0_2px_10px_rgb(0_0_0/.78)]"><span>Fast local workflow</span><i className="h-[3px] w-[3px] rounded-full bg-current" /><span>Windows &amp; Linux coming soon</span></div>
            </div>
          </div>
          <div className="absolute bottom-7 left-1/2 z-[4] -translate-x-1/2 text-[11px] font-medium tracking-[.12em] text-white/70" style={{ opacity: mobileCopyOpacity }}>Scroll to watch demo <span aria-hidden="true" className="mt-2 block text-base leading-none">↓</span></div>
        </div>
      </section>
    </div>
    </>
  )
}
