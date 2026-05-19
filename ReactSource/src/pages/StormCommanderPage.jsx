import { useEffect, useMemo, useState } from 'react'
import { createRandomSideFactions } from '../chess/stormCommanderFactions'
import {
  STORM_COMMANDER_STARFIELD_TWEEN_MS,
  advanceStarfieldMotion,
  createInitialStarfieldMotion,
  toStarfieldStyle,
} from '../chess/stormCommanderStarfield'
import {
  STORM_COMMANDER_FACTION_VISUAL_THEMES,
} from '../chess/stormCommanderPieceAssets'
import { BasicChessPage } from './BasicChessPage'
import '../styles/stormCommander.css'

function createSideVisualThemes(sideFactions) {
  return {
    w: STORM_COMMANDER_FACTION_VISUAL_THEMES[sideFactions.w],
    b: STORM_COMMANDER_FACTION_VISUAL_THEMES[sideFactions.b],
  }
}

export function StormCommanderPage({ onBack }) {
  const [sideFactions, setSideFactions] = useState(() => createRandomSideFactions())
  const [starfieldMotion, setStarfieldMotion] = useState(() => createInitialStarfieldMotion())
  const starfieldStyle = useMemo(() => toStarfieldStyle(starfieldMotion), [starfieldMotion])
  const sideVisualThemes = useMemo(() => createSideVisualThemes(sideFactions), [sideFactions])

  useEffect(() => {
    const advanceStarfield = () => {
      setStarfieldMotion((currentMotion) => advanceStarfieldMotion(currentMotion))
    }
    const starterId = window.setTimeout(advanceStarfield, 80)
    const timerId = window.setInterval(advanceStarfield, STORM_COMMANDER_STARFIELD_TWEEN_MS)

    return () => {
      window.clearTimeout(starterId)
      window.clearInterval(timerId)
    }
  }, [])

  function randomizeSideFactions() {
    setSideFactions((currentSideFactions) =>
      createRandomSideFactions(Math.random, currentSideFactions),
    )
  }

  return (
    <div className="storm-commander-effects" style={starfieldStyle}>
      <BasicChessPage
        onBack={onBack}
        onNewGameVisuals={randomizeSideFactions}
        pieceSet="storm-commander-png"
        rootClassName="storm-commander-root"
        sidePieceFactions={sideFactions}
        sideVisualThemes={sideVisualThemes}
        title="Storm Commander"
      />
    </div>
  )
}
