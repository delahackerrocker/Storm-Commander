import { useEffect, useState } from 'react'
import { primeGameAudio } from '../storm-commander/audio/gameAudio'
import { DifficultyDialog } from '../storm-commander/components/DifficultyDialog'

const SCREENS = ['orange-pirates', 'blue-robocorp', 'yellow-imperials', 'purple-rebels']

export function StartPage({ onPlay }) {
  const [launchUnlockAt, setLaunchUnlockAt] = useState(null)
  const [activeScreen, setActiveScreen] = useState(0)
  const [difficultyOpen, setDifficultyOpen] = useState(false)

  useEffect(() => {
    if (!launchUnlockAt) return undefined
    const timer = window.setTimeout(() => onPlay(launchUnlockAt), 600)
    return () => window.clearTimeout(timer)
  }, [launchUnlockAt, onPlay])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden && !launchUnlockAt && !difficultyOpen) setActiveScreen((current) => (current + 1) % SCREENS.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [launchUnlockAt, difficultyOpen])

  return (
    <main className={`start-page${launchUnlockAt ? ' is-launching' : ''}`} aria-label="Start menu">
      {SCREENS.map((screen, index) => (
        <picture key={screen}>
          <source
            media="(max-width: 600px) and (orientation: portrait)"
            srcSet={`${import.meta.env.BASE_URL}assets/storm-commander/title-screens/portrait/${screen}.png`}
          />
          <img
            className={`start-title-art${index === activeScreen ? ' is-active' : ''}`}
            src={`${import.meta.env.BASE_URL}assets/storm-commander/title-screens/${screen}.png`}
            alt=""
            aria-hidden="true"
            draggable="false"
          />
        </picture>
      ))}
      <button type="button" className="start-play-button" disabled={Boolean(launchUnlockAt) || difficultyOpen} onClick={() => { primeGameAudio(); setLaunchUnlockAt(Date.now() + 2000) }}>
        <span className="start-accessible-label">Press to Play</span>
      </button>
      <button type="button" className="start-difficulty-button" disabled={Boolean(launchUnlockAt)}
        aria-haspopup="dialog" onClick={() => setDifficultyOpen(true)}>Difficulty</button>
      {difficultyOpen ? <DifficultyDialog onClose={() => setDifficultyOpen(false)} /> : null}
    </main>
  )
}
