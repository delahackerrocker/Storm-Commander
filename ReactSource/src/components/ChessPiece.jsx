import { getPieceName } from '../chess/pieceNames'
import {
  STORM_COMMANDER_FACTION_PIECE_ASSETS,
  STORM_COMMANDER_PIECE_ASSETS,
} from '../chess/stormCommanderPieceAssets'
import { StormCommanderShipPiece } from './StormCommanderShipPiece'

const PIECE_GLYPHS = {
  wk: '\u2654',
  wq: '\u2655',
  wr: '\u2656',
  wb: '\u2657',
  wn: '\u2658',
  wp: '\u2659',
  bk: '\u265a',
  bq: '\u265b',
  br: '\u265c',
  bb: '\u265d',
  bn: '\u265e',
  bp: '\u265f',
}

export function ChessPiece({ piece, pieceRotation, pieceSet = 'unicode', sidePieceFactions }) {
  if (!piece) {
    return null
  }

  if (pieceSet === 'storm-commander-png') {
    const faction = sidePieceFactions?.[piece.color]
    const factionAsset = faction
      ? STORM_COMMANDER_FACTION_PIECE_ASSETS[faction]?.[piece.type]
      : null

    return (
      <StormCommanderShipPiece
        imageClassName="chess-piece-image"
        src={factionAsset || STORM_COMMANDER_PIECE_ASSETS[piece.color][piece.type]}
        alt={getPieceName(piece)}
        faction={faction}
        pieceType={piece.type}
        pieceRotation={pieceRotation}
      />
    )
  }

  return (
    <span className={`chess-piece chess-piece-${piece.color}`} aria-hidden="true">
      {PIECE_GLYPHS[`${piece.color}${piece.type}`]}
    </span>
  )
}
