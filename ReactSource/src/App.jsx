import { useState } from 'react'
import { StandardChessPage } from './pages/StandardChessPage'
import { StormCommanderPage } from './pages/StormCommanderPage'

const PAGES = {
  randomEncounter: 'random-encounter',
  stormChessDrill: 'storm-chess-drill',
  basicChess: 'basic-chess',
}

function DebugDock({
  currentPage,
  isOpen,
  onOpenBasicChess,
  onOpenRandomEncounter,
  onOpenStormChessDrill,
  onToggle,
}) {
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
        onClick={onToggle}
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
      <StandardChessPage
        key="basic-chess"
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
