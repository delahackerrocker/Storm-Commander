import { BasicChessPage } from './BasicChessPage'
import '../styles/standardChess.css'

export function StandardChessPage({ onBack }) {
  return (
    <BasicChessPage
      onBack={onBack}
      pieceSet="unicode"
      rootClassName="standard-chess-root"
      title="Chess-ish"
    />
  )
}
