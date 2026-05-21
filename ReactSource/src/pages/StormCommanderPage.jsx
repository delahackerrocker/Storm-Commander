import { useEffect, useMemo, useState } from 'react'
import { createRandomSideFactions } from '../chess/stormCommanderFactions'
import {
  STORM_COMMANDER_STARFIELD_TICK_MS,
  advanceStarfieldMotion,
  createInitialStarfieldMotion,
  toStarfieldLayerStyles,
  toStarfieldStyle,
} from '../chess/stormCommanderStarfield'
import {
  STORM_COMMANDER_FACTION_VISUAL_THEMES,
} from '../chess/stormCommanderPieceAssets'
import { StormCommanderEncounterPage } from '../storm-commander/components/StormCommanderEncounterPage'
import { generateRandomEncounter } from '../storm-commander/encounter/generateRandomEncounter'
import { BasicChessPage } from './BasicChessPage'
import '../styles/stormCommander.css'

function createSideVisualThemes(sideFactions) {
  return {
    w: STORM_COMMANDER_FACTION_VISUAL_THEMES[sideFactions.w],
    b: STORM_COMMANDER_FACTION_VISUAL_THEMES[sideFactions.b],
  }
}

export function StormCommanderPage({
  allowChessDrill = true,
  onBack,
  startInRandomEncounter = false,
}) {
  const [sideFactions, setSideFactions] = useState(() => createRandomSideFactions())
  const [starfieldMotion, setStarfieldMotion] = useState(() => createInitialStarfieldMotion())
  const [encounter, setEncounter] = useState(() =>
    startInRandomEncounter ? generateRandomEncounter() : null,
  )
  const starfieldLayerStyles = useMemo(
    () => toStarfieldLayerStyles(starfieldMotion),
    [starfieldMotion],
  )
  const starfieldStyle = useMemo(() => toStarfieldStyle(starfieldMotion), [starfieldMotion])
  const sideVisualThemes = useMemo(() => createSideVisualThemes(sideFactions), [sideFactions])

  useEffect(() => {
    const advanceStarfield = () => {
      setStarfieldMotion((currentMotion) => advanceStarfieldMotion(currentMotion))
    }
    const starterId = window.setTimeout(advanceStarfield, 40)
    const timerId = window.setInterval(advanceStarfield, STORM_COMMANDER_STARFIELD_TICK_MS)

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

  function startRandomEncounter() {
    setEncounter(generateRandomEncounter())
  }

  return (
    <div className="storm-commander-effects" style={starfieldStyle}>
      {encounter ? (
        <StormCommanderEncounterPage
          encounter={encounter}
          onBack={onBack}
          onNewEncounter={startRandomEncounter}
          onReturnToChess={allowChessDrill ? () => setEncounter(null) : undefined}
          pieceRotation={starfieldMotion.pieceRotation}
          setEncounter={setEncounter}
          starfieldLayerStyles={starfieldLayerStyles}
        />
      ) : (
        <BasicChessPage
          onBack={onBack}
          onNewGameVisuals={randomizeSideFactions}
          pieceSet="storm-commander-png"
          rootClassName="storm-commander-root"
          sidePieceFactions={sideFactions}
          sideVisualThemes={sideVisualThemes}
          pieceRotation={starfieldMotion.pieceRotation}
          starfieldLayerStyles={starfieldLayerStyles}
          title="Storm Commander"
          topControls={
            <button type="button" className="storm-primary-button" onClick={startRandomEncounter}>
              New Random Encounter
            </button>
          }
        />
      )}
    </div>
  )
}
