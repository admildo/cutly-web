'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import styles from './HeroSpiral.module.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const uniqueCardAssets = [
  { src: '/card-media/se-15.mp4', poster: '/card-media/se-15-poster.webp', type: 'video' },
  { src: '/card-media/se-2.webp', type: 'image' },
  { src: '/card-media/se-16.mp4', poster: '/card-media/se-16-poster.webp', type: 'video' },
  { src: '/card-media/se-3.webp', type: 'image' },
  { src: '/card-media/se-17.mp4', poster: '/card-media/se-17-poster.webp', type: 'video' },
  { src: '/card-media/se-4.webp', type: 'image' },
  { src: '/card-media/se-18.mp4', poster: '/card-media/se-18-poster.webp', type: 'video' },
  { src: '/card-media/se-5.webp', type: 'image' },
  { src: '/card-media/se-19.mp4', poster: '/card-media/se-19-poster.webp', type: 'video' },
  { src: '/card-media/se-6.webp', type: 'image' },
  { src: '/card-media/se-20.mp4', poster: '/card-media/se-20-poster.webp', type: 'video' },
  { src: '/card-media/se-7.webp', type: 'image' },
  { src: '/card-media/se-21.mp4', poster: '/card-media/se-21-poster.webp', type: 'video' },
  { src: '/card-media/se-8.webp', type: 'image' },
  { src: '/card-media/se-9.webp', type: 'image' },
  { src: '/card-media/se-10.webp', type: 'image' },
  { src: '/card-media/se-11.webp', type: 'image' },
  { src: '/card-media/se-12.webp', type: 'image' },
  { src: '/card-media/se-13.webp', type: 'image' },
  { src: '/card-media/se-14.webp', type: 'image' },
  { src: '/card-media/si-1.webp', type: 'image' },
]

const cardAssets = [
  ...uniqueCardAssets.slice(0, 15),
  ...uniqueCardAssets.slice(0, 9),
  ...uniqueCardAssets.slice(15),
]

const cards = cardAssets.map(({ src, poster, type }, index) => ({
  src,
  poster,
  type,
  title: `Project ${String(index + 1).padStart(2, '0')}`,
  category: type === 'video' ? 'Motion' : 'Selected work',
}))

const NAV_ISLAND_EVENT = 'cutly:hero-island-state'
const PROMPT_REVEAL_START = 0.38
const PROMPT_REVEAL_DURATION = 0.1
const PROMPT_HEADLINE_START = PROMPT_REVEAL_START + PROMPT_REVEAL_DURATION
const PROMPT_REVEAL_END = 0.62
const NAV_ISLAND_REVEAL_FRACTION = 0.5
const GAZE_SCROLL_CUTOFF = 0.5
const heroHeadlines = [
  'One video. Endless clips.',
  'Standout moments, found.',
  'Caption. Reframe. Export.',
  'Compress. Convert. Done.',
  'Backgrounds out. No limits.',
  'Every image. One pass.',
]

