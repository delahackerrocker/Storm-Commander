import { useEffect, useState } from 'react'
import { StormCommanderPage } from './pages/StormCommanderPage'

const PAGES = {
  randomEncounter: 'random-encounter',
  stormChessDrill: 'storm-chess-drill',
  basicChess: 'basic-chess',
}

const DEBUG_FADED_OPACITY = 0
const DEBUG_PRESS_OPACITY_STEP = 0.2
const DEBUG_FADE_DELAY_MS = 2000
const DEBUG_IDLE_RESET_MS = 5000
const DEBUG_OPEN_PRESS_COUNT = 6

function DebugDock({
  currentPage,
  isOpen,
  onOpenBasicChess,
  onOpenRandomEncounter,
  onOpenStormChessDrill,
  onToggle,
}) {
  const [debugPressCount, setDebugPressCount] = useState(0)
  const [debugOpacity, setDebugOpacity] = useState(1)
  const [debugInteractionCount, setDebugInteractionCount] = useState(0)

  useEffect(() => {
    const fadeTimerId = window.setTimeout(() => {
      setDebugOpacity(DEBUG_FADED_OPACITY)
    }, DEBUG_FADE_DELAY_MS)

    return () => window.clearTimeout(fadeTimerId)
  }, [])

  useEffect(() => {
    if (debugInteractionCount === 0) {
      return undefined
    }

    const resetTimerId = window.setTimeout(() => {
      setDebugPressCount(0)
      setDebugOpacity(DEBUG_FADED_OPACITY)
    }, DEBUG_IDLE_RESET_MS)

    return () => window.clearTimeout(resetTimerId)
  }, [debugInteractionCount])

  function handleDebugTogglePress() {
    const nextPressCount = debugPressCount + 1

    setDebugInteractionCount((currentValue) => currentValue + 1)
    setDebugOpacity(
      Math.min(1, DEBUG_FADED_OPACITY + nextPressCount * DEBUG_PRESS_OPACITY_STEP),
    )

    if (nextPressCount >= DEBUG_OPEN_PRESS_COUNT) {
      setDebugPressCount(0)
      onToggle()
      return
    }

    setDebugPressCount(nextPressCount)
  }

  return (
    <div className="debug-dock">
      {isOpen ? (
        <div id="storm-debug-panel" className="debug-panel" aria-label="Debug mode">
          <p className="debug-panel-title">Debug Mode</p>
          <button
            type="button"
            className="debug-option"
            aria-pressed={currentPage === PAGES.randomEncounter}
            onClick={onOpenRandomEncounter}
          >
            Random Encounter
          </button>
          <button
            type="button"
            className="debug-option"
            aria-pressed={currentPage === PAGES.stormChessDrill}
            onClick={onOpenStormChessDrill}
          >
            Storm Chess Drill
          </button>
          <button
            type="button"
            className="debug-option"
            aria-pressed={currentPage === PAGES.basicChess}
            onClick={onOpenBasicChess}
          >
            Basic Chess
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="debug-toggle"
        aria-expanded={isOpen}
        aria-controls="storm-debug-panel"
        style={{ opacity: debugOpacity }}
        onClick={handleDebugTogglePress}
      >
        Debug
      </button>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.randomEncounter)
  const [isDebugOpen, setIsDebugOpen] = useState(false)

  function openDebugPage(page) {
    setCurrentPage(page)
    setIsDebugOpen(false)
  }

  let page = (
    <StormCommanderPage
      key="storm-random-encounter"
      allowChessDrill={false}
      startInRandomEncounter
    />
  )

  if (currentPage === PAGES.basicChess) {
    page = (
      <StormCommanderPage
        key="basic-chess"
        allowChessDrill={false}
        chessTitle="Basic Chess"
        onBack={() => openDebugPage(PAGES.randomEncounter)}
      />
    )
  }

  if (currentPage === PAGES.stormChessDrill) {
    page = (
      <StormCommanderPage
        key="storm-chess-drill"
        allowChessDrill
        onBack={() => openDebugPage(PAGES.randomEncounter)}
      />
    )
  }

  return (
    <>
      {page}
      <DebugDock
        currentPage={currentPage}
        isOpen={isDebugOpen}
        onOpenBasicChess={() => openDebugPage(PAGES.basicChess)}
        onOpenRandomEncounter={() => openDebugPage(PAGES.randomEncounter)}
        onOpenStormChessDrill={() => openDebugPage(PAGES.stormChessDrill)}
        onToggle={() => setIsDebugOpen((currentValue) => !currentValue)}
      />
    </>
  )
}

export default App
