'use client'

import { useEffect, useImperativeHandle, useRef } from 'react'
import styles from './HeroSpiral.module.css'
import { getPaperStripPose } from '../../../lib/hero-paper.js'

const STRIPS = 8

// One media player supplies all the curved strips; video tiles never need
// additional decoders just to bend their surface.
export function ScrollPaperMedia({ ref, src, poster, type, videoRef, children }) {
  const rootRef = useRef(null)
  const stripRefs = useRef([])
  const canvasRefs = useRef([])
  const frameRef = useRef(0)
  const activeRef = useRef(false)
  const sizeRef = useRef(null)

  const drawVideo = () => {
    const video = videoRef()
    if (!video || video.readyState < 2 || !video.videoWidth) return
    const { width, height } = sizeRef.current
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight)
    const cropWidth = width / scale
    const cropHeight = height / scale
    const sx = (video.videoWidth - cropWidth) / 2
    const sy = (video.videoHeight - cropHeight) / 2
    canvasRefs.current.forEach((canvas, index) => {
      if (!canvas) return
      canvas.getContext('2d').drawImage(video,
        sx, sy + index * cropHeight / STRIPS, cropWidth, cropHeight / STRIPS,
        0, 0, canvas.width, canvas.height)
    })
  }

  const animateVideo = () => {
    if (!activeRef.current) return
    if (videoRef() && !videoRef().paused) drawVideo()
    frameRef.current = requestAnimationFrame(animateVideo)
  }

  useImperativeHandle(ref, () => ({
    setBend(amount) {
      const root = rootRef.current
      if (!root) return
      const active = Math.abs(amount) > 0.002
      if (!active) {
        activeRef.current = false
        root.dataset.bending = 'false'
        cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
        return
      }
      if (!activeRef.current) {
        const width = root.clientWidth
        const height = root.clientHeight
        sizeRef.current = { width, height }
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        const image = root.querySelector('img')
        const naturalWidth = image?.naturalWidth || width
        const naturalHeight = image?.naturalHeight || height
        const textureScale = Math.max(width / naturalWidth, height / naturalHeight)
        const textureWidth = naturalWidth * textureScale
        const textureHeight = naturalHeight * textureScale
        stripRefs.current.forEach((strip, index) => {
          const sliceHeight = height / STRIPS
          strip.style.height = `${sliceHeight + 0.5}px`
          strip.style.setProperty('--paper-width', `${textureWidth}px`)
          strip.style.setProperty('--paper-height', `${textureHeight}px`)
          strip.style.setProperty('--paper-x', `${(width - textureWidth) / 2}px`)
          strip.style.setProperty('--paper-offset', `${(height - textureHeight) / 2 - index * sliceHeight}px`)
          const canvas = canvasRefs.current[index]
          if (canvas) {
            canvas.width = Math.ceil(width * pixelRatio)
            canvas.height = Math.ceil(sliceHeight * pixelRatio)
          }
        })
        activeRef.current = true
        if (type === 'video') {
          drawVideo()
          frameRef.current = requestAnimationFrame(animateVideo)
        }
        root.dataset.bending = 'true'
      }
      const { height } = sizeRef.current
      // A cylindrical bow gives each strip a different tangent. Positive and
      // negative scroll velocities curve the paper in opposite directions.
      stripRefs.current.forEach((strip, index) => {
        const { y, z, rotationX } = getPaperStripPose(index, STRIPS, height, amount)
        strip.style.transform = `translate3d(0, ${y}px, ${z}px) rotateX(${rotationX}deg)`
      })
    },
  }))

  useEffect(() => () => {
    activeRef.current = false
    cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <div ref={rootRef} className={styles.paperMedia} data-bending="false">
      <div className={styles.paperFlat}>{children}</div>
      <div className={styles.paperCurve} aria-hidden="true">
        {Array.from({ length: STRIPS }, (_, index) => (
          <div key={index} ref={(node) => { stripRefs.current[index] = node }} className={styles.paperStrip}>
            {[false, true].map((reverse) => (
              <div key={String(reverse)} className={`${styles.paperTexture} ${reverse ? styles.paperReverse : ''}`}
                style={{ backgroundImage: `url("${poster || src}")` }}>
                {type === 'video' && !reverse && (
                  <canvas ref={(node) => { canvasRefs.current[index] = node }} className={styles.paperVideo} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
