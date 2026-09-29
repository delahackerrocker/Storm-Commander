import { afterEach, describe, expect, it, vi } from 'vitest'

function mockAudioContext() {
  const sources = []
  const param = () => ({ setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() })
  const node = () => ({ connect: vi.fn().mockReturnThis(), disconnect: vi.fn() })
  const source = () => {
    const value = { ...node(), frequency: param(), start: vi.fn(), stop: vi.fn() }
    sources.push(value)
    return value
  }
  const context = {
    state: 'running', currentTime: 10, sampleRate: 44100, destination: {}, resume: vi.fn().mockResolvedValue(),
    createOscillator: vi.fn(source), createBufferSource: vi.fn(source),
    createGain: () => ({ ...node(), gain: param() }),
    createBuffer: (_, length) => ({ getChannelData: () => new Float32Array(length) }),
  }
  vi.stubGlobal('AudioContext', class { constructor() { return context } })
  return { context, sources }
}

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })
describe('arcade sound scheduling', () => {
  it('aligns laser volleys and destruction with the animation, and mute stops current and future effects', async () => {
    const { sources } = mockAudioContext()
    const audio = await import('../storm-commander/audio/gameAudio')
    audio.primeGameAudio()
    audio.playCaptureAudio()
    expect(sources).toHaveLength(7)
    for (let i = 0; i < 5; i += 1) {
      expect(sources[i].type).toBe('square')
      expect(sources[i].start.mock.calls[0][0]).toBeCloseTo(10.2 + i * 0.12)
    }
    expect(sources[5].type).toBe('triangle')
    expect(sources[5].start).toHaveBeenCalledWith(10.9)
    expect(sources[6].start).toHaveBeenCalledWith(10.9)
    audio.setSoundMuted(true)
    for (const source of sources) expect(source.disconnect).toHaveBeenCalled()
    audio.playCaptureAudio()
    await audio.playRadioCue('player')
    expect(sources).toHaveLength(7)
    audio.setSoundMuted(false)
    await audio.playRadioCue('player')
    expect(sources).toHaveLength(9)
  })

  it('leaves gameplay usable without an audio API or before a user gesture', async () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
    const audio = await import('../storm-commander/audio/gameAudio')
    expect(() => audio.primeGameAudio()).not.toThrow()
    expect(() => audio.playCaptureAudio()()).not.toThrow()
    await expect(audio.playRadioCue('player')).resolves.toBeUndefined()
  })
})
