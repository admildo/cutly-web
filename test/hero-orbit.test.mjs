import test from 'node:test'
import assert from 'node:assert/strict'
import { getPortraitHalfWidth, getPortraitOrbitRadius } from '../lib/hero-orbit.js'

test('lower orbit clears the portrait shoulders across phone and desktop sizes', () => {
  for (const [width, height, mobile] of [[360, 740, true], [390, 844, true], [767, 1024, true], [1440, 900, false]]) {
    const portraitHeight = height * (mobile ? 0.68 : 0.88) * (mobile ? 1.025 : 1.045)
    const top = height * (mobile ? 1.04 : 1.07) - portraitHeight
    const tileWidth = mobile ? Math.min(92, Math.max(64, width * 0.18)) : Math.min(156, Math.max(112, width * 0.1))
    for (let sourceY = 480; sourceY <= 951; sourceY += 10) {
      const y = top + sourceY / 951 * portraitHeight - height / 2
      const radius = getPortraitOrbitRadius(y, width, height, mobile, width * (mobile ? 0.42 : 0.31))
      const bodyEdge = getPortraitHalfWidth(sourceY) * portraitHeight / 951
      assert.ok(radius - tileWidth * 0.5 > bodyEdge + 10, `tile intersects shoulders at ${width}px, row ${sourceY}`)
    }
  }
})

test('orbit clearance stays continuous as scrolling moves tiles past the silhouette', () => {
  let previous = getPortraitOrbitRadius(-500, 390, 844, true, 390 * 0.42)
  for (let y = -499; y <= 500; y++) {
    const radius = getPortraitOrbitRadius(y, 390, 844, true, 390 * 0.42)
    assert.ok(Number.isFinite(radius))
    assert.ok(Math.abs(radius - previous) < 2, `orbit jumps at y=${y}`)
    previous = radius
  }
})
