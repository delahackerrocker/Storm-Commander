import { useState } from 'react'
import { IosDevicePreviewPage } from './pages/IosDevicePreviewPage'
import { StartPage } from './pages/StartPage'
import { PirateIntroPage } from './pages/PirateIntroPage'
import { StormCommanderPage } from './pages/StormCommanderPage'

const PAGES = {
  intro: 'intro',
  start: 'start',
  iosPreview: 'ios-preview',
  randomEncounter: 'random-encounter',
}

const STORM_VIEW_QUERY_PARAM = 'storm-view'
const STORM_VIEW_IOS_PREVIEW = 'ios-preview'
const STORM_VIEW_IOS_FRAME = 'ios-frame'

function getStormViewMode() {
  return new URLSearchParams(window.location.search).get(STORM_VIEW_QUERY_PARAM)
}

function App() {
  const [radioInputUnlockAt, setRadioInputUnlockAt] = useState(0)
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

  let page = <StartPage onPlay={() => openPage(PAGES.intro)} />

  if (currentPage === PAGES.intro) {
    page = <PirateIntroPage onBegin={() => {
      setRadioInputUnlockAt(Date.now() + 2000)
      openPage(PAGES.randomEncounter)
    }} />
  }

  if (currentPage === PAGES.randomEncounter) {
    page = (
      <StormCommanderPage
        key="storm-random-encounter"
        radioInputUnlockAt={radioInputUnlockAt}
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

  return page
}

export default App
