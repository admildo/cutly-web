'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import styles from './HeroSpiral.module.css'
import { ScrollPaperMedia } from './ScrollPaperMedia'
import { useHeroVideoTiles } from './useHeroVideoTiles'
import { getPortraitOrbitRadius } from '../../../lib/hero-orbit.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Choose 'spiral' or 'rings' here to change the hero's card layout.
const HERO_CARD_MODE = 'spiral'
const HERO_MOUSE_EFFECTS = true

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
  category: type === 'video' ? 'videos' : 'images',
}))

const NAV_ISLAND_EVENT = 'cutly:hero-island-state'
const PROMPT_REVEAL_START = 0.38
const PROMPT_REVEAL_DURATION = 0.1
const PROMPT_HEADLINE_START = PROMPT_REVEAL_START + PROMPT_REVEAL_DURATION
const PROMPT_REVEAL_END = 0.62
const NAV_ISLAND_REVEAL_FRACTION = 0.5
const GAZE_SCROLL_CUTOFF = 0.5
const GAZE_EYES = [
  { cx: 772, cy: 226, sourceX: 42, sourceY: 41 },
  { cx: 876, cy: 226, sourceX: 146, sourceY: 41 },
]
// Register the eye corners to the portrait; generated crops can differ between poses.
const GAZE_REGISTRATION = {
  'slight-right': [
    { sourceX: 38, sourceY: 35, scale: 1.1 },
    { sourceX: 134, sourceY: 35, scale: 1.1 },
  ],
  'up-left': [
    { sourceX: 34, sourceY: 34, scale: 1.16 },
    { sourceX: 120, sourceY: 34, scale: 1.16 },
  ],
  'up-right': [
    { sourceX: 46, sourceY: 41, scale: 1 },
    { sourceX: 148, sourceY: 41, scale: 1 },
  ],
}
const CARD_FADE_START = 0.58
const CARD_FADE_END = 0.68
const heroHeadlines = [
  'Turn long videos into clips.',
  'Find strong moments with AI.',
  'Add captions and portrait framing.',
  'Export from one desktop app.',
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
  const rings = HERO_CARD_MODE === 'rings'
  const cardsPerRing = Math.ceil(cards.length / 3)
  const ringIndex = Math.floor(index / cardsPerRing)
  const ringCardCount = Math.min(cardsPerRing, cards.length - ringIndex * cardsPerRing)
  const angle = rings
    ? 2.7 + (index % cardsPerRing) / ringCardCount * Math.PI * 2 + ringIndex * Math.PI / cardsPerRing
    : 2.7 + position * Math.PI * 6
  const travel = progress
  const orbitDirection = rings && ringIndex === 1 ? -1 : 1
  const theta = angle + (orbitRotation + travel * Math.PI * 1.7) * orbitDirection
  const baseRadiusX = width * (mobile ? (rings ? 0.43 : 0.42) : (rings ? 0.35 : 0.31))
  // Keep a consistent pitch between turns, with the ends outside the viewport.
  const verticalSpan = height * (mobile ? 1.9 : 2.35)
  const radiusZ = mobile ? Math.min(width * 0.42, 190) : Math.min(width * 0.28, 440)
  const ringY = (ringIndex - 1) * height * (mobile ? 0.4 : 0.65)
    + (ringIndex === 1 ? height * (mobile ? 0.08 : 0.12) : 0)
  const baseY = rings ? ringY : (position - 0.5) * verticalSpan
  const y = baseY - travel * height * 0.36 + (mobile ? height * 0.04 : 0)
  const radiusX = getPortraitOrbitRadius(y, width, height, mobile, baseRadiusX)
  const x = Math.cos(theta) * radiusX
  const z = Math.sin(theta) * radiusZ
  const frontDepth = (Math.sin(theta) + 1) / 2
  const scale = 0.9 + frontDepth * 0.12
  const rotation = Math.sin(theta + 0.3) * 2
  const rotationY = 90 - theta * (180 / Math.PI)
  const rotationX = Math.cos(theta) * 3
  // Opaque cards retain their 3D surfaces and pass naturally in front of/behind
  // the portrait. Fading at the face both breaks the helix and flattens the tile.
  const depthOpacity = 1

  return { x, y, z, scale, rotation, rotationX, rotationY, opacity: depthOpacity }
}

