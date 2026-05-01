import { useState } from 'react'
import { StandardChessPage } from './pages/StandardChessPage'
import { StartPage } from './pages/StartPage'
import { StormCommanderPage } from './pages/StormCommanderPage'

const PAGES = {
  start: 'start',
  basicChess: 'basicChess',
  stormCommander: 'storm-commander',
}

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.start)

  if (currentPage === PAGES.basicChess) {
    return <StandardChessPage onBack={() => setCurrentPage(PAGES.start)} />
  }

  if (currentPage === PAGES.stormCommander) {
    return <StormCommanderPage onBack={() => setCurrentPage(PAGES.start)} />
  }

  return (
    <StartPage
      onOpenBasicChess={() => setCurrentPage(PAGES.basicChess)}
      onOpenStormCommander={() => setCurrentPage(PAGES.stormCommander)}
    />
  )
}

export default App
