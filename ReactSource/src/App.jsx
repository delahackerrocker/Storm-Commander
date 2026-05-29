import { useState } from 'react'
import { CharactersPage } from './pages/CharactersPage'
import { IosDevicePreviewPage } from './pages/IosDevicePreviewPage'
import { StartPage } from './pages/StartPage'
import { StormCommanderPage } from './pages/StormCommanderPage'

const PAGES = {
  start: 'start',
  iosPreview: 'ios-preview',
  randomEncounter: 'random-encounter',
  stormChessDrill: 'storm-chess-drill',
  basicChess: 'basic-chess',
  characters: 'characters',
}

const STORM_VIEW_QUERY_PARAM = 'storm-view'
const STORM_VIEW_IOS_PREVIEW = 'ios-preview'
const STORM_VIEW_IOS_FRAME = 'ios-frame'

function getStormViewMode() {
  return new URLSearchParams(window.location.search).get(STORM_VIEW_QUERY_PARAM)
}

function App() {
  const stormViewMode = getStormViewMode()
  const [currentPage, setCurrentPage] = useState(() =>
    stormViewMode === STORM_VIEW_IOS_PREVIEW ? PAGES.iosPreview : PAGES.start,
  )

  function openPage(page) {
    setCurrentPage(page)
  }

  if (stormViewMode === STORM_VIEW_IOS_FRAME) {
    return (
      <StormCommanderPage
        key="storm-ios-frame-random-encounter"
        allowChessDrill={false}
        startInRandomEncounter
      />
    )
  }

  let page = (
    <StartPage
      onOpenBasicChess={() => openPage(PAGES.basicChess)}
      onOpenCharacters={() => openPage(PAGES.characters)}
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

  if (currentPage === PAGES.iosPreview) {
    page = (
      <IosDevicePreviewPage
        key="ios-device-preview"
        onBack={() => openPage(PAGES.start)}
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

  if (currentPage === PAGES.characters) {
    page = (
      <CharactersPage
        key="characters"
        onBack={() => openPage(PAGES.start)}
      />
    )
  }

  return page
}

export default App
