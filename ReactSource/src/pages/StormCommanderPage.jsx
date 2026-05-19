import { useMemo, useState } from 'react'
import { createRandomSideFactions } from '../chess/stormCommanderFactions'
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

function createStarfieldDriftStyle() {
  const driftAngle = Math.random() * 360
  const radians = (driftAngle * Math.PI) / 180
  const nearDistance = 220
  const midDistance = 142
  const farDistance = 84

  return {
    '--storm-star-drift-near-x': `${Math.cos(radians) * nearDistance}px`,
    '--storm-star-drift-near-y': `${Math.sin(radians) * nearDistance}px`,
    '--storm-star-drift-mid-x': `${Math.cos(radians) * midDistance}px`,
    '--storm-star-drift-mid-y': `${Math.sin(radians) * midDistance}px`,
    '--storm-star-drift-far-x': `${Math.cos(radians) * farDistance}px`,
    '--storm-star-drift-far-y': `${Math.sin(radians) * farDistance}px`,
    '--storm-piece-rotation': `${driftAngle - 90}deg`,
  }
}

export function StormCommanderPage({ onBack }) {
  const [sideFactions, setSideFactions] = useState(() => createRandomSideFactions())
  const starfieldStyle = useMemo(() => createStarfieldDriftStyle(), [])
  const sideVisualThemes = useMemo(() => createSideVisualThemes(sideFactions), [sideFactions])

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
