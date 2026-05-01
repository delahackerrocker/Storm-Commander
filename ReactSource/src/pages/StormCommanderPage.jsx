import { BasicChessPage } from './BasicChessPage'
import '../styles/stormCommander.css'

export function StormCommanderPage({ onBack }) {
  return (
    <BasicChessPage
      onBack={onBack}
      pieceSet="storm-commander-png"
      rootClassName="storm-commander-root"
      title="Storm Commander"
    />
  )
}
