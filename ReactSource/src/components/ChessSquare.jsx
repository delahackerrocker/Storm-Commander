import { getPieceName } from '../chess/pieceNames'
import { getSquareTone } from '../chess/squareUtils'
import { ChessPiece } from './ChessPiece'

export function ChessSquare({
  classNameExtras = [],
  dataFaction,
  legalMoveHintStyle,
  square,
  piece,
  isCapture,
  isLastMove,
  isLegalMove,
  isSelected,
  inputDisabled,
  onClick,
  pieceRotation,
  pieceSet,
  showStormSelectionRing = false,
  sidePieceFactions,
}) {
  const tone = getSquareTone(square)
  const className = [
    'chess-square',
    `chess-square-${tone}`,
    isSelected ? 'is-selected' : '',
    isLegalMove ? 'is-legal-move' : '',
    isCapture ? 'is-capture' : '',
    isLastMove ? 'is-last-move' : '',
    ...classNameExtras,
  ]
    .filter(Boolean)
    .join(' ')

  const actionLabel = isCapture
    ? 'capture destination'
    : isLegalMove
      ? 'legal destination'
      : 'square'

  return (
    <button
      type="button"
      className={className}
      data-square={square}
      data-faction={dataFaction}
      data-testid="chess-square"
      disabled={inputDisabled}
      style={legalMoveHintStyle}
      aria-label={`${square} ${getPieceName(piece)} ${actionLabel}`}
      onClick={() => onClick(square)}
    >
      {showStormSelectionRing ? <span className="storm-selection-ring" aria-hidden="true" /> : null}
      <ChessPiece
        piece={piece}
        pieceRotation={pieceRotation}
        pieceSet={pieceSet}
        sidePieceFactions={sidePieceFactions}
      />
    </button>
  )
}
