export const STORM_COMMANDER_STARFIELD_TICK_MS = 180
export const STORM_COMMANDER_STARFIELD_TWEEN_MS = 320

const LAYER_PIXELS_PER_SECOND = {
  near: 154,
  mid: 98,
  far: 54,
  dust: 36,
  asteroidNear: 118,
  asteroidFar: 68,
}

const MIN_SPEED_MULTIPLIER = 1.08
const SPEED_MULTIPLIER_RANGE = 1.32
const MIN_MANEUVER_STEPS = 7
const MANEUVER_STEP_RANGE = 12
const TURN_SMOOTHING = 0.14
const SPEED_SMOOTHING = 0.16

function getRandomAngle(random) {
  return random() * 360
}

function getRandomSpeed(random) {
  return MIN_SPEED_MULTIPLIER + random() * SPEED_MULTIPLIER_RANGE
}

function getManeuverStepCount(random) {
  return MIN_MANEUVER_STEPS + Math.floor(random() * MANEUVER_STEP_RANGE)
}

function getShortestAngleDelta(fromAngle, toAngle) {
  return ((toAngle - fromAngle + 540) % 360) - 180
}

function getNextManeuverHeading(previousAngle, random) {
  const candidate = getRandomAngle(random)
  const shortestDelta = getShortestAngleDelta(previousAngle, candidate)

  return previousAngle + shortestDelta
}

function moveAngleTowardTarget(fromAngle, toAngle) {
  return fromAngle + getShortestAngleDelta(fromAngle, toAngle) * TURN_SMOOTHING
}

function moveSpeedTowardTarget(fromSpeed, toSpeed) {
  return fromSpeed + (toSpeed - fromSpeed) * SPEED_SMOOTHING
}

function getLayerStep(angle, pixelsPerSecond, speedMultiplier, elapsedMs) {
  const radians = (angle * Math.PI) / 180
  const distance = pixelsPerSecond * speedMultiplier * (elapsedMs / 1000)

  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance,
  }
}

function px(value) {
  return `${value.toFixed(2)}px`
}

function position(x, y, offsetX = 0, offsetY = 0) {
  return `${px(x + offsetX)} ${px(y + offsetY)}`
}

function rotationForAngle(angle) {
  return `${(angle - 90).toFixed(2)}deg`
}

export function createInitialStarfieldMotion(random = Math.random) {
  const angle = getRandomAngle(random)
  const speed = getRandomSpeed(random)

  return {
    angle,
    targetAngle: getNextManeuverHeading(angle, random),
    speed,
    targetSpeed: getRandomSpeed(random),
    retargetInSteps: getManeuverStepCount(random),
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

export function advanceStarfieldMotion(
  currentMotion,
  random = Math.random,
  elapsedMs = STORM_COMMANDER_STARFIELD_TICK_MS,
) {
  const shouldRetarget = currentMotion.retargetInSteps <= 1
  const targetAngle = shouldRetarget
    ? getNextManeuverHeading(currentMotion.angle, random)
    : currentMotion.targetAngle
  const targetSpeed = shouldRetarget ? getRandomSpeed(random) : currentMotion.targetSpeed
  const retargetInSteps = shouldRetarget
    ? getManeuverStepCount(random)
    : currentMotion.retargetInSteps - 1
  const angle = moveAngleTowardTarget(currentMotion.angle, targetAngle)
  const speed = moveSpeedTowardTarget(currentMotion.speed, targetSpeed)
  const near = getLayerStep(angle, LAYER_PIXELS_PER_SECOND.near, speed, elapsedMs)
  const mid = getLayerStep(angle, LAYER_PIXELS_PER_SECOND.mid, speed, elapsedMs)
  const far = getLayerStep(angle, LAYER_PIXELS_PER_SECOND.far, speed, elapsedMs)
  const dust = getLayerStep(angle, LAYER_PIXELS_PER_SECOND.dust, speed, elapsedMs)
  const asteroidNear = getLayerStep(
    angle,
    LAYER_PIXELS_PER_SECOND.asteroidNear,
    speed,
    elapsedMs,
  )
  const asteroidFar = getLayerStep(
    angle,
    LAYER_PIXELS_PER_SECOND.asteroidFar,
    speed,
    elapsedMs,
  )

  return {
    angle,
    targetAngle,
    speed,
    targetSpeed,
    retargetInSteps,
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

export function toStarfieldLayerStyles(starfieldMotion) {
  return {
    near: {
      backgroundPosition: position(starfieldMotion.nearX, starfieldMotion.nearY),
    },
    mid: {
      backgroundPosition: position(starfieldMotion.midX, starfieldMotion.midY, 22, 38),
    },
    far: {
      backgroundPosition: position(starfieldMotion.farX, starfieldMotion.farY, 54, 16),
    },
    dust: {
      backgroundPosition: position(starfieldMotion.dustX, starfieldMotion.dustY, 8, 17),
    },
    streak: {
      backgroundPosition: position(starfieldMotion.farX, starfieldMotion.farY, 108, 72),
    },
    asteroidNear: {
      backgroundPosition: position(
        starfieldMotion.asteroidNearX,
        starfieldMotion.asteroidNearY,
      ),
    },
    asteroidFar: {
      backgroundPosition: position(
        starfieldMotion.asteroidFarX,
        starfieldMotion.asteroidFarY,
        142,
        86,
      ),
    },
    asteroidWide: {
      backgroundPosition: position(
        starfieldMotion.asteroidFarX,
        starfieldMotion.asteroidFarY,
        88,
        128,
      ),
    },
  }
}
