import { useState } from 'react'
import { BasicChessPage } from './pages/BasicChessPage'
import { StartPage } from './pages/StartPage'

const PAGES = {
  start: 'start',
  basicChess: 'basicChess',
  stormCommander: 'storm-commander',
}

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.start)

  if (currentPage === PAGES.basicChess) {
    return <BasicChessPage onBack={() => setCurrentPage(PAGES.start)} />
  }

  if (currentPage === PAGES.stormCommander) {
    return (
      <BasicChessPage
        onBack={() => setCurrentPage(PAGES.start)}
        pieceSet="storm-commander-png"
        title="Storm Commander"
      />
    )
  }

  return (
    <StartPage
      onOpenBasicChess={() => setCurrentPage(PAGES.basicChess)}
      onOpenStormCommander={() => setCurrentPage(PAGES.stormCommander)}
    />
  )
}

export default App
