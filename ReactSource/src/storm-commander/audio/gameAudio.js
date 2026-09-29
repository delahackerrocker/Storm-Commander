// Lightweight arcade effects generated locally with Web Audio.
let context
let muted = false
const activeSounds = new Set()

export function primeGameAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    context ||= new AudioContext()
    context.resume().catch(() => {})
  } catch { /* Gameplay also works on devices without available audio. */ }
}

export function isSoundMuted() { return muted }
export function setSoundMuted(value) {
  muted = value
  if (muted) for (const stop of activeSounds) stop()
}

function createSound() {
  const sources = new Map()
  const stop = () => {
    for (const [source, gain] of sources) {
      source.stop()
      source.disconnect()
      gain.disconnect()
    }
    sources.clear()
    activeSounds.delete(stop)
  }
  activeSounds.add(stop)
  return {
    stop,
    add(source, start, duration, volume) {
      const gain = context.createGain()
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(volume, start + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.005)
      gain.gain.linearRampToValueAtTime(0, start + duration)
      source.connect(gain).connect(context.destination)
      sources.set(source, gain)
      source.onended = () => {
        source.disconnect()
        gain.disconnect()
        sources.delete(source)
        if (!sources.size) activeSounds.delete(stop)
      }
      source.start(start)
      source.stop(start + duration)
    },
  }
}

function tone(sound, { type, from, to = from, start, duration, volume }) {
  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, start)
  oscillator.frequency.exponentialRampToValueAtTime(to, start + duration)
  sound.add(oscillator, start, duration, volume)
}

export async function playRadioCue(side) {
  if (muted || !context) return
  try { await context.resume() } catch { return }
  if (muted || context.state !== 'running') return
  const sound = createSound()
  for (let i = 0; i < 2; i += 1) {
    tone(sound, { type: 'sine', from: (side === 'player' ? 920 : 620) + i * 180,
      start: context.currentTime + i * 0.09, duration: 0.08, volume: 0.035 })
  }
}

// Match the five laser flashes (200–680ms) and ship explosion (900ms).
// The caller cancels this batch if its combat animation is interrupted.
export function playCaptureAudio() {
  if (muted || context?.state !== 'running') return () => {}
  const sound = createSound()
  const start = context.currentTime
  for (let i = 0; i < 5; i += 1) {
    tone(sound, { type: 'square', from: 1450 - i * 90, to: 180,
      start: start + 0.2 + i * 0.12, duration: 0.09, volume: 0.025 })
  }
  // A low falling note plus crunchy, stepped noise gives the destruction a thump.
  tone(sound, { type: 'triangle', from: 150, to: 35,
    start: start + 0.9, duration: 0.3, volume: 0.13 })
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.3), context.sampleRate)
  const data = buffer.getChannelData(0)
  let noise = 0
  let noiseState = 0xace1
  for (let i = 0; i < data.length; i += 1) {
    if (i % 8 === 0) {
      noiseState = (noiseState >>> 1) ^ (-(noiseState & 1) & 0xb400)
      noise = noiseState / 32767.5 - 1
    }
    data[i] = noise
  }
  const burst = context.createBufferSource()
  burst.buffer = buffer
  sound.add(burst, start + 0.9, 0.3, 0.1)
  return sound.stop
}
