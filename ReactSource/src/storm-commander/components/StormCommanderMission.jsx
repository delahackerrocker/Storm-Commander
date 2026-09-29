import { useCallback, useEffect, useRef, useState } from 'react'
import { buildOpeningRadio, RADIO_HOLD_MS, RADIO_SLIDE_MS } from '../comms/openingRadio'
import { getFactionDisplayName } from '../tactics/encounterConstants'
import { isSoundMuted, setSoundMuted, playRadioCue, primeGameAudio } from '../audio/gameAudio'
import { StormCommanderEncounterPage } from './StormCommanderEncounterPage'

// Mounted with the encounter ID as its key: board updates must never restart the intro.
export function StormCommanderMission(props) {
  const [lines] = useState(() => buildOpeningRadio(props.encounter))
  const [inputLocked, setInputLocked] = useState(() => Date.now() < (props.radioInputUnlockAt || 0))
  const [stage, setStage] = useState(0)
  const [isLeaving, setIsLeaving] = useState(false)
  const advanceButton = useRef(null)
  const muteButton = useRef(null)
  const [muted, setMuted] = useState(isSoundMuted)
  const toggleSound = () => {
    setSoundMuted(!muted)
    setMuted(!muted)
    primeGameAudio()
  }
  const opening = stage < lines.length && props.encounter.status === 'active'
  const line = lines[stage]
  const dismiss = useCallback(() => {
    if (!inputLocked) setIsLeaving(true)
  }, [inputLocked])

  useEffect(() => {
    if (!inputLocked) return undefined
    const timer = window.setTimeout(() => setInputLocked(false), Math.max(0, props.radioInputUnlockAt - Date.now()))
    return () => window.clearTimeout(timer)
  }, [inputLocked, props.radioInputUnlockAt])

  useEffect(() => {
    if (!opening) return undefined
    const timer = window.setTimeout(() => {
      if (isLeaving) {
        setStage((current) => current + 1)
        setIsLeaving(false)
      } else {
        setIsLeaving(true)
      }
    }, isLeaving ? RADIO_SLIDE_MS : RADIO_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [opening, stage, isLeaving])

  useEffect(() => {
    if (!opening) return undefined
    // Cancel the development StrictMode probe before it can duplicate the chirp.
    const cue = window.setTimeout(() => playRadioCue(lines[stage].side), 0)
    return () => window.clearTimeout(cue)
  }, [opening, stage, lines])

  useEffect(() => {
    if (opening && !inputLocked) advanceButton.current?.focus({ preventScroll: true })
  }, [opening, stage, inputLocked])

  const finishFocus = useCallback((element) => {
    if (element) element.focus({ preventScroll: true })
  }, [])

  return (
    <>
      {lines.map((transmission) => (
        <link key={transmission.side} rel="preload" as="image" href={transmission.hero?.assets.radioPortrait} />
      ))}
      <StormCommanderEncounterPage
        {...props}
        showInitialBriefing={false}
        soundMuted={muted}
        onToggleSound={toggleSound}
        isRadioPlaying={opening}
        boardFocusRef={!opening ? finishFocus : undefined}
      />
      {opening && (
        <section className="storm-radio-overlay" role="dialog" aria-modal="true"
          onKeyDown={(event) => {
            if (event.key === 'Tab') {
              event.preventDefault()
              const target = document.activeElement === advanceButton.current ? muteButton.current : advanceButton.current
              target?.focus()
            }
          }}
          aria-label={`${line.side === 'player' ? 'Pirate' : 'Enemy'} radio transmission`}>
          <button ref={advanceButton} disabled={inputLocked} className="storm-radio-advance" type="button"
            onClick={() => { primeGameAudio(); dismiss() }} aria-label="Continue transmission"
            aria-describedby="storm-radio-speaker storm-radio-message"
            onKeyDown={(event) => {
              if (event.key === 'Escape') { event.preventDefault(); dismiss() }
            }}>
            <article key={stage}
              className={`storm-radio-card is-${line.side}${isLeaving ? ' is-leaving' : ''}`}
              style={{ '--radio-color': line.hero?.color }}>
              <div className="storm-radio-portrait">
                <img src={line.hero?.assets.radioPortrait} alt={line.hero?.fullName} />
                <span className="storm-radio-scanlines" aria-hidden="true" />
              </div>
              <div className="storm-radio-copy" aria-live="polite" aria-atomic="true">
                <span className="storm-radio-channel">
                  <span className="storm-radio-signal" aria-hidden="true">▂▄▆█</span>
                  {line.side === 'player' ? 'Incoming · Pirate command' : 'Intercept · Hostile channel'}
                </span>
                <h1 id="storm-radio-speaker">{line.hero?.fullName}</h1>
                <span className="storm-radio-faction">{getFactionDisplayName(line.hero?.faction)} fleet</span>
                <p id="storm-radio-message" className="storm-radio-dialogue">“{line.text}”</p>
                <span className="storm-radio-hint">{inputLocked ? 'Establishing link…' : 'Tap anywhere to continue'}</span>
              </div>
              <span className="storm-radio-timer" aria-hidden="true" />
            </article>
          </button>
          <button ref={muteButton} disabled={inputLocked} type="button" className="storm-radio-mute"
            aria-label="Mute game sounds" aria-pressed={muted}
            onClick={toggleSound}>
            {muted ? 'Sound off' : 'Sound on'}
          </button>
        </section>
      )}
    </>
  )
}
