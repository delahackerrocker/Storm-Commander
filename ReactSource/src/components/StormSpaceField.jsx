import { useEffect, useRef } from 'react'
import {
  advanceSpaceScene, createSpaceRandom, createSpaceScene, getCaptureOrigin, spawnSpaceJunk,
} from '../chess/stormSpaceParticles'

function drawScene(context, scene) {
  context.clearRect(0, 0, scene.width, scene.height)
  for (const star of scene.stars) {
    context.fillStyle = `rgba(${star.tint},${star.alpha})`
    context.beginPath()
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    context.fill()
  }
  for (const junk of scene.junk) {
    context.save()
    context.translate(junk.x, junk.y)
    context.rotate(junk.rotation)
    context.scale(junk.size * junk.scale, junk.size * junk.scale)
    context.globalAlpha = Math.min(0.85, junk.scale * 3)
    context.beginPath()
    junk.points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y))
    context.closePath()
    context.fillStyle = junk.rock ? '#77746d' : '#79919c'
    context.fill()
    context.strokeStyle = junk.rock ? '#aba496' : '#a9bdc6'
    context.lineWidth = 0.035
    context.stroke()
    context.beginPath()
    context.moveTo(...junk.points[0])
    context.lineTo(-0.08, 0.06)
    context.lineTo(...junk.points[2])
    context.lineTo(...junk.points[1])
    context.fillStyle = junk.rock ? '#494a48' : '#3b505d'
    context.fill()
    context.restore()
  }
}

export function StormSpaceField({ paused = false, animation, columns = 8, rows = 8 }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    // Canvas is optional in non-rendering environments (e.g. server/unit tests).
    if (!canvas || typeof CanvasRenderingContext2D === 'undefined') return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined
    const seed = globalThis.crypto?.getRandomValues(new Uint32Array(1))[0] ?? Date.now()
    const random = createSpaceRandom(seed)
    const root = canvas.closest('.storm-commander-effects')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame, lastTime = 0
    let direction = (parseFloat(root?.style.getPropertyValue('--storm-piece-rotation')) || 0) + 90

    function resize() {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      if (sceneRef.current?.width !== width || sceneRef.current?.height !== height) {
        sceneRef.current = createSpaceScene(width, height, random)
      }
      drawScene(context, sceneRef.current)
    }
    function render(time) {
      frame = window.requestAnimationFrame(render)
      if (time - lastTime < 1000 / 30) return
      const elapsed = Math.min((time - lastTime) / 1000, 0.08)
      lastTime = time
      const scene = sceneRef.current
      if (!scene) return
      // Read the same heading used for ship facing, without React updates per frame.
      const target = (parseFloat(root?.style.getPropertyValue('--storm-piece-rotation')) || 0) + 90
      direction += ((((target - direction) % 360 + 540) % 360) - 180) * Math.min(1, elapsed * 4)
      const speed = parseFloat(root?.style.getPropertyValue('--storm-drift-speed')) || 1
      advanceSpaceScene(scene, elapsed, direction, speed, Math.min(scene.width / columns, scene.height / rows) * 0.72)
      drawScene(context, scene)
    }
    function updatePlayback() {
      window.cancelAnimationFrame(frame)
      lastTime = performance.now()
      if (!paused && !document.hidden && !reducedMotion.matches) frame = window.requestAnimationFrame(render)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    updatePlayback()
    document.addEventListener('visibilitychange', updatePlayback)
    reducedMotion.addEventListener('change', updatePlayback)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', updatePlayback)
      reducedMotion.removeEventListener('change', updatePlayback)
    }
  }, [paused, columns, rows])

  useEffect(() => {
    const origin = getCaptureOrigin(animation, columns, rows)
    if (!origin || paused) return undefined
    // Start at the same 900ms impact as the explosion and destruction sound.
    const timer = window.setTimeout(() => {
      const scene = sceneRef.current
      if (!scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const shipSize = Math.min(scene.width / columns, scene.height / rows) * 0.72
      for (let i = 0; i < 7; i++) spawnSpaceJunk(scene, 0, shipSize, origin)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [animation, columns, rows, paused])

  return <div className="storm-starfield-layers" aria-hidden="true">
    <span className="storm-starfield-layer storm-starfield-layer-nebula" />
    <canvas ref={canvasRef} className="storm-space-particles" />
  </div>
}
