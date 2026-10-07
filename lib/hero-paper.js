export function getPaperStripPose(index, count, height, bend) {
  const arc = Math.max(-1, Math.min(1, bend)) * 1.6
  const t = (index + 0.5) / count - 0.5
  const angle = arc * t
  if (Math.abs(arc) < 0.00001) return { y: index * height / count, z: 0, rotationX: 0 }
  return {
    y: height / 2 + height * Math.sin(angle) / arc - height / count / 2,
    z: height * (1 - Math.cos(angle)) / arc,
    rotationX: angle * 180 / Math.PI,
  }
}
