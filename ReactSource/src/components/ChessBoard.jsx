import { BOARD_SQUARES } from '../chess/squareUtils'
import { ChessSquare } from './ChessSquare'

export function ChessBoard({
  game,
  inputDisabled,
  lastMove,
  legalMoves,
  onSquareClick,
  pieceSet = 'unicode',
  selectedSquare,
}) {
  const legalMoveByDestination = new Map()

  for (const move of legalMoves) {
    if (!legalMoveByDestination.has(move.to)) {
      legalMoveByDestination.set(move.to, move)
    }
  }

  return (
    <div className="board-wrap">
      <div className="board-files board-files-top" aria-hidden="true">
        <span>a</span>
        <span>b</span>
        <span>c</span>
        <span>d</span>
        <span>e</span>
        <span>f</span>
        <span>g</span>
        <span>h</span>
      </div>
      <div className="board-with-ranks">
        <div className="board-ranks" aria-hidden="true">
          <span>8</span>
          <span>7</span>
          <span>6</span>
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
        <div className="chess-board" role="grid" aria-label="Chess board">
          {BOARD_SQUARES.map((square) => {
            const piece = game.get(square)
            const move = legalMoveByDestination.get(square)

            return (
              <ChessSquare
                key={square}
                square={square}
                piece={piece}
                isSelected={selectedSquare === square}
                isLegalMove={Boolean(move)}
                isCapture={Boolean(move?.captured)}
                isLastMove={lastMove?.from === square || lastMove?.to === square}
                inputDisabled={inputDisabled}
                onClick={onSquareClick}
                pieceSet={pieceSet}
              />
            )
          })}
        </div>
        <div className="board-ranks board-ranks-right" aria-hidden="true">
          <span>8</span>
          <span>7</span>
          <span>6</span>
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
      </div>
      <div className="board-files" aria-hidden="true">
        <span>a</span>
        <span>b</span>
        <span>c</span>
        <span>d</span>
        <span>e</span>
        <span>f</span>
        <span>g</span>
        <span>h</span>
      </div>
    </div>
  )
}