const publishHeroIslandState = (active) => {
  const state = String(active)
  if (document.documentElement.dataset.cutlyHeroIsland === state) return

  document.documentElement.dataset.cutlyHeroIsland = state
  window.dispatchEvent(new CustomEvent(NAV_ISLAND_EVENT, { detail: { active } }))
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const smoothstep = (min, max, value) => {
  const t = clamp((value - min) / (max - min), 0, 1)
  return t * t * (3 - 2 * t)
}

function getCardPose(index, progress, width, height, mobile, orbitRotation = 0) {
  const position = index / (cards.length - 1)
  const angle = 2.7 + position * Math.PI * 6
  const travel = progress
  const theta = angle + orbitRotation + travel * Math.PI * 2
  const radiusX = width * (mobile ? 0.42 : 0.36) * (1 + travel * 0.04)
  const verticalSpan = Math.min(height * (mobile ? 0.64 : 0.84), mobile ? 700 : 760)
  const radiusZ = mobile ? 240 : 430
  const baseY = (position - 0.5) * verticalSpan
  const x = Math.cos(theta) * radiusX
  const rise = height * (mobile ? 0.62 : 0.82)
  const y = baseY - travel * rise + (mobile ? height * 0.1 : 0)
  const z = Math.sin(theta) * radiusZ + travel * 30
  const depthScale = 0.72 + ((Math.sin(theta) + 1) / 2) * 0.42
  const faceCenterY = mobile ? -height * 0.03 : -height * 0.1
  const faceCrossing = (1 - smoothstep(width * 0.06, width * 0.22, Math.abs(x)))
    * (1 - smoothstep(height * 0.08, height * 0.24, Math.abs(y - faceCenterY)))
  const scale = depthScale * (1 - faceCrossing * 0.36)
    * (1 + travel * 0.04 * Math.max(0, Math.sin(theta)))
  const cardTilt = Math.sin((index + 1) * 2.17) * 14
  const rotation = cardTilt * (1 - travel * 0.55) + Math.sin(theta + 0.3) * 6
  const rotationY = 90 - theta * (180 / Math.PI)
  const rotationX = Math.cos(theta) * 10
  const exitFade = clamp((-y - height * 0.42) / (height * 0.5), 0, 0.4)
  const depthOpacity = 0.68 + ((Math.sin(theta) + 1) / 2) * 0.32

  return { x, y, z, scale, rotation, rotationX, rotationY, opacity: depthOpacity * (1 - exitFade) }
}

export function HeroSpiral({ downloadUrl = '/download' }) {
  const gazeId = useId().replace(/:/g, '')
  const gazeFeatherId = `hero-gaze-feather-${gazeId}`
  const gazeMaskId = `hero-gaze-eye-mask-${gazeId}`
  const [hoveredCard, setHoveredCard] = useState(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isHeadlinePromptActive, setIsHeadlinePromptActive] = useState(false)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [previousHeadlineIndex, setPreviousHeadlineIndex] = useState(null)
  const sectionRef = useRef(null)
  const sceneRef = useRef(null)
  const backdropRef = useRef(null)
  const lowerMaskRef = useRef(null)
  const scrollPromptRef = useRef(null)
  const videoStageRef = useRef(null)
  const videoPromptRef = useRef(null)
  const playPromptRef = useRef(null)
  const videoRef = useRef(null)
  const hoverLabelRef = useRef(null)
  const hoveredCardIndexRef = useRef(null)
  const subjectGazeRef = useRef(null)
  const headlineIndexRef = useRef(0)
  const headlinePromptActiveRef = useRef(false)
  const cardRefs = useRef([])
  const cardVideoRefs = useRef([])
  const idleRefs = useRef([])
  const parallaxRefs = useRef([])
  const faceRefs = useRef([])
  const subjectMotionRef = useRef(null)
  const subjectIdleRef = useRef(null)
  const subjectParallaxRef = useRef(null)
  const worldRef = useRef(null)
  const cameraRef = useRef(null)

  useEffect(() => {
    if (!isHeadlinePromptActive) return undefined

    const interval = window.setInterval(() => {
      const nextHeadlineIndex = (headlineIndexRef.current + 1) % heroHeadlines.length
      setPreviousHeadlineIndex(headlineIndexRef.current)
      headlineIndexRef.current = nextHeadlineIndex
      setHeadlineIndex(nextHeadlineIndex)
    }, 4200)

    return () => window.clearInterval(interval)
  }, [isHeadlinePromptActive])

  useGSAP(() => {
    const media = gsap.matchMedia()

    media.add({
      all: 'all',
      mobile: '(max-width: 767px)',
      reducedMotion: '(prefers-reduced-motion: reduce)',
    }, ({ conditions }) => {
      const mobile = conditions.mobile
      const reducedMotion = conditions.reducedMotion
      let width = sceneRef.current?.clientWidth || window.innerWidth
      let height = sceneRef.current?.clientHeight || window.innerHeight
      const cardNodes = cardRefs.current.filter(Boolean)
      const idleNodes = idleRefs.current.filter(Boolean)
      const parallaxNodes = parallaxRefs.current.filter(Boolean)
      const faceNodes = faceRefs.current.filter(Boolean)
      const subjectMotion = subjectMotionRef.current
      const subjectIdle = subjectIdleRef.current
      const subjectParallax = subjectParallaxRef.current
      const world = worldRef.current
      const camera = cameraRef.current
      const scrollState = { progress: 0 }
      const orbitState = { rotation: 0 }
      const visibleVideoCards = new Set()
      const pendingVideoPlays = new WeakSet()
      const blockedVideoPlays = new WeakSet()
      const canObserveVideoCards = typeof window.IntersectionObserver === 'function'
      let activeGaze = subjectGazeRef.current?.dataset.gaze ?? 'center'
      const setSubjectGaze = (direction) => {
        const gazeElement = subjectGazeRef.current
        if (!gazeElement) return
        const canTrackGaze = !reducedMotion
          && scrollState.progress < GAZE_SCROLL_CUTOFF
        const nextGaze = direction !== 'center' && canTrackGaze ? direction : 'center'
        if (activeGaze === nextGaze && gazeElement.dataset.gaze === nextGaze) return

        activeGaze = nextGaze
        gazeElement.dataset.gaze = nextGaze
      }
      const getSpiralProgress = () => clamp(scrollState.progress / 0.52, 0, 1)
      const getFinalBackdropSize = () => {
        if (mobile) return { width: width - 24, height: height * 0.68 }
        const cardWidth = Math.min(width * 0.85, height * 0.82 * 16 / 9)
        return { width: cardWidth, height: cardWidth * 9 / 16 }
      }
      const getBackdropStartScale = () => {
        const size = getFinalBackdropSize()
        return Math.max(width / size.width, height / size.height) * 1.08
      }
      const syncBackdropDimensions = () => {
        const size = getFinalBackdropSize()
        gsap.set(backdropRef.current, { width: size.width, height: size.height })
      }
      const updateNavigationIsland = (progress) => {
        const revealAt = PROMPT_REVEAL_START + PROMPT_REVEAL_DURATION * NAV_ISLAND_REVEAL_FRACTION
        publishHeroIslandState(progress >= revealAt)

        const headlinePromptActive = !reducedMotion
          && progress >= PROMPT_HEADLINE_START
          && progress < PROMPT_REVEAL_END
        if (headlinePromptActive !== headlinePromptActiveRef.current) {
          headlinePromptActiveRef.current = headlinePromptActive
          setIsHeadlinePromptActive(headlinePromptActive)
          if (!headlinePromptActive) {
            headlineIndexRef.current = 0
            setHeadlineIndex(0)
            setPreviousHeadlineIndex(null)
          }
        }
      }

      const positionHoverLabel = (index = hoveredCardIndexRef.current) => {
        if (index === null) return
        const face = faceNodes[index]
        const label = hoverLabelRef.current
        const scene = sceneRef.current
        if (!face || !label || !scene) return

        const cardBounds = face.getBoundingClientRect()
        const halfLabelWidth = label.offsetWidth / 2 || 75
        const halfLabelHeight = label.offsetHeight / 2 || 24
        const labelGap = 12
        const canPlaceRight = cardBounds.right + label.offsetWidth + labelGap <= window.innerWidth - 12
        const centerX = canPlaceRight
          ? cardBounds.right + halfLabelWidth + labelGap
          : cardBounds.left - halfLabelWidth - labelGap
        const centerY = cardBounds.top + cardBounds.height * 0.68
        label.style.left = `${clamp(centerX, halfLabelWidth + 12, window.innerWidth - halfLabelWidth - 12)}px`
        label.style.top = `${clamp(centerY, halfLabelHeight + 12, window.innerHeight - halfLabelHeight - 12)}px`
      }

      const syncCardVideo = (video, shouldPlay) => {
        if (!video) return

        if (video.dataset.shouldPlay !== String(shouldPlay)) {
          video.dataset.shouldPlay = String(shouldPlay)
        }

        if (shouldPlay) {
          if (!video.paused || pendingVideoPlays.has(video) || blockedVideoPlays.has(video)) return
          pendingVideoPlays.add(video)
          const playRequest = video.play()
          if (playRequest?.then) {
            playRequest.then(() => {
              pendingVideoPlays.delete(video)
              if (video.dataset.shouldPlay !== 'true') video.pause()
            }).catch((error) => {
              pendingVideoPlays.delete(video)
              if (error?.name !== 'AbortError') blockedVideoPlays.add(video)
            })
          } else {
            pendingVideoPlays.delete(video)
          }
          return
        }

        if (!video.paused) video.pause()
      }

      const renderSpiral = (progress, sceneProgress = scrollState.progress) => {
        const videoCandidates = []
        cardNodes.forEach((node, index) => {
          const pose = getCardPose(index, progress, width, height, mobile, orbitState.rotation)
          node.style.transform = `translate(-50%, -50%) translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) rotateY(${pose.rotationY}deg) rotateX(${pose.rotationX}deg) rotateZ(${pose.rotation}deg) scale(${pose.scale})`
          const renderedOpacity = pose.opacity * (1 - smoothstep(0.58, 0.8, sceneProgress))
          node.style.opacity = renderedOpacity
          node.style.pointerEvents = sceneProgress > 0.76 ? 'none' : 'auto'
          const video = cardVideoRefs.current[index]
          const isVisible = canObserveVideoCards
            ? visibleVideoCards.has(index)
            : Math.abs(pose.x) < width * 0.62 && Math.abs(pose.y) < height * 0.62
          const facesCamera = Math.cos(pose.rotationY * (Math.PI / 180)) > 0.35
          if (video && isVisible && facesCamera && renderedOpacity > 0.02 && !document.hidden) {
            videoCandidates.push(index)
          }
        })

        // All visible, front-facing video cards play. IntersectionObserver keeps
        // offscreen cards on their lightweight static posters.
        const playingVideoCards = new Set(videoCandidates)
        cardVideoRefs.current.forEach((video, index) => syncCardVideo(video, playingVideoCards.has(index)))
        positionHoverLabel()
      }

      syncBackdropDimensions()
      renderSpiral(0)
      gsap.set(subjectMotion, { scale: 1, y: 0, opacity: 1 })
      gsap.set([world, camera], { rotationX: 0, rotationY: 0 })

      const videoVisibilityObserver = canObserveVideoCards
        ? new window.IntersectionObserver((entries) => {
          let visibilityChanged = false
          entries.forEach((entry) => {
            const index = Number(entry.target.dataset.cardIndex)
            if (!Number.isInteger(index) || !cardVideoRefs.current[index]) return

            if (entry.isIntersecting && entry.intersectionRatio > 0.02) {
              visibilityChanged = !visibleVideoCards.has(index) || visibilityChanged
              visibleVideoCards.add(index)
            } else {
              visibilityChanged = visibleVideoCards.delete(index) || visibilityChanged
            }
          })

          if (visibilityChanged) renderSpiral(getSpiralProgress())
        }, { root: sceneRef.current, rootMargin: '48px', threshold: [0, 0.02] })
        : null

      if (videoVisibilityObserver) {
        cardNodes.forEach((node, index) => {
          if (cardVideoRefs.current[index]) videoVisibilityObserver.observe(node)
        })
      } else {
        cardVideoRefs.current.forEach((video, index) => {
          if (video) visibleVideoCards.add(index)
        })
        renderSpiral(0)
      }

      const orbitTween = reducedMotion ? null : gsap.to(orbitState, {
        rotation: Math.PI * 2,
        duration: 36,
        repeat: -1,
        ease: 'none',
        onUpdate: () => renderSpiral(getSpiralProgress()),
      })
      const idleTweens = reducedMotion ? [] : idleNodes.map((node, index) => gsap.to(node, {
        y: index % 2 === 0 ? -4 : 4,
        rotationY: index % 2 === 0 ? 1.2 : -1.2,
        duration: 8 + index * 0.65,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * -0.7,
      }))
      const subjectIdleTween = reducedMotion ? null : gsap.to(subjectIdle, {
        y: -2,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      let ambientMotionActive = !reducedMotion
      let orbitActive = !reducedMotion
      const syncMotionActivity = (progress = scrollState.progress) => {
        const shouldAnimate = !reducedMotion && !document.hidden && progress < 0.76
        if (shouldAnimate !== ambientMotionActive) {
          ambientMotionActive = shouldAnimate
          idleTweens.forEach((tween) => (shouldAnimate ? tween.resume() : tween.pause()))
          if (shouldAnimate) subjectIdleTween?.resume()
          else subjectIdleTween?.pause()
        }

        const shouldOrbit = shouldAnimate && hoveredCardIndexRef.current === null
        if (shouldOrbit !== orbitActive) {
          orbitActive = shouldOrbit
          if (shouldOrbit) orbitTween?.resume()
          else orbitTween?.pause()
        }
      }

      const onDocumentVisibilityChange = () => {
        syncMotionActivity()
        renderSpiral(getSpiralProgress())
      }
      document.addEventListener('visibilitychange', onDocumentVisibilityChange)
      syncMotionActivity()

      const timeline = gsap.timeline({
        onUpdate: () => {
          updateNavigationIsland(scrollState.progress)
          syncMotionActivity(scrollState.progress)
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${(sceneRef.current?.clientHeight || height) * (mobile ? 1.9 : 2.8)}`,
          // Safari changes its visual viewport as browser chrome collapses.
          // A native sticky scene avoids ScrollTrigger's fixed-pixel pin state
          // on mobile while the section's CSS height supplies the scroll runway.
          pin: mobile ? false : sceneRef.current,
          pinSpacing: !mobile,
          scrub: mobile ? 0.18 : 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (trigger) => {
            const progress = trigger.animation?.progress() ?? trigger.progress
            updateNavigationIsland(progress)
            syncMotionActivity(progress)
          },
        },
      })

      timeline.to(scrollState, {
        progress: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => renderSpiral(getSpiralProgress(), scrollState.progress),
      }, 0)
      timeline.fromTo(backdropRef.current, {
        opacity: 0,
        scale: getBackdropStartScale,
        borderRadius: 0,
      }, {
        opacity: 1,
        scale: 1,
        borderRadius: mobile ? 14 : 20,
        duration: 0.25,
        ease: 'power2.out',
      }, 0.57)
      timeline.fromTo(lowerMaskRef.current, {
        scaleY: 0,
      }, {
        scaleY: 1,
        duration: 0.36,
        ease: 'power2.inOut',
      }, 0.16)
      timeline.fromTo(scrollPromptRef.current, {
        autoAlpha: 0,
        y: 18,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: PROMPT_REVEAL_DURATION,
        ease: 'power2.out',
      }, PROMPT_REVEAL_START)
      timeline.to(scrollPromptRef.current, {
        autoAlpha: 0,
        y: -12,
        duration: 0.12,
        ease: 'power2.in',
      }, PROMPT_REVEAL_END)
      timeline.to(lowerMaskRef.current, {
        opacity: 0,
        duration: 0.14,
        ease: 'power1.out',
      }, 0.72)
      timeline.to(subjectMotion, {
        scale: mobile ? 0.48 : 0.4,
        y: () => -(sceneRef.current?.clientHeight || height) * (mobile ? 0.12 : 0.15),
        opacity: 0,
        duration: 0.28,
        ease: 'power2.inOut',
      }, 0.57)
      timeline.fromTo(videoStageRef.current, {
        autoAlpha: 0,
        filter: 'blur(12px)',
        scale: 0.985,
        y: 16,
      }, {
        autoAlpha: 1,
        filter: 'blur(0px)',
        scale: 1,
        y: 0,
        duration: 0.2,
        ease: 'power3.out',
      }, 0.7)
      timeline.fromTo(videoPromptRef.current, {
        autoAlpha: 0,
        y: 14,
        filter: 'blur(5px)',
      }, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.16,
        ease: 'power3.out',
      }, 0.79)
      timeline.fromTo(playPromptRef.current, {
        autoAlpha: 0,
        y: 8,
        scale: 0.9,
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.12,
        ease: 'back.out(1.2)',
      }, 0.84)
      timeline.to(world, {
        rotationY: mobile ? 8 : 16,
        rotationX: mobile ? -1.5 : -4,
        duration: 1,
        ease: 'none',
      }, 0)
      timeline.to(subjectMotion, {
        scale: mobile ? 1.025 : 1.045,
        y: mobile ? -9 : -24,
        z: mobile ? 18 : 34,
        rotationY: mobile ? 1.5 : 3.5,
        rotationX: mobile ? -0.8 : -2.5,
        opacity: 0.98,
        duration: 0.59,
        ease: 'none',
      }, 0)

      const quickX = parallaxNodes.map((node, index) => gsap.quickTo(node, 'x', {
        duration: 0.55,
        ease: 'power3.out',
        onUpdate: () => {
          if (hoveredCardIndexRef.current === index) positionHoverLabel(index)
        },
      }))
      const quickY = parallaxNodes.map((node, index) => gsap.quickTo(node, 'y', {
        duration: 0.55,
        ease: 'power3.out',
        onUpdate: () => {
          if (hoveredCardIndexRef.current === index) positionHoverLabel(index)
        },
      }))
      const subjectX = gsap.quickTo(subjectParallax, 'x', { duration: 0.6, ease: 'power3.out' })
      const subjectY = gsap.quickTo(subjectParallax, 'y', { duration: 0.6, ease: 'power3.out' })
      const cameraX = gsap.quickTo(camera, 'rotationY', {
        duration: 0.6,
        ease: 'power3.out',
        onUpdate: () => positionHoverLabel(),
      })
      const cameraY = gsap.quickTo(camera, 'rotationX', {
        duration: 0.6,
        ease: 'power3.out',
        onUpdate: () => positionHoverLabel(),
      })

      let pointerFrame = 0
      let latestPointer = null
      const updatePointer = () => {
        pointerFrame = 0
        if (!latestPointer) return
        const { clientX, clientY } = latestPointer
        const bounds = sceneRef.current.getBoundingClientRect()
        const nx = (clientX - bounds.left) / bounds.width - 0.5
        const ny = (clientY - bounds.top) / bounds.height - 0.5

        subjectX(nx * 12)
        subjectY(ny * 12)
        if (!reducedMotion && subjectGazeRef.current) {
          const dx = (clientX - (bounds.left + bounds.width * 0.5)) / (bounds.width * 0.28)
          const dy = (clientY - (bounds.top + bounds.height * 0.4)) / (bounds.height * 0.25)
          const strengthX = Math.abs(dx)
          const strengthY = Math.abs(dy)
          let direction = 'center'
          if (Math.max(strengthX, strengthY) >= 0.2) {
            if (strengthX > strengthY) direction = dx < 0 ? 'left' : 'right'
            else direction = dy < 0 ? 'up' : 'down'
          }
          setSubjectGaze(direction)
        }
        cameraX(nx * (mobile ? 2.5 : 7))
        cameraY(ny * (mobile ? -1.8 : -5))
        parallaxNodes.forEach((_, index) => {
          const pose = getCardPose(index, getSpiralProgress(), width, height, mobile, orbitState.rotation)
          const depthSpan = mobile ? 350 : 960
          const depthWeight = 0.55 + clamp((pose.z + depthSpan / 2) / depthSpan, 0, 1) * 0.8
          quickX[index](nx * (mobile ? 3 : 12) * depthWeight)
          quickY[index](ny * (mobile ? 3 : 10) * depthWeight)
        })
      }
      const onPointerMove = (event) => {
        if (mobile || event.pointerType === 'touch') return
        latestPointer = { clientX: event.clientX, clientY: event.clientY }
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updatePointer)
      }
      const onPointerLeave = () => {
        latestPointer = null
        if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
        pointerFrame = 0
        subjectX(0)
        subjectY(0)
        setSubjectGaze('center')
        cameraX(0)
        cameraY(0)
        quickX.forEach((toX) => toX(0))
        quickY.forEach((toY) => toY(0))
      }
      const onPageScroll = () => {
        if (scrollState.progress >= GAZE_SCROLL_CUTOFF) {
          setSubjectGaze('center')
        }
      }

      sceneRef.current.addEventListener('pointermove', onPointerMove, { passive: true })
      sceneRef.current.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('scroll', onPageScroll, { passive: true })

      const onResize = () => {
        width = sceneRef.current?.clientWidth || window.innerWidth
        height = sceneRef.current?.clientHeight || window.innerHeight
        syncBackdropDimensions()
        if (!mobile) ScrollTrigger.refresh()
        renderSpiral(getSpiralProgress())
      }
      window.addEventListener('resize', onResize, { passive: true })

      const enterHandlers = []
      const leaveHandlers = []
      if (!mobile) {
        faceNodes.forEach((face, index) => {
          const onEnter = () => {
            hoveredCardIndexRef.current = index
            setHoveredCard(cards[index])
            syncMotionActivity(scrollState.progress)
            positionHoverLabel(index)
            gsap.to(face, {
              scale: 1.06,
              z: 26,
              rotationZ: -getCardPose(index, getSpiralProgress(), width, height, mobile, orbitState.rotation).rotation * 0.82,
              duration: 0.3,
              ease: 'power3.out',
              overwrite: 'auto',
              onUpdate: () => positionHoverLabel(index),
            })
          }
          const onLeave = () => {
            if (hoveredCardIndexRef.current !== index) return
            hoveredCardIndexRef.current = null
            setHoveredCard(null)
            syncMotionActivity(scrollState.progress)
            gsap.to(face, {
              scale: 1,
              z: 0,
              rotationZ: 0,
              duration: 0.36,
              ease: 'power3.out',
              overwrite: 'auto',
            })
          }
          face.addEventListener('pointerenter', onEnter)
          face.addEventListener('pointerleave', onLeave)
          enterHandlers.push(onEnter)
          leaveHandlers.push(onLeave)
        })
      }

      ScrollTrigger.refresh()

      return () => {
        setSubjectGaze('center')
        if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
        videoVisibilityObserver?.disconnect()
        document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
        cardVideoRefs.current.forEach((video) => video?.pause())
        sceneRef.current?.removeEventListener('pointermove', onPointerMove)
        sceneRef.current?.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('scroll', onPageScroll)
        window.removeEventListener('resize', onResize)
        faceNodes.forEach((face, index) => {
          face.removeEventListener('pointerenter', enterHandlers[index])
          face.removeEventListener('pointerleave', leaveHandlers[index])
        })
      }
    })

    return () => {
      publishHeroIslandState(false)
      media.revert()
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className={styles.hero} aria-label="Hero">
      <div ref={sceneRef} className={styles.scene}>
        <div ref={backdropRef} className={styles.backdrop} aria-hidden="true">
          <div className={styles.backdropArtwork} />
          <div className={styles.backdropShade} />
        </div>
        <div ref={worldRef} className={styles.world}>
          <div ref={cameraRef} className={styles.camera}>
            <div className={styles.glow} aria-hidden="true" />
            {cards.map(({ src, poster, type }, index) => (
              <div
                className={styles.cardMotion}
                key={`${src}-${index}`}
                data-card-index={index}
                ref={(node) => { cardRefs.current[index] = node }}
                aria-hidden="true"
              >
                <div
                  className={styles.cardIdle}
                  ref={(node) => { idleRefs.current[index] = node }}
                >
                  <div
                    className={styles.cardParallax}
                    ref={(node) => { parallaxRefs.current[index] = node }}
                  >
                    <div
                      className={styles.cardFace}
                      ref={(node) => { faceRefs.current[index] = node }}
                    >
                      {[false, true].map((reverse) => (
                        <div
                          className={`${styles.cardSurface} ${reverse ? styles.cardReverse : ''}`}
                          key={reverse ? `${src}-reverse` : src}
                        >
                          {type === 'video' && !reverse ? (
                            <video
                              ref={(node) => { cardVideoRefs.current[index] = node }}
                              src={src}
                              poster={poster}
                              loop
                              muted
                              playsInline
                              preload="none"
                            />
                          ) : (
                            <img
                              src={type === 'video' ? poster : src}
                              alt={reverse ? '' : `Selected work ${index + 1}`}
                              loading="lazy"
                              decoding="async"
                              draggable="false"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={subjectMotionRef} className={styles.subjectMotion}>
              <div ref={subjectIdleRef} className={styles.subjectIdle}>
                <div ref={subjectParallaxRef} className={styles.subjectParallax}>
                  <img
                    className={styles.subject}
                    src="/bgt1.png"
                    alt="Portrait"
                    draggable="false"
                    fetchPriority="high"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                  <svg
                    ref={subjectGazeRef}
                    className={styles.subjectGaze}
                    viewBox="0 0 1654 951"
                    data-gaze="center"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <defs>
                      <radialGradient id={gazeFeatherId} cx="50%" cy="50%" r="50%">
                        <stop offset="0.76" stopColor="white" />
                        <stop offset="1" stopColor="black" />
                      </radialGradient>
                      <mask
                        id={gazeMaskId}
                        maskUnits="userSpaceOnUse"
                        maskContentUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="1654"
                        height="951"
                      >
                        <rect width="1654" height="951" fill="black" />
                        <ellipse cx="772" cy="226" rx="22" ry="16" fill={`url(#${gazeFeatherId})`} />
                        <ellipse cx="876" cy="226" rx="22" ry="16" fill={`url(#${gazeFeatherId})`} />
                      </mask>
                    </defs>
                    {['left', 'right', 'up', 'down'].map((direction) => (
                      <image
                        key={direction}
                        className={styles.subjectGazeVariant}
                        data-gaze-direction={direction}
                        href={`/bgt1-gaze-${direction}.png`}
                        x="730"
                        y="185"
                        width="190"
                        height="80"
                        preserveAspectRatio="none"
                        mask={`url(#${gazeMaskId})`}
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.vignette} aria-hidden="true" />
        <div ref={lowerMaskRef} className={styles.lowerMask} aria-hidden="true" />
        <div ref={scrollPromptRef} className={styles.scrollPrompt}>
          <p className={styles.downloadEyebrow}>Make every recording go further</p>
          <h1 className={styles.downloadHeading}>
            {previousHeadlineIndex !== null && (
              <span
                key={`leaving-${previousHeadlineIndex}`}
                className={styles.downloadHeadingLeaving}
                aria-hidden="true"
              >
                {heroHeadlines[previousHeadlineIndex].split(' ').map((word, index, words) => (
                  <span
                    className={styles.downloadHeadingWord}
                    key={`${word}-${index}`}
                    style={{ animationDelay: `${(words.length - index - 1) * 80}ms` }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            )}
            <span
              key={`active-${headlineIndex}-${isHeadlinePromptActive}`}
              className={`${styles.downloadHeadingEntering} ${isHeadlinePromptActive ? styles.downloadHeadingAnimating : ''}`}
            >
              {heroHeadlines[headlineIndex].split(' ').map((word, index) => (
                <span
                  className={styles.downloadHeadingWord}
                  key={`${word}-${index}`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {word}
                </span>
              ))}
            </span>
          </h1>
          <a className={styles.downloadButton} href={downloadUrl}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3h14v-3" /></svg>
            Download for Mac
          </a>
          <p className={styles.keepScrolling}>Keep scrolling to see Cutly in action <span aria-hidden="true">↓</span></p>
        </div>
        <div ref={videoStageRef} className={styles.videoStage}>
          <video
            ref={videoRef}
            className={`${styles.demoVideo} ${isVideoPlaying ? styles.demoVideoPlaying : ''}`}
            controls={isVideoPlaying}
            playsInline
            preload="metadata"
            aria-label="Cutly product demo"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            onEnded={() => setIsVideoPlaying(false)}
          >
            <source src="/app-shots/demo-video.mp4" type="video/mp4" />
            Your browser does not support MP4 video playback.
          </video>
          <div className={`${styles.videoContent} ${isVideoPlaying ? styles.videoContentPlaying : ''}`}>
            <div ref={videoPromptRef} className={styles.videoHeading}>
              <p>Cutly in action</p>
              <h2>See a full recording become<br className={styles.desktopBreak} /> share-ready clips.</h2>
            </div>
            <div ref={playPromptRef} className={styles.playPrompt}>
              <button
                className={`${styles.playButton} ${isVideoPlaying ? styles.playButtonHidden : ''}`}
                type="button"
                aria-label="Play Cutly product demo"
                onClick={() => videoRef.current?.play().catch(() => {})}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.5 4.9c0-.78.86-1.25 1.52-.82l10.1 6.6a1.56 1.56 0 0 1 0 2.62l-10.1 6.6a1 1 0 0 1-1.52-.82V4.9Z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={hoverLabelRef}
        className={`${styles.projectLabel} ${hoveredCard ? styles.projectLabelVisible : ''}`}
        aria-hidden="true"
      >
        <span className={styles.projectLabelMeta}>
          <span className={styles.projectLabelDot} />
          <span className={styles.projectCategory}>{hoveredCard?.category}</span>
        </span>
        <span className={styles.projectTitle}>{hoveredCard?.title}</span>
      </div>
    </section>
  )
}
