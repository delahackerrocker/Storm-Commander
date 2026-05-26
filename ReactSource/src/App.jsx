import { useState } from 'react'
import { StartPage } from './pages/StartPage'
import { StormCommanderPage } from './pages/StormCommanderPage'

const PAGES = {
  start: 'start',
  randomEncounter: 'random-encounter',
  stormChessDrill: 'storm-chess-drill',
  basicChess: 'basic-chess',
}

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.start)

  function openPage(page) {
    setCurrentPage(page)
  }

  let page = (
    <StartPage
      onOpenBasicChess={() => openPage(PAGES.basicChess)}
      onOpenRandomEncounter={() => openPage(PAGES.randomEncounter)}
      onOpenStormChessDrill={() => openPage(PAGES.stormChessDrill)}
    />
  )

  if (currentPage === PAGES.randomEncounter) {
    page = (
      <StormCommanderPage
        key="storm-random-encounter"
        allowChessDrill={false}
        onBack={() => openPage(PAGES.start)}
        startInRandomEncounter
      />
    )
  }

  if (currentPage === PAGES.basicChess) {
    page = (
      <StormCommanderPage
        key="basic-chess"
        allowChessDrill={false}
        chessTitle="Basic Chess"
        onBack={() => openPage(PAGES.start)}
      />
    )
  }

  if (currentPage === PAGES.stormChessDrill) {
    page = (
      <StormCommanderPage
        key="storm-chess-drill"
        allowChessDrill
        onBack={() => openPage(PAGES.start)}
      />
    )
  }

  return page
}

export default App
