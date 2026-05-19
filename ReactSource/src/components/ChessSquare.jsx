import { getPieceName } from '../chess/pieceNames'
import { getSquareTone } from '../chess/squareUtils'
import { ChessPiece } from './ChessPiece'

export function ChessSquare({
  square,
  piece,
  isCapture,
  isLastMove,
  isLegalMove,
  isSelected,
  inputDisabled,
  onClick,
  pieceSet,
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
      data-testid="chess-square"
      disabled={inputDisabled}
      aria-label={`${square} ${getPieceName(piece)} ${actionLabel}`}
      onClick={() => onClick(square)}
    >
      <ChessPiece piece={piece} pieceSet={pieceSet} sidePieceFactions={sidePieceFactions} />
    </button>
  )
}
