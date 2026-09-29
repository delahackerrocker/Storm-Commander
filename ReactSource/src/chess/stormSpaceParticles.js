// Visual randomness is isolated from encounter/AI randomness.
export function createSpaceRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function createSpaceScene(width, height, random) {
  return {
    width, height, random, junk: [], nextJunk: 0.8 + random() * 1.8,
    stars: Array.from({ length: Math.min(240, Math.max(80, Math.round(width * height / 2100))) }, () => ({
      x: random() * width, y: random() * height,
      depth: 0.12 + random() ** 2 * 0.88,
      radius: 0.35 + random() ** 2 * 1.15,
      alpha: 0.2 + random() * 0.65,
      tint: random() < 0.22 ? '174,204,231' : '235,232,218',
    })),
  }
}

export function spawnSpaceJunk(scene, angle, shipSize, origin) {
  const { random, width, height } = scene
  const radians = angle * Math.PI / 180
  const dx = Math.cos(radians), dy = Math.sin(radians)
  const size = shipSize * (0.25 + random() * 0.25)
  let x, y
  if (origin) {
    x = origin.x * width + (random() - 0.5) * shipSize * 0.32
    y = origin.y * height + (random() - 0.5) * shipSize * 0.32
  } else if (random() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy))) {
    x = dx >= 0 ? -size / 2 : width + size / 2
    y = random() * height
  } else {
    x = random() * width
    y = dy >= 0 ? -size / 2 : height + size / 2
  }
  const rock = !origin && random() < 0.6
  const count = rock ? 8 : 5
  const particle = {
    x, y, size, scale: 1, age: 0, lifetime: 1.7 + random() * 1.3,
    speed: shipSize * (1.5 + random() * 1.4),
    rotation: random() * Math.PI * 2, spin: (random() - 0.5) * 2.5,
    rock, fromShip: Boolean(origin),
    points: Array.from({ length: count }, (_, index) => {
      const a = index / count * Math.PI * 2
      const r = 0.3 + random() * 0.2
      return [Math.cos(a) * r, Math.sin(a) * r]
    }),
  }
  scene.junk.push(particle)
  // Even rapid captures cannot accumulate an unbounded particle list.
  if (scene.junk.length > 36) scene.junk.shift()
  return particle
}

export function advanceSpaceScene(scene, elapsed, angle, speed, shipSize) {
  const radians = angle * Math.PI / 180
  const dx = Math.cos(radians), dy = Math.sin(radians)
  for (const star of scene.stars) {
    const distance = (18 + star.depth * 85) * speed * elapsed
    star.x = (star.x + dx * distance + scene.width) % scene.width
    star.y = (star.y + dy * distance + scene.height) % scene.height
  }
  scene.nextJunk -= elapsed
  if (scene.nextJunk <= 0) {
    spawnSpaceJunk(scene, angle, shipSize)
    scene.nextJunk = 2.2 + scene.random() * 3.8
  }
  for (const particle of scene.junk) {
    particle.age += elapsed
    particle.scale = Math.max(0, 1 - particle.age / particle.lifetime) ** 1.5
    particle.x += dx * particle.speed * speed * elapsed
    particle.y += dy * particle.speed * speed * elapsed
    particle.rotation += particle.spin * elapsed
  }
  scene.junk = scene.junk.filter(particle => particle.age < particle.lifetime)
}

export function getCaptureOrigin(animation, columns = 8, rows = 8) {
  if (!animation?.capturedPiece && !animation?.move?.captured) return null
  const square = animation.capturedPiece?.square || animation.move.to
  const point = typeof square === 'string'
    ? { x: square.charCodeAt(0) - 97, y: 8 - Number(square[1]) }
    : square
  return { x: (point.x + 0.5) / columns, y: (point.y + 0.5) / rows }
}
