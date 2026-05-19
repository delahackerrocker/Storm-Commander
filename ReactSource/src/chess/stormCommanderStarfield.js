export const STORM_COMMANDER_STARFIELD_TWEEN_MS = 7200

const LAYER_STEP_DISTANCES = {
  near: 340,
  mid: 220,
  far: 124,
  dust: 72,
  asteroidNear: 260,
  asteroidFar: 154,
}

function getRandomAngle(random) {
  return random() * 360
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360
}

function getNextAngle(previousAngle, random) {
  const candidate = getRandomAngle(random)
  const shortestTurn = Math.abs(((candidate - previousAngle + 540) % 360) - 180)

  if (shortestTurn < 38) {
    return normalizeAngle(candidate + 86)
  }

  return candidate
}

function getLayerStep(angle, distance) {
  const radians = (angle * Math.PI) / 180

  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance,
  }
}

function px(value) {
  return `${value.toFixed(2)}px`
}

function rotationForAngle(angle) {
  return `${normalizeAngle(angle - 90).toFixed(2)}deg`
}

export function createInitialStarfieldMotion(random = Math.random) {
  const angle = getRandomAngle(random)

  return {
    angle,
    nearX: 0,
    nearY: 0,
    midX: 0,
    midY: 0,
    farX: 0,
    farY: 0,
    dustX: 0,
    dustY: 0,
    asteroidNearX: 0,
    asteroidNearY: 0,
    asteroidFarX: 0,
    asteroidFarY: 0,
    pieceRotation: rotationForAngle(angle),
  }
}

export function advanceStarfieldMotion(currentMotion, random = Math.random) {
  const angle = getNextAngle(currentMotion.angle, random)
  const near = getLayerStep(angle, LAYER_STEP_DISTANCES.near)
  const mid = getLayerStep(angle, LAYER_STEP_DISTANCES.mid)
  const far = getLayerStep(angle, LAYER_STEP_DISTANCES.far)
  const dust = getLayerStep(angle, LAYER_STEP_DISTANCES.dust)
  const asteroidNear = getLayerStep(angle, LAYER_STEP_DISTANCES.asteroidNear)
  const asteroidFar = getLayerStep(angle, LAYER_STEP_DISTANCES.asteroidFar)

  return {
    angle,
    nearX: currentMotion.nearX + near.x,
    nearY: currentMotion.nearY + near.y,
    midX: currentMotion.midX + mid.x,
    midY: currentMotion.midY + mid.y,
    farX: currentMotion.farX + far.x,
    farY: currentMotion.farY + far.y,
    dustX: currentMotion.dustX + dust.x,
    dustY: currentMotion.dustY + dust.y,
    asteroidNearX: currentMotion.asteroidNearX + asteroidNear.x,
    asteroidNearY: currentMotion.asteroidNearY + asteroidNear.y,
    asteroidFarX: currentMotion.asteroidFarX + asteroidFar.x,
    asteroidFarY: currentMotion.asteroidFarY + asteroidFar.y,
    pieceRotation: rotationForAngle(angle),
  }
}

export function toStarfieldStyle(starfieldMotion) {
  return {
    '--storm-star-tween-ms': `${STORM_COMMANDER_STARFIELD_TWEEN_MS}ms`,
    '--storm-star-near-x': px(starfieldMotion.nearX),
    '--storm-star-near-y': px(starfieldMotion.nearY),
    '--storm-star-mid-x': px(starfieldMotion.midX),
    '--storm-star-mid-y': px(starfieldMotion.midY),
    '--storm-star-far-x': px(starfieldMotion.farX),
    '--storm-star-far-y': px(starfieldMotion.farY),
    '--storm-star-dust-x': px(starfieldMotion.dustX),
    '--storm-star-dust-y': px(starfieldMotion.dustY),
    '--storm-asteroid-near-x': px(starfieldMotion.asteroidNearX),
    '--storm-asteroid-near-y': px(starfieldMotion.asteroidNearY),
    '--storm-asteroid-far-x': px(starfieldMotion.asteroidFarX),
    '--storm-asteroid-far-y': px(starfieldMotion.asteroidFarY),
    '--storm-piece-rotation': starfieldMotion.pieceRotation,
  }
}
