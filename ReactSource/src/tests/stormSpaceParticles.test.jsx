import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as particles from '../chess/stormSpaceParticles'
import { StormSpaceField } from '../components/StormSpaceField'

const scene = () => particles.createSpaceScene(600, 450, particles.createSpaceRandom(42))
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers() })

describe('organic space particles', () => {
  it('scatters stars without repeated rows or columns, with different depths', () => {
    const stars = scene().stars
    expect(new Set(stars.map(s => s.x)).size).toBe(stars.length)
    expect(new Set(stars.map(s => s.y)).size).toBe(stars.length)
    expect(Math.max(...stars.map(s => s.depth)) - Math.min(...stars.map(s => s.depth))).toBeGreaterThan(0.7)
  })
  it.each([0, 45, 90, 135, 180, 225, 270, 315])('spawns upstream and carries debris with stars at %s degrees', angle => {
    const s = scene()
    const p = particles.spawnSpaceJunk(s, angle, 64)
    expect(p.x < 0 || p.x > s.width || p.y < 0 || p.y > s.height).toBe(true)
    expect(p.size).toBeGreaterThanOrEqual(16)
    expect(p.size).toBeLessThanOrEqual(32)
    const { x, y } = p
    particles.advanceSpaceScene(s, 0.1, angle, 1, 64)
    expect((p.x - x) * Math.sin(angle * Math.PI / 180) - (p.y - y) * Math.cos(angle * Math.PI / 180)).toBeCloseTo(0)
    expect(p.scale).toBeLessThan(1)
    particles.advanceSpaceScene(s, 0.1, angle + 90, 1, 64)
    expect(p.scale).toBeLessThan((1 - 0.1 / p.lifetime) ** 1.5)
  })
  it('cleans up debris after a short lifetime and caps particle accumulation', () => {
    const s = scene()
    for (let i = 0; i < 100; i++) particles.spawnSpaceJunk(s, 0, 64, { x: 0.5, y: 0.5 })
    expect(s.junk).toHaveLength(36)
    s.nextJunk = 100
    particles.advanceSpaceScene(s, 3.1, 90, 1, 64)
    expect(s.junk).toHaveLength(0)
  })
  it('uses the destroyed ship location on rectangular boards and ignores quiet movement', () => {
    expect(particles.getCaptureOrigin({ move: { to: { x: 4, y: 2 } } }, 6, 4)).toBeNull()
    expect(particles.getCaptureOrigin({ capturedPiece: { square: { x: 4, y: 2 } } }, 6, 4))
      .toEqual({ x: 0.75, y: 0.625 })
    expect(particles.getCaptureOrigin({ move: { captured: 'q', to: 'd4' } }))
      .toEqual({ x: 3.5 / 8, y: 4.5 / 8 })
  })
  it('emits fragments at impact, keeps them after the move ends, and cancels on unmount', () => {
    vi.useFakeTimers()
    vi.stubGlobal('CanvasRenderingContext2D', class {})
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 600, height: 450 })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      setTransform() {}, clearRect() {}, beginPath() {}, arc() {}, fill() {},
    })
    const spawn = vi.spyOn(particles, 'spawnSpaceJunk')
    const animation = { capturedPiece: { square: { x: 2, y: 1 } } }
    const { rerender, unmount } = render(<StormSpaceField animation={animation} columns={6} rows={4} />)
    act(() => vi.advanceTimersByTime(899))
    expect(spawn).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(spawn).toHaveBeenCalledTimes(7)
    const activeScene = spawn.mock.calls[0][0]
    rerender(<StormSpaceField columns={6} rows={4} />)
    expect(activeScene.junk).toHaveLength(7)
    rerender(<StormSpaceField animation={{ ...animation }} columns={6} rows={4} />)
    unmount()
    act(() => vi.advanceTimersByTime(1000))
    expect(spawn).toHaveBeenCalledTimes(7)
  })
})
