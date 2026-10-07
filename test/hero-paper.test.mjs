import test from 'node:test'
import assert from 'node:assert/strict'
import { getPaperStripPose } from '../lib/hero-paper.js'

test('scroll reversal reverses the paper curvature without moving its vertical center', () => {
  for (let index = 0; index < 8; index++) {
    const forward = getPaperStripPose(index, 8, 200, 0.8)
    const backward = getPaperStripPose(index, 8, 200, -0.8)
    assert.equal(forward.y, backward.y)
    assert.equal(forward.z, -backward.z)
    assert.equal(forward.rotationX, -backward.rotationX)
  }
})

test('paper settles flat and caps the displacement of fast scrolls', () => {
  for (let index = 0; index < 8; index++) {
    assert.deepEqual(getPaperStripPose(index, 8, 200, 0), { y: index * 25, z: 0, rotationX: 0 })
    assert.deepEqual(getPaperStripPose(index, 8, 200, 10), getPaperStripPose(index, 8, 200, 1))
    assert.ok(Math.abs(getPaperStripPose(index, 8, 200, 1).z) < 31)
  }
})
