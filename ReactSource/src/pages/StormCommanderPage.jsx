import { useMemo } from 'react'
import { BasicChessPage } from './BasicChessPage'
import '../styles/stormCommander.css'

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
  const starfieldStyle = useMemo(() => createStarfieldDriftStyle(), [])

  return (
    <div className="storm-commander-effects" style={starfieldStyle}>
      <BasicChessPage
        onBack={onBack}
        pieceSet="storm-commander-png"
        rootClassName="storm-commander-root"
        title="Storm Commander"
      />
    </div>
  )
}