export function HeroSpiral({ downloadUrl = '/download' }) {
  const videoTilesEnabled = useHeroVideoTiles()
  const gazeId = useId().replace(/:/g, '')
  const gazeFeatherId = `hero-gaze-feather-${gazeId}`
  const gazeMaskId = `hero-gaze-eye-mask-${gazeId}`
  const [hoveredCard, setHoveredCard] = useState(null)
  const [isCardHovered, setIsCardHovered] = useState(false)
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
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const cursorRingRef = useRef(null)
  const hoveredCardIndexRef = useRef(null)
  const subjectGazeRef = useRef(null)
  const headlineIndexRef = useRef(0)
  const headlinePromptActiveRef = useRef(false)
  const cardRefs = useRef([])
  const cardBendRefs = useRef([])
  const paperMediaRefs = useRef([])
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
      finePointer: '(hover: hover) and (pointer: fine)',
    }, ({ conditions }) => {
      const mobile = conditions.mobile
      const reducedMotion = conditions.reducedMotion
      const mouseEffects = HERO_MOUSE_EFFECTS && conditions.finePointer && !mobile && !reducedMotion
      let width = sceneRef.current.clientWidth
      let height = sceneRef.current.clientHeight
      const cardNodes = cardRefs.current.filter(Boolean)
      const bendNodes = cardBendRefs.current.filter(Boolean)
      const idleNodes = idleRefs.current.filter(Boolean)
      const parallaxNodes = parallaxRefs.current.filter(Boolean)
      const faceNodes = faceRefs.current.filter(Boolean)
      const subjectMotion = subjectMotionRef.current
      const subjectIdle = subjectIdleRef.current
      const subjectParallax = subjectParallaxRef.current
      const world = worldRef.current
      const camera = cameraRef.current
      const cursor = cursorRef.current
      sceneRef.current.dataset.mouseEffects = String(mouseEffects)
      const scrollState = { progress: 0 }
      const orbitState = { rotation: 0 }
      const pointerPosition = { x: width / 2, y: height / 2 }
      let sceneVisible = true
      let paperResourcesActive = true
      const visibleCardIndices = new Set()
      let pointerActive = false
      let resetPointerEffects = () => {}
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
      const getCardProgress = () => clamp(scrollState.progress / 0.52, 0, 1)
      const bendTiltSetters = bendNodes.map((node) => gsap.quickSetter(node, 'rotationX', 'deg'))
      const bendStates = bendNodes.map(() => ({ amount: 0 }))
      const bendCardTo = bendStates.map((state, index) => gsap.quickTo(state, 'amount', {
        duration: 0.2 + (index % 4) * 0.025,
        ease: 'power2.out',
        onUpdate: () => {
          paperMediaRefs.current[index]?.setBend(state.amount)
          bendTiltSetters[index](state.amount * 5)
        },
      }))
      let bendSettleCall = null
      const applyScrollBend = (velocity) => {
        if (reducedMotion || Math.abs(velocity) < 12) return

        // Small scrolls stay subtle; flicks produce a pronounced elastic bow.
        const intensity = clamp(Math.abs(velocity) / (mobile ? 1600 : 2200), 0, 1)
        const bend = Math.sign(velocity) * intensity
        bendCardTo.forEach((quickBend, index) => {
          if (!sceneVisible || !visibleCardIndices.has(index)) return
          quickBend.tween.duration(0.2 + (index % 4) * 0.025)
          quickBend(bend * (0.86 + (index % 5) * 0.035))
        })

        bendSettleCall?.kill()
        bendSettleCall = gsap.delayedCall(0.18, () => {
          bendCardTo.forEach((quickBend, index) => {
            quickBend.tween.duration(0.65 + (index % 4) * 0.035)
            quickBend(0)
          })
        })
      }
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
          && (mobile || progress >= PROMPT_HEADLINE_START)
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

      gsap.set(hoverLabelRef.current, { xPercent: -50, yPercent: -50 })
      const labelX = gsap.quickTo(hoverLabelRef.current, 'x', { duration: 0.28, ease: 'power3.out' })
      const labelY = gsap.quickTo(hoverLabelRef.current, 'y', { duration: 0.28, ease: 'power3.out' })
      const positionHoverLabel = (index = hoveredCardIndexRef.current, snap = false) => {
        if (index === null) return
        const label = hoverLabelRef.current
        if (!label) return

        const halfLabelWidth = label.offsetWidth / 2 || 90
        const halfLabelHeight = label.offsetHeight / 2 || 30
        const labelGap = 24
        const canPlaceRight = pointerPosition.x + label.offsetWidth + labelGap <= window.innerWidth - 12
        const centerX = canPlaceRight
          ? pointerPosition.x + halfLabelWidth + labelGap
          : pointerPosition.x - halfLabelWidth - labelGap
        const x = clamp(centerX, halfLabelWidth + 12, window.innerWidth - halfLabelWidth - 12)
        const y = clamp(pointerPosition.y, halfLabelHeight + 12, window.innerHeight - halfLabelHeight - 12)
        if (snap) gsap.set(label, { x, y })
        labelX(x)
        labelY(y)
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

      const renderCards = (progress, sceneProgress = scrollState.progress) => {
        const videoCandidates = []
        cardNodes.forEach((node, index) => {
          const pose = getCardPose(index, progress, width, height, mobile, orbitState.rotation)
          const projection = (mobile ? 820 : 1120) / ((mobile ? 820 : 1120) - pose.z)
          const margin = mobile ? 120 : 260
          const inView = sceneVisible && sceneProgress < CARD_FADE_END
            && Math.abs(pose.x * projection) < width / 2 + margin
            && Math.abs(pose.y * projection) < height / 2 + margin
          if (!inView) {
            visibleCardIndices.delete(index)
            node.dataset.inView = 'false'
            node.style.visibility = 'hidden'
            if (cardVideoRefs.current[index]) syncCardVideo(cardVideoRefs.current[index], false)
            return
          }
          visibleCardIndices.add(index)
          node.dataset.inView = 'true'
          node.style.transform = `translate(-50%, -50%) translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) rotateY(${pose.rotationY}deg) rotateX(${pose.rotationX}deg) rotateZ(${pose.rotation}deg) scale(${pose.scale})`
          const renderedOpacity = pose.opacity * (1 - smoothstep(CARD_FADE_START, CARD_FADE_END, sceneProgress))
          node.style.opacity = renderedOpacity
          node.style.visibility = sceneProgress >= CARD_FADE_END ? 'hidden' : 'visible'
          node.style.pointerEvents = mobile || sceneProgress >= CARD_FADE_START ? 'none' : 'auto'
          const video = cardVideoRefs.current[index]
          const isVisible = canObserveVideoCards
            ? visibleVideoCards.has(index)
            : Math.abs(pose.x) < width * 0.62 && Math.abs(pose.y) < height * 0.62
          const facesCamera = Math.cos(pose.rotationY * (Math.PI / 180)) > 0.35
          if (video && isVisible && facesCamera && renderedOpacity > 0.02 && !document.hidden) {
            videoCandidates.push(index)
          }
        })

        // Keep mobile decoder work bounded; remaining tiles show their posters.
        // IntersectionObserver keeps offscreen videos paused on all devices.
        const playingVideoCards = new Set(mobile ? videoCandidates.slice(0, 2) : videoCandidates)
        cardVideoRefs.current.forEach((video, index) => syncCardVideo(video, playingVideoCards.has(index)))
        positionHoverLabel()
      }

      let cardFrame = 0
      const scheduleCards = () => {
        if (cardFrame) return
        cardFrame = window.requestAnimationFrame(() => {
          cardFrame = 0
          renderCards(getCardProgress())
        })
      }
      syncBackdropDimensions()
      renderCards(0)
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

          if (visibilityChanged) scheduleCards()
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
        renderCards(0)
      }

      const orbitTween = reducedMotion ? null : gsap.to(orbitState, {
        rotation: Math.PI * 2,
        duration: mobile ? 40 : 52,
        repeat: -1,
        ease: 'none',
        onUpdate: scheduleCards,
      })
      const idleTweens = reducedMotion || mobile ? [] : idleNodes.map((node, index) => gsap.to(node, {
        y: index % 2 === 0 ? -2 : 2,
        rotationY: index % 2 === 0 ? 0.4 : -0.4,
        duration: 8 + (index % 5) * 0.65,
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
        if (pointerActive && (document.hidden || progress >= CARD_FADE_START)) resetPointerEffects()
        const sceneActive = sceneVisible && !document.hidden && progress < CARD_FADE_END
        sceneRef.current.dataset.sceneActive = String(sceneActive)
        if (!sceneActive && paperResourcesActive) {
          paperResourcesActive = false
          bendSettleCall?.kill()
          bendCardTo.forEach((quickBend, index) => {
            quickBend.tween.pause()
            bendStates[index].amount = 0
            bendTiltSetters[index](0)
          })
          paperMediaRefs.current.forEach((paper) => paper?.release())
        } else if (sceneActive) {
          paperResourcesActive = true
        }
        const shouldAnimate = !reducedMotion && sceneActive
        if (shouldAnimate !== ambientMotionActive) {
          ambientMotionActive = shouldAnimate
          idleTweens.forEach((tween) => (shouldAnimate ? tween.resume() : tween.pause()))
          if (shouldAnimate) subjectIdleTween?.resume()
          else subjectIdleTween?.pause()
        }

        const shouldOrbit = shouldAnimate && (!mouseEffects || hoveredCardIndexRef.current === null)
        if (shouldOrbit !== orbitActive) {
          orbitActive = shouldOrbit
          if (shouldOrbit) orbitTween?.resume()
          else orbitTween?.pause()
        }
      }

      const onDocumentVisibilityChange = () => {
        syncMotionActivity()
        renderCards(getCardProgress())
      }
      const sceneObserver = new IntersectionObserver(([entry]) => {
        sceneVisible = entry.isIntersecting
        syncMotionActivity()
        if (!sceneVisible) videoRef.current?.pause()
        scheduleCards()
      })
      sceneObserver.observe(sceneRef.current)
      document.addEventListener('visibilitychange', onDocumentVisibilityChange)
      window.addEventListener('pageshow', onDocumentVisibilityChange)
      syncMotionActivity()

      const timeline = gsap.timeline({
        onUpdate: () => {
          updateNavigationIsland(scrollState.progress)
          syncMotionActivity(scrollState.progress)
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${mobile
            ? Math.max(1, sectionRef.current.offsetHeight - sceneRef.current.offsetHeight)
            : window.innerHeight * 2.8}`,
          pin: mobile ? false : sceneRef.current,
          pinSpacing: !mobile,
          scrub: 0.35,
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
        onUpdate: scheduleCards,
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
        scaleY: mobile ? 1 : 0,
      }, {
        scaleY: 1,
        duration: 0.36,
        ease: 'power2.inOut',
      }, 0.16)
      timeline.fromTo(scrollPromptRef.current, {
        autoAlpha: mobile ? 1 : 0,
        y: mobile ? 0 : 18,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: PROMPT_REVEAL_DURATION,
        ease: 'power2.out',
      }, mobile ? 0 : PROMPT_REVEAL_START)
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
        y: () => -height * (mobile ? 0.12 : 0.15),
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
      }, mobile ? 0.73 : 0.79)
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
      }, mobile ? 0.78 : 0.84)
      timeline.to(world, {
        rotationY: mobile ? 8 : 16,
        rotationX: mobile ? -1.5 : -4,
        duration: 1,
        ease: 'none',
      }, 0)
      timeline.to(subjectMotion, {
        scale: mobile ? 1.025 : 1.045,
        y: mobile ? -9 : -24,
        // Keep the portrait on the orbit axis. Tilting its wide image plane
        // through side tiles creates visibly sliced cards as scroll changes.
        z: 0,
        rotationY: 0,
        rotationX: 0,
        opacity: 1,
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
      const hoverTiltX = faceNodes.map((node) => gsap.quickTo(node, 'rotationX', { duration: 0.35, ease: 'power3.out' }))
      const hoverTiltY = faceNodes.map((node) => gsap.quickTo(node, 'rotationY', { duration: 0.35, ease: 'power3.out' }))
      gsap.set([cursorDotRef.current, cursorRingRef.current], { xPercent: -50, yPercent: -50 })
      const cursorDotX = gsap.quickTo(cursorDotRef.current, 'x', { duration: 0.08, ease: 'power2.out' })
      const cursorDotY = gsap.quickTo(cursorDotRef.current, 'y', { duration: 0.08, ease: 'power2.out' })
      const cursorRingX = gsap.quickTo(cursorRingRef.current, 'x', { duration: 0.35, ease: 'power3.out' })
      const cursorRingY = gsap.quickTo(cursorRingRef.current, 'y', { duration: 0.35, ease: 'power3.out' })
      const clearHoveredCard = () => {
        const index = hoveredCardIndexRef.current
        if (index === null) return
        hoveredCardIndexRef.current = null
        setIsCardHovered(false)
        hoverTiltX[index](0)
        hoverTiltY[index](0)
        cursor.dataset.hovered = 'false'
        gsap.to(faceNodes[index], {
          scale: 1,
          z: 0,
          rotationZ: 0,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        })
        syncMotionActivity(scrollState.progress)
      }

      let pointerFrame = 0
      let latestPointer = null
      const updatePointer = () => {
        pointerFrame = 0
        if (!latestPointer) return
        const { clientX, clientY, overControl } = latestPointer
        pointerPosition.x = clientX
        pointerPosition.y = clientY
        const bounds = sceneRef.current.getBoundingClientRect()
        const nx = clamp((clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5)
        const ny = clamp((clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5)

        if (!pointerActive) {
          gsap.set([cursorDotRef.current, cursorRingRef.current], { x: clientX, y: clientY })
          pointerActive = true
        }
        cursor.dataset.active = String(!overControl)
        sceneRef.current.dataset.pointerActive = String(!overControl)
        cursorDotX(clientX)
        cursorDotY(clientY)
        cursorRingX(clientX)
        cursorRingY(clientY)
        subjectX(nx * 10)
        subjectY(ny * 8)
        if (!reducedMotion && subjectGazeRef.current) {
          const dx = (clientX - (bounds.left + bounds.width * 0.5)) / (bounds.width * 0.28)
          const dy = (clientY - (bounds.top + bounds.height * 0.4)) / (bounds.height * 0.25)
          const strengthX = Math.abs(dx)
          const strengthY = Math.abs(dy)
          let direction = 'center'
          const strength = Math.max(strengthX, strengthY)
          if (strength >= 0.2) {
            const isDiagonal = strength >= 0.5 && Math.min(strengthX, strengthY) >= strength * 0.42
            if (isDiagonal) {
              direction = dy < 0
                ? (dx < 0 ? 'up-left' : 'up-right')
                : (dx < 0 ? 'down-left' : 'down-right')
            } else {
              const cardinalDirection = strengthX > strengthY
                ? (dx < 0 ? 'left' : 'right')
                : (dy < 0 ? 'up' : 'down')
              direction = strength < 0.68 ? `slight-${cardinalDirection}` : cardinalDirection
            }
          }
          setSubjectGaze(direction)
        }
        cameraX(nx * 12)
        cameraY(ny * -8)
        parallaxNodes.forEach((_, index) => {
          const pose = getCardPose(index, getCardProgress(), width, height, mobile, orbitState.rotation)
          const depthWeight = 0.45 + clamp((pose.z + 440) / 880, 0, 1) * 0.9
          quickX[index](nx * 28 * depthWeight)
          quickY[index](ny * 20 * depthWeight)
        })
        const hoveredIndex = hoveredCardIndexRef.current
        if (hoveredIndex !== null) {
          const cardBounds = faceNodes[hoveredIndex].getBoundingClientRect()
          const cardX = clamp((clientX - cardBounds.left) / Math.max(1, cardBounds.width) - 0.5, -0.5, 0.5)
          const cardY = clamp((clientY - cardBounds.top) / Math.max(1, cardBounds.height) - 0.5, -0.5, 0.5)
          hoverTiltX[hoveredIndex](-cardY * 12)
          hoverTiltY[hoveredIndex](cardX * 14)
          positionHoverLabel(hoveredIndex)
        }
      }
      const onPointerMove = (event) => {
        if (!mouseEffects || event.pointerType === 'touch' || scrollState.progress >= CARD_FADE_START) return
        latestPointer = {
          clientX: event.clientX,
          clientY: event.clientY,
          overControl: Boolean(event.target.closest('a, button, input, video[controls]')),
        }
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updatePointer)
      }
      const onPointerLeave = () => {
        pointerActive = false
        latestPointer = null
        cursor.dataset.active = 'false'
        sceneRef.current.dataset.pointerActive = 'false'
        if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
        pointerFrame = 0
        subjectX(0)
        subjectY(0)
        setSubjectGaze('center')
        cameraX(0)
        cameraY(0)
        quickX.forEach((toX) => toX(0))
        quickY.forEach((toY) => toY(0))
        clearHoveredCard()
      }
      resetPointerEffects = onPointerLeave
      let lastScrollY = window.scrollY
      let lastScrollTime = performance.now()
      const onPageScroll = () => {
        const now = performance.now()
        const delta = window.scrollY - lastScrollY
        const velocity = delta * 1000 / Math.max(16, Math.min(100, now - lastScrollTime))
        lastScrollY = window.scrollY
        lastScrollTime = now
        if (scrollState.progress < CARD_FADE_END) applyScrollBend(velocity)
        if (scrollState.progress >= GAZE_SCROLL_CUTOFF) {
          setSubjectGaze('center')
        }
      }

      sceneRef.current.addEventListener('pointermove', onPointerMove, { passive: true })
      sceneRef.current.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('scroll', onPageScroll, { passive: true })

      const onResize = () => {
        const nextWidth = sceneRef.current.clientWidth
        const nextHeight = sceneRef.current.clientHeight
        // Mobile browser bars can resize the viewport without resizing the svh scene.
        if (nextWidth === width && nextHeight === height) return
        width = nextWidth
        height = nextHeight
        syncBackdropDimensions()
        ScrollTrigger.refresh()
        renderCards(getCardProgress())
      }
      window.addEventListener('resize', onResize, { passive: true })

      const enterHandlers = []
      const leaveHandlers = []
      if (mouseEffects) {
        faceNodes.forEach((face, index) => {
          const onEnter = (event) => {
            if (scrollState.progress >= CARD_FADE_START) return
            pointerPosition.x = event.clientX
            pointerPosition.y = event.clientY
            clearHoveredCard()
            hoveredCardIndexRef.current = index
            setHoveredCard(cards[index])
            setIsCardHovered(true)
            cursor.dataset.hovered = 'true'
            syncMotionActivity(scrollState.progress)
            positionHoverLabel(index, true)
            gsap.to(face, {
              scale: 1.045,
              z: 24,
              rotationZ: -getCardPose(index, getCardProgress(), width, height, mobile, orbitState.rotation).rotation * 0.82,
              duration: 0.42,
              ease: 'power3.out',
              overwrite: 'auto',
              onUpdate: () => positionHoverLabel(index),
            })
          }
          const onLeave = () => {
            if (hoveredCardIndexRef.current !== index) return
            clearHoveredCard()
          }
          face.addEventListener('pointerenter', onEnter)
          face.addEventListener('pointerleave', onLeave)
          enterHandlers.push(onEnter)
          leaveHandlers.push(onLeave)
        })
      }

      ScrollTrigger.refresh()

      return () => {
        cursor.dataset.active = 'false'
        cursor.dataset.hovered = 'false'
        delete sceneRef.current?.dataset.mouseEffects
        delete sceneRef.current?.dataset.pointerActive
        hoveredCardIndexRef.current = null
        setHoveredCard(null)
        setIsCardHovered(false)
        setSubjectGaze('center')
        bendSettleCall?.kill()
        paperMediaRefs.current.forEach((paper) => paper?.setBend(0))
        if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
        if (cardFrame) window.cancelAnimationFrame(cardFrame)
        sceneObserver.disconnect()
        delete sceneRef.current?.dataset.sceneActive
        videoVisibilityObserver?.disconnect()
        document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
        window.removeEventListener('pageshow', onDocumentVisibilityChange)
        cardVideoRefs.current.forEach((video) => video?.pause())
        sceneRef.current?.removeEventListener('pointermove', onPointerMove)
        sceneRef.current?.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('scroll', onPageScroll)
        window.removeEventListener('resize', onResize)
        faceNodes.forEach((face, index) => {
          if (enterHandlers[index]) face.removeEventListener('pointerenter', enterHandlers[index])
          if (leaveHandlers[index]) face.removeEventListener('pointerleave', leaveHandlers[index])
        })
      }
    })

    return () => {
      publishHeroIslandState(false)
      media.revert()
    }
  }, { scope: sectionRef, dependencies: [videoTilesEnabled], revertOnUpdate: true })

  return (
    <section ref={sectionRef} className={styles.hero} aria-label="Hero" data-hero-mode={HERO_CARD_MODE}>
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
                      className={styles.cardBend}
                      ref={(node) => { cardBendRefs.current[index] = node }}
                    >
                      <div
                        className={styles.cardFace}
                        ref={(node) => { faceRefs.current[index] = node }}
                      >
                        <ScrollPaperMedia
                          ref={(handle) => { paperMediaRefs.current[index] = handle }}
                          src={type === 'video' && !videoTilesEnabled ? poster : src}
                          poster={poster}
                          type={videoTilesEnabled ? type : 'image'}
                          videoRef={() => cardVideoRefs.current[index]}
                        >
                        {[false, true].map((reverse) => (
                          <div
                            className={`${styles.cardSurface} ${reverse ? styles.cardReverse : ''}`}
                            key={reverse ? `${src}-reverse` : src}
                          >
                            {type === 'video' && videoTilesEnabled && !reverse ? (
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
                                alt={reverse ? '' : `Work with ${index + 1}`}
                                loading="lazy"
                                decoding="async"
                                draggable="false"
                              />
                            )}
                          </div>
                        ))}
                        </ScrollPaperMedia>
                      </div>
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
                        <stop offset="0.9" stopColor="white" />
                        <stop offset="1" stopColor="black" />
                      </radialGradient>
                      {GAZE_EYES.map((eye, eyeIndex) => (
                        <mask
                          key={eyeIndex}
                          id={`${gazeMaskId}-${eyeIndex}`}
                          maskUnits="userSpaceOnUse"
                          maskContentUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="1654"
                          height="951"
                        >
                          <rect width="1654" height="951" fill="black" />
                          <ellipse cx={eye.cx} cy={eye.cy} rx="29" ry="18" fill={`url(#${gazeFeatherId})`} />
                        </mask>
                      ))}
                    </defs>
                    {[
                      'left',
                      'right',
                      'up',
                      'down',
                      'slight-left',
                      'slight-right',
                      'slight-up',
                      'slight-down',
                      'up-left',
                      'up-right',
                      'down-left',
                      'down-right',
                    ].map((direction) => (
                      <g
                        key={direction}
                        className={styles.subjectGazeVariant}
                        data-gaze-direction={direction}
                      >
                        {GAZE_EYES.map((eye, eyeIndex) => {
                          const registration = GAZE_REGISTRATION[direction]?.[eyeIndex] ?? eye
                          const scale = registration.scale ?? 1
                          return (
                            <image
                              key={eyeIndex}
                              href={`/bgt1-gaze-${direction}.png`}
                              x={eye.cx - registration.sourceX * scale}
                              y={eye.cy - registration.sourceY * scale}
                              width={190 * scale}
                              height={80 * scale}
                              preserveAspectRatio="none"
                              mask={`url(#${gazeMaskId}-${eyeIndex})`}
                            />
                          )
                        })}
                      </g>
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
          <p className={styles.downloadEyebrow}>From long video to shareable clips</p>
          <h1 className={styles.headingContainer}>
            <span className={styles.downloadHeading}>
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
            </span>
          </h1>
          <p className={styles.mobileDescription}>Find the best moments, add captions, and frame every clip for social.</p>
          <a className={styles.downloadButton} href={downloadUrl}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3h14v-3" /></svg>
            Download Deyn Studio
          </a>
          <p className={styles.mobilePlatforms}>For macOS, Windows, and Linux</p>
          <p className={styles.keepScrolling}>See how it works <span aria-hidden="true">↓</span></p>
        </div>
        <div ref={videoStageRef} className={styles.videoStage}>
          <div
            aria-hidden="true"
            className={`${styles.videoBackdrop} ${isVideoPlaying ? styles.videoBackdropHidden : ''}`}
          />
          <video
            ref={videoRef}
            className={`${styles.demoVideo} ${isVideoPlaying ? styles.demoVideoPlaying : ''}`}
            controls={isVideoPlaying}
            playsInline
            preload="none"
            poster="/app-shots/clips-p.png"
            aria-label="Deyn Studio product demo"
            aria-hidden={!isVideoPlaying}
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            onEnded={() => setIsVideoPlaying(false)}
          >
            <source src="/app-shots/demo-video.mp4" type="video/mp4" />
            Your browser does not support MP4 video playback.
          </video>
          <div className={`${styles.videoContent} ${isVideoPlaying ? styles.videoContentPlaying : ''}`}>
            <div ref={videoPromptRef} className={styles.videoHeading}>
              <p>Deyn Studio in action</p>
              <h2>Watch Deyn turn a long video<br className={styles.desktopBreak} /> into clips ready to share.</h2>
            </div>
            <div ref={playPromptRef} className={styles.playPrompt}>
              <button
                className={`${styles.playButton} ${isVideoPlaying ? styles.playButtonHidden : ''}`}
                type="button"
                aria-label="Play Deyn Studio product demo"
                onClick={() => videoRef.current?.play().catch(() => {})}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.5 4.9c0-.78.86-1.25 1.52-.82l10.1 6.6a1.56 1.56 0 0 1 0 2.62l-10.1 6.6a1 1 0 0 1-1.52-.82V4.9Z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div ref={cursorRef} className={styles.mouseCursor} aria-hidden="true">
        <span ref={cursorDotRef} className={styles.cursorDot} />
        <span ref={cursorRingRef} className={styles.cursorRing} />
      </div>
      <div
        ref={hoverLabelRef}
        className={`${styles.projectLabel} ${isCardHovered ? styles.projectLabelVisible : ''}`}
        aria-hidden="true"
      >
        <span className={styles.projectLabelContent}>
          <svg className={styles.projectLabelIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 18 18 6M7 6h11v11" />
          </svg>
          <span className={styles.projectLabelText}>
            <span className={styles.projectTitle}>{hoveredCard?.title}</span>
            <span className={styles.projectCategory}>{hoveredCard?.category}</span>
          </span>
        </span>
      </div>
    </section>
  )
}
