// Conservative half-widths of the opaque portrait, in its 1654 × 951 source.
// Linear interpolation keeps the orbit continuous as cards scroll down past
// the head, neck and widening shoulders.
const portraitProfile = [
  [0, 118], [80, 134], [160, 142], [240, 142], [320, 118],
  [400, 148], [480, 236], [560, 368], [640, 433],
  [720, 480], [800, 512], [880, 540], [951, 562],
]

export function getPortraitHalfWidth(sourceY) {
  const y = Math.max(0, Math.min(951, sourceY))
  const upper = portraitProfile.findIndex(([row]) => row >= y)
  if (upper === 0) return portraitProfile[0][1]
  const [y0, width0] = portraitProfile[upper - 1]
  const [y1, width1] = portraitProfile[upper]
  return width0 + (width1 - width0) * (y - y0) / (y1 - y0)
}

export function getPortraitOrbitRadius(y, width, height, mobile, baseRadius) {
  // Cover the largest portrait pose and the full vertical extent of the tile,
  // including its idle motion, scroll bend and desktop hover lift.
  const portraitHeight = height * (mobile ? 0.68 : 0.88) * (mobile ? 1.025 : 1.045)
  const portraitBottom = height * (mobile ? 1.04 : 1.07)
  const portraitTop = portraitBottom - portraitHeight
  const tileWidth = mobile
    ? Math.min(92, Math.max(64, width * 0.18))
    : Math.min(156, Math.max(112, width * 0.1))
  const tileHalfHeight = tileWidth / (mobile ? 0.82 : 0.72) * 0.56
  const portraitTravel = mobile ? 12 : 32
  const sourceY = (height / 2 + y + tileHalfHeight + portraitTravel - portraitTop) * 951 / portraitHeight
  const bodyHalfWidth = getPortraitHalfWidth(sourceY) * portraitHeight / 951
  // Leave enough space for the entire rotated tile, not only its center.
  const clearance = tileWidth * 0.65 + (mobile ? 20 : 48)
  return Math.max(baseRadius, bodyHalfWidth + clearance)
}
