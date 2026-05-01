import { useState } from 'react'
import { BasicChessPage } from './pages/BasicChessPage'
import { SecondPage } from './pages/SecondPage'
import { StartPage } from './pages/StartPage'

const PAGES = {
  start: 'start',
  basicChess: 'basicChess',
  second: 'second',
}

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.start)

  if (currentPage === PAGES.basicChess) {
    return <BasicChessPage onBack={() => setCurrentPage(PAGES.start)} />
  }

  if (currentPage === PAGES.second) {
    return <SecondPage onBack={() => setCurrentPage(PAGES.start)} />
  }

  return (
    <StartPage
      onOpenBasicChess={() => setCurrentPage(PAGES.basicChess)}
      onOpenSecondPage={() => setCurrentPage(PAGES.second)}
    />
  )
}

export default App
